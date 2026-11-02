"use client";

import { ChevronDown, GitBranch } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { openFile, scrollToEditor, stepFile, useActiveFile } from "@/lib/active-file";
import { files, FILE_IDS, isFileId, outline, type FileId } from "@/lib/files";
import { highlight } from "@/lib/highlight";
import { setTheme, toggleTheme } from "@/lib/theme";
import { site } from "@/content/site";
import { CodeView, Ruler } from "./code-view";
import { outputs } from "./output";

// static content → highlight once at module load
const HIGHLIGHTED = Object.fromEntries(files.map((f) => [f.id, highlight(f.source, f.lang)])) as Record<
  FileId,
  ReturnType<typeof highlight>
>;
const OUTLINES = Object.fromEntries(files.map((f) => [f.id, outline(f.source, f.lang)])) as Record<
  FileId,
  ReturnType<typeof outline>
>;

type Cursor = { line: number; col: number };
type Message = { text: string; error?: boolean } | null;

const DIRS = [...new Set(files.map((f) => f.dir))];
const LANG_LABEL = { ts: "typescript", txt: "plain text" } as const;

function FileIcon({ lang }: { lang: "ts" | "txt" }) {
  return lang === "ts" ? (
    <span className="w-4 text-[9px] font-medium text-blue">TS</span>
  ) : (
    <span className="w-4 text-[10px] font-medium text-green">#</span>
  );
}

const initialCursors = () =>
  Object.fromEntries(files.map((f) => [f.id, { line: f.cursor, col: 1 }])) as Record<FileId, Cursor>;

/* ── :commands (the easter egg) ──────────────────────────── */

function runCommand(raw: string, ctx: { setLine: (n: number) => void }): Message {
  const input = raw.trim().replace(/^:/, "");
  if (!input) return null;
  const [name, ...args] = input.split(/\s+/);
  const arg = args.join(" ");

  if (/^\d+$/.test(name)) {
    ctx.setLine(Number(name));
    return null;
  }

  switch (name) {
    case "e":
    case "edit":
    case "open":
    case "b": {
      const id = arg.replace(/^.*\//, "").replace(/\.(ts|txt)$/, "");
      const f = files.find((x) => x.id === id);
      if (f) {
        openFile(f.id);
        return { text: `"${f.path}" opened` };
      }
      return { text: arg ? `E212: can't open file "${arg}"` : "E32: no file name", error: true };
    }
    case "ls":
    case "files":
      return { text: files.map((f, i) => `${i + 1} ${f.name}`).join("   ") };
    case "theme":
    case "colorscheme":
    case "colo":
      if (arg === "light" || arg === "dark") {
        setTheme(arg);
        return { text: `theme: ${arg}` };
      }
      return { text: `theme: ${toggleTheme()}` };
    case "set":
      if (/^(bg|background)=(light|dark)$/.test(arg)) {
        const t = arg.split("=")[1] as "light" | "dark";
        setTheme(t);
        return { text: `background=${t}` };
      }
      return { text: `E518: unknown option: ${arg || "(none)"}`, error: true };
    case "q":
    case "q!":
    case "qa":
    case "qa!":
    case "wq":
    case "wq!":
    case "x":
    case "exit":
      return { text: "E37: you can't quit the internet. (closing the tab works though)", error: true };
    case "w":
      return { text: "E45: 'readonly' option is set. this is my website, after all.", error: true };
    case "whoami":
      return { text: `${site.alias} — ${site.name.toLowerCase()}, ${site.location.toLowerCase()}` };
    case "sudo":
      return { text: `${site.alias} is not in the sudoers file. this incident will be reported.`, error: true };
    case "id":
      return { text: `uid=1000(${site.alias}) gid=1000(${site.alias}) groups=1000(${site.alias}),10(wheel)` };
    case "nmap":
      return { text: "1 host up. 0 interesting ports. it's a static site, there's nothing back here." };
    case "ssh":
      return { text: `${site.handle}: Permission denied (publickey).`, error: true };
    case "cat":
    case "less":
    case "vim":
    case "nvim":
      if (/^\/etc\/(shadow|sudoers)/.test(arg)) return { text: `${name}: ${arg}: Permission denied`, error: true };
      if (arg === "/etc/passwd")
        return { text: `root:x:0:0::/root:/bin/bash  ${site.alias}:x:1000:1000::/home/${site.alias}:/bin/zsh` };
      return runCommand(`e ${arg}`, ctx);
    case "help":
    case "h":
      return { text: ":e <file>  :ls  :<line>  :theme  :id  :whoami  :q   (there are a few more)" };
    default:
      return { text: `E492: not an editor command: ${input}`, error: true };
  }
}

/* ── editor ──────────────────────────────────────────────── */

export function Editor() {
  const active = useActiveFile();
  const file = files.find((f) => f.id === active)!;
  const lines = HIGHLIGHTED[active];
  const Output = outputs[active];

  const [cursors, setCursors] = useState(initialCursors);
  const cursor = cursors[active];
  const [command, setCommand] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<FileId, HTMLButtonElement | null>>>({});

  const setCursor = useCallback(
    (line: number, col = 1) => {
      const clamped = Math.min(Math.max(1, line), lines.length);
      setCursors((c) => ({ ...c, [active]: { line: clamped, col } }));
    },
    [active, lines.length],
  );

  // land on /#projects → bring the editor into view once
  useEffect(() => {
    if (isFileId(window.location.hash.slice(1))) scrollToEditor();
  }, []);

  // status-bar messages fade after a few seconds
  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(() => setMessage(null), 4500);
    return () => window.clearTimeout(id);
  }, [message]);

  // global keyboard shortcuts — never while typing somewhere
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;

      const inEditor = rootRef.current?.contains(document.activeElement) ?? false;

      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= FILE_IDS.length) {
        openFile(FILE_IDS[n - 1]);
      } else if (e.key === "]") {
        stepFile(1);
      } else if (e.key === "[") {
        stepFile(-1);
      } else if (e.key === ":") {
        e.preventDefault();
        setMessage(null);
        setCommand("");
      } else if (inEditor && (e.key === "j" || e.key === "ArrowDown")) {
        e.preventDefault();
        setCursor(cursor.line + 1);
      } else if (inEditor && (e.key === "k" || e.key === "ArrowUp")) {
        e.preventDefault();
        setCursor(cursor.line - 1);
      } else if (inEditor && e.key === "g") {
        setCursor(1);
      } else if (inEditor && e.key === "G") {
        setCursor(lines.length);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cursor.line, lines.length, setCursor]);

  // keep the cursor line visible when moved with the keyboard
  useEffect(() => {
    const el = rootRef.current?.querySelector<HTMLElement>(`[data-code] [data-line="${cursor.line}"]`);
    const pane = el?.closest<HTMLElement>("[data-code]");
    if (!el || !pane) return;
    const top = el.offsetTop; // pane is the offsetParent (position: relative)
    if (top < pane.scrollTop + 24 || top > pane.scrollTop + pane.clientHeight - 48) {
      pane.scrollTop = top - pane.clientHeight / 2;
    }
  }, [cursor.line, active]);

  // keep the active tab visible when the tab strip overflows
  useEffect(() => {
    const tab = tabRefs.current[active];
    const strip = tab?.parentElement;
    if (!tab || !strip) return;
    const left = tab.offsetLeft - strip.offsetLeft;
    if (left < strip.scrollLeft || left + tab.offsetWidth > strip.scrollLeft + strip.clientWidth) {
      strip.scrollLeft = left - 24;
    }
  }, [active]);

  function onTabKey(e: React.KeyboardEvent, i: number) {
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (i + 1) % files.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + files.length) % files.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = files.length - 1;
    if (next === null) return;
    e.preventDefault();
    const id = files[next].id;
    openFile(id);
    tabRefs.current[id]?.focus();
  }

  function submitCommand() {
    const msg = runCommand(command ?? "", { setLine: (n) => setCursor(n) });
    setCommand(null);
    setMessage(msg);
    rootRef.current?.focus();
  }

  const symbol = [...OUTLINES[active]].reverse().find((s) => s.line <= cursor.line);

  return (
    <section id="editor" aria-label="source files" className="scroll-mt-6">
      {/* drawing caption */}
      <div className="mb-2.5 flex items-baseline justify-between text-micro uppercase text-faint">
        <span>
          fig. 1 <span className="px-1 text-line-strong">—</span> ~/{site.alias}
        </span>
        <span className="hidden sm:inline">
          {files.length} files · utf-8 · lf
        </span>
      </div>

      <div
        ref={rootRef}
        tabIndex={-1}
        className="relative grid border border-line bg-surface outline-none lg:h-[600px] lg:grid-cols-[200px_minmax(0,1fr)_minmax(0,0.78fr)] lg:grid-rows-[minmax(0,1fr)_auto]"
      >
        <CornerTicks />

        {/* ── explorer ── */}
        <aside
          aria-label="explorer"
          className="hidden flex-col border-r border-line text-[12px] lg:flex"
        >
          <p className="px-4 pt-3.5 pb-2 text-micro uppercase text-faint">explorer</p>
          <div className="px-2">
            <p className="flex items-center gap-1 px-2 py-1 text-muted">
              <ChevronDown className="size-3" strokeWidth={1.5} aria-hidden /> {site.alias}
            </p>
            {DIRS.map((dir) => (
              <div key={dir}>
                <p className="flex items-center gap-1 px-2 py-1 pl-5 text-muted">
                  <ChevronDown className="size-3" strokeWidth={1.5} aria-hidden /> {dir}
                </p>
                <ul>
                  {files.map((f, i) =>
                    f.dir !== dir ? null : (
                      <li key={f.id}>
                        <button
                          type="button"
                          onClick={() => openFile(f.id)}
                          aria-current={f.id === active ? "true" : undefined}
                          className="flex w-full items-center gap-2 py-1 pr-2 pl-9 text-left text-muted transition-colors hover:bg-fg/[0.03] hover:text-fg aria-[current]:bg-fg/[0.05] aria-[current]:text-fg"
                        >
                          <FileIcon lang={f.lang} />
                          <span className="flex-1 truncate">{f.name}</span>
                          <span className="text-[10px] text-faint">{i + 1}</span>
                        </button>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-6 border-t border-line px-4 pt-3.5 pb-2 text-micro uppercase text-faint">
            outline
          </p>
          <ul className="px-2">
            {OUTLINES[active].map((s) => (
              <li key={s.line}>
                <button
                  type="button"
                  onClick={() => setCursor(s.line)}
                  className="flex w-full items-baseline gap-2 px-2 py-1 text-left text-muted transition-colors hover:text-fg"
                >
                  <span
                    className={`w-2.5 text-[10px] ${s.kind === "type" ? "text-blue" : s.kind === "field" ? "text-green" : "text-accent"}`}
                  >
                    {s.kind === "type" ? "T" : s.kind === "field" ? "#" : "ƒ"}
                  </span>
                  <span className="flex-1 truncate">{s.name}</span>
                  <span className="text-[10px] text-faint tabular-nums">L{s.line}</span>
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-auto px-4 pb-3.5 text-[10.5px] leading-relaxed text-faint">
            press <kbd className="text-muted">:</kbd> for commands
          </p>
        </aside>

        {/* ── code ── */}
        <div className="flex min-w-0 flex-col border-line lg:border-r">
          <div
            role="tablist"
            aria-label="files"
            className="scroll-quiet flex overflow-x-auto border-b border-line bg-bg/40"
          >
            {files.map((f, i) => {
              const selected = f.id === active;
              return (
                <button
                  key={f.id}
                  ref={(el) => {
                    tabRefs.current[f.id] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${f.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${f.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => openFile(f.id)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className={`relative flex shrink-0 items-center gap-1.5 border-r border-line px-3.5 py-2.5 text-[12px] transition-colors ${
                    selected ? "bg-surface text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  {selected && <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-accent" />}
                  <FileIcon lang={f.lang} />
                  {f.name}
                </button>
              );
            })}
          </div>

          {/* breadcrumb */}
          <div className="flex items-center gap-1.5 overflow-hidden px-4 py-1.5 text-[11px] whitespace-nowrap text-faint">
            <span>{site.alias}</span>
            <span aria-hidden>›</span>
            <span>{file.dir}</span>
            <span aria-hidden>›</span>
            <span className="text-muted">{file.name}</span>
            {symbol && (
              <>
                <span aria-hidden>›</span>
                <span className="text-muted">{symbol.name}</span>
              </>
            )}
          </div>

          <Ruler />

          <div
            role="tabpanel"
            id={`panel-${active}`}
            aria-labelledby={`tab-${active}`}
            data-code
            className="scroll-quiet relative max-h-[26rem] min-h-0 flex-1 overflow-auto lg:max-h-none"
          >
            <CodeView
              lines={lines}
              cursorLine={cursor.line}
              label={`${file.path} source`}
              onCursor={setCursor}
            />
          </div>
        </div>

        {/* ── terminal / output ── */}
        <div
          aria-live="polite"
          className="flex min-w-0 flex-col border-t border-line lg:border-t-0"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="text-micro uppercase text-muted">terminal</span>
            <span className="text-micro uppercase text-faint">zsh</span>
          </div>
          <div className="scroll-quiet min-h-0 flex-1 overflow-auto px-4 py-4 text-[12.5px] leading-[1.7]">
            <p className="text-faint">
              <span className="text-green">{site.handle}</span> ~/{site.alias}
            </p>
            <p className="mb-3 text-fg">
              <span className="text-accent">›</span> {file.lang === "ts" ? "bun run" : "cat"} {file.path}
            </p>
            <Output key={active} />
            <p className="mt-5 text-faint">
              <span className="text-green">{site.handle}</span> ~/{site.alias}
            </p>
            <p className="text-fg">
              <span className="text-accent">›</span>{" "}
              <span aria-hidden className="inline-block h-[1.05em] w-[0.6em] translate-y-[0.2em] animate-blink bg-fg/70" />
            </p>
          </div>
        </div>

        {/* ── status bar ── */}
        <StatusBar
          file={file.path}
          lang={LANG_LABEL[file.lang]}
          cursor={cursor}
          command={command}
          message={message}
          onCommandChange={setCommand}
          onCommandSubmit={submitCommand}
          onCommandCancel={() => {
            setCommand(null);
            rootRef.current?.focus();
          }}
        />
      </div>

      <p className="mt-2.5 hidden text-micro uppercase text-faint sm:block">
        <Kbd>1</Kbd>–<Kbd>{files.length}</Kbd> open file <Sep /> <Kbd>[</Kbd> <Kbd>]</Kbd> cycle <Sep />{" "}
        <Kbd>j</Kbd> <Kbd>k</Kbd> move line <Sep /> <Kbd>:</Kbd> command
      </p>
    </section>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="font-mono text-muted">{children}</kbd>;
}
function Sep() {
  return <span className="px-1.5 text-line-strong">·</span>;
}

function CornerTicks() {
  const base = "pointer-events-none absolute size-2 border-accent/70";
  return (
    <>
      <span aria-hidden className={`${base} -top-px -left-px border-t border-l`} />
      <span aria-hidden className={`${base} -top-px -right-px border-t border-r`} />
      <span aria-hidden className={`${base} -bottom-px -left-px border-b border-l`} />
      <span aria-hidden className={`${base} -right-px -bottom-px border-r border-b`} />
    </>
  );
}

/* ── status bar ──────────────────────────────────────────── */

function StatusBar({
  file,
  lang,
  cursor,
  command,
  message,
  onCommandChange,
  onCommandSubmit,
  onCommandCancel,
}: {
  file: string;
  lang: string;
  cursor: Cursor;
  command: string | null;
  message: Message;
  onCommandChange: (v: string) => void;
  onCommandSubmit: () => void;
  onCommandCancel: () => void;
}) {
  const inCommand = command !== null;

  return (
    <div className="flex h-7 items-stretch border-t border-line bg-bg/60 text-[11px] lg:col-span-3">
      <span
        className={`flex items-center px-3 text-[10px] font-medium tracking-[0.08em] ${
          inCommand ? "bg-green text-bg" : "bg-accent text-bg"
        }`}
      >
        {inCommand ? "COMMAND" : "NORMAL"}
      </span>

      {inCommand ? (
        <label className="flex min-w-0 flex-1 items-center px-3 text-fg">
          <span aria-hidden>:</span>
          <span className="sr-only">editor command</span>
          <input
            autoFocus
            value={command}
            onChange={(e) => onCommandChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCommandSubmit();
              if (e.key === "Escape") onCommandCancel();
            }}
            onBlur={() => !command && onCommandCancel()}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            className="min-w-0 flex-1 bg-transparent text-fg caret-accent outline-none"
            placeholder="help"
          />
        </label>
      ) : (
        <>
          <span className="hidden items-center gap-1.5 border-r border-line px-3 text-muted sm:flex">
            <GitBranch className="size-3" strokeWidth={1.5} aria-hidden /> main
          </span>
          <span
            role="status"
            className={`flex min-w-0 flex-1 items-center truncate px-3 ${
              message?.error ? "text-accent" : message ? "text-fg" : "text-muted"
            }`}
          >
            {message?.text ?? file}
          </span>
          <span className="flex items-center gap-4 px-3 text-muted tabular-nums">
            <span>
              Ln {cursor.line}, Col {cursor.col}
            </span>
            <span className="hidden md:inline">spaces: 2</span>
            <span className="hidden md:inline">{lang}</span>
          </span>
        </>
      )}
    </div>
  );
}
