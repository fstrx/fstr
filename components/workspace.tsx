"use client";

import { GitBranch } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { openWindow, stepWindow, useActiveWindow, WINDOW_IDS, type WindowId } from "@/lib/active-file";
import { files, outline, type EditorFile, type FileId } from "@/lib/files";
import { highlight } from "@/lib/highlight";
import { useSplit } from "@/lib/split";
import { runCommand, type Message } from "@/lib/vim";
import { CodeView, Ruler } from "./editor/code-view";
import { Splitter } from "./splitter";

/**
 * tmux-ish workspace. One window visible at a time (driven by the URL
 * hash / tmux bar). File windows are split: code on the left, its render
 * on the right. On small screens the split collapses to a render|code toggle.
 * Every window stays in the DOM (hidden), so all content is in the HTML.
 */

const HIGHLIGHTED = Object.fromEntries(files.map((f) => [f.id, highlight(f.source, f.lang)])) as Record<
  FileId,
  ReturnType<typeof highlight>
>;
const OUTLINES = Object.fromEntries(files.map((f) => [f.id, outline(f.source, f.lang)])) as Record<
  FileId,
  ReturnType<typeof outline>
>;
const LANG_LABEL = { ts: "typescript", txt: "plain text" } as const;
const FILE_BY_ID = Object.fromEntries(files.map((f) => [f.id, f])) as Record<FileId, EditorFile>;

type Cursor = { line: number; col: number };
type View = "render" | "code";

const initialCursors = () =>
  Object.fromEntries(files.map((f) => [f.id, { line: f.cursor, col: 1 }])) as Record<FileId, Cursor>;

function PaneHeader({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex h-8 shrink-0 items-center justify-between gap-3 border-b border-line px-4 text-[11px] whitespace-nowrap">
      <div className="flex min-w-0 items-center gap-1.5 overflow-hidden text-faint">{children}</div>
      {right && <div className="shrink-0 text-micro uppercase text-faint">{right}</div>}
    </div>
  );
}

export function Workspace({ renders, shell }: { renders: Record<FileId, React.ReactNode>; shell: React.ReactNode }) {
  const active = useActiveWindow();
  const split = useSplit();
  const file = active === "shell" ? null : FILE_BY_ID[active];

  const [cursors, setCursors] = useState(initialCursors);
  const [view, setView] = useState<View>("render");
  const [command, setCommand] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const setCursor = useCallback(
    (line: number, col = 1) => {
      if (!file) return;
      const max = HIGHLIGHTED[file.id].length;
      setCursors((c) => ({ ...c, [file.id]: { line: Math.min(Math.max(1, line), max), col } }));
    },
    [file],
  );
  const cursor = file ? cursors[file.id] : null;

  // status-bar messages fade after a few seconds
  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(() => setMessage(null), 4500);
    return () => window.clearTimeout(id);
  }, [message]);

  // entering the shell window on desktop → focus the prompt
  useEffect(() => {
    if (active !== "shell" || !window.matchMedia("(min-width: 1024px)").matches) return;
    document.querySelector<HTMLInputElement>("#win-shell input")?.focus({ preventScroll: true });
  }, [active]);

  // global keys — never while typing somewhere
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      const inCode = !!document.activeElement?.closest("[data-code-pane]");

      const n = Number(e.key);
      // preventDefault so the key itself doesn't land in a just-focused input (e.g. 7 → shell)
      if (Number.isInteger(n) && n >= 1 && n <= WINDOW_IDS.length) {
        e.preventDefault();
        openWindow(WINDOW_IDS[n - 1]);
      } else if (e.key === "]" || e.key === "[") {
        e.preventDefault();
        stepWindow(e.key === "]" ? 1 : -1);
      }
      else if (e.key === ":" && file) {
        e.preventDefault();
        setMessage(null);
        setCommand("");
      } else if (inCode && cursor && (e.key === "j" || e.key === "ArrowDown")) {
        e.preventDefault();
        setCursor(cursor.line + 1);
      } else if (inCode && cursor && (e.key === "k" || e.key === "ArrowUp")) {
        e.preventDefault();
        setCursor(cursor.line - 1);
      } else if (inCode && e.key === "g") setCursor(1);
      else if (inCode && file && e.key === "G") setCursor(HIGHLIGHTED[file.id].length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cursor, file, setCursor]);

  // keep the cursor line visible when moved with the keyboard
  useEffect(() => {
    if (!file || !cursor) return;
    const pane = rootRef.current?.querySelector<HTMLElement>(`[data-code-pane="${file.id}"]`);
    const el = pane?.querySelector<HTMLElement>(`[data-line="${cursor.line}"]`);
    if (!pane || !el) return;
    const top = el.offsetTop;
    if (top < pane.scrollTop + 24 || top > pane.scrollTop + pane.clientHeight - 48) {
      pane.scrollTop = top - pane.clientHeight / 2;
    }
  }, [cursor, file]);

  function submitCommand() {
    const msg = runCommand(command ?? "", { setLine: (n) => setCursor(n) });
    setCommand(null);
    setMessage(msg);
  }

  return (
    <div
      ref={rootRef}
      className="flex min-h-0 flex-1 flex-col"
      style={{ "--split": `${split}%` } as React.CSSProperties}
    >
      {WINDOW_IDS.map((id) => (
        <section
          key={id}
          id={`win-${id}`}
          hidden={id !== active}
          aria-label={`${id} window`}
          className="flex min-h-0 flex-1 flex-col"
        >
          {id === "shell" ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <PaneHeader right="zsh">
                <span className="text-green">{site.handle}</span>
                <span>~</span>
              </PaneHeader>
              <div className="scroll-quiet min-h-0 flex-1 overflow-auto px-4 py-6 sm:px-8">{shell}</div>
            </div>
          ) : (
            <FileWindow
              file={FILE_BY_ID[id]}
              view={view}
              onView={setView}
              cursorLine={cursors[id].line}
              onCursor={(line, col) => setCursors((c) => ({ ...c, [id]: { line, col } }))}
            >
              {renders[id]}
            </FileWindow>
          )}
        </section>
      ))}

      {file && cursor && (
        <StatusBar
          hideOnMobile={view === "render" && command === null}
          file={file}
          cursor={cursor}
          command={command}
          message={message}
          onCommandChange={setCommand}
          onCommandSubmit={submitCommand}
          onCommandCancel={() => setCommand(null)}
        />
      )}
    </div>
  );
}

function FileWindow({
  file,
  view,
  onView,
  cursorLine,
  onCursor,
  children,
}: {
  file: EditorFile;
  view: View;
  onView: (v: View) => void;
  cursorLine: number;
  onCursor: (line: number, col: number) => void;
  children: React.ReactNode;
}) {
  const symbol = [...OUTLINES[file.id]].reverse().find((s) => s.line <= cursorLine);
  const hexId = `0x${(files.indexOf(file) + 1).toString(16).padStart(2, "0")}`;
  const runner = file.lang === "ts" ? "bun run" : "cat";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* small screens: one pane at a time */}
      <div role="group" aria-label="view" className="flex h-8 shrink-0 border-b border-line text-[11.5px] lg:hidden">
        {(["render", "code"] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => onView(v)}
            className="relative px-4 text-muted aria-pressed:text-fg"
          >
            {view === v && <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-accent" />}
            {v}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,var(--split))_1px_minmax(0,1fr)]">
        {/* code */}
        <div className={`min-h-0 min-w-0 flex-col lg:flex ${view === "code" ? "flex" : "hidden"}`}>
          <PaneHeader
            right={
              <span>
                <span className={file.lang === "ts" ? "text-blue" : "text-green"}>{file.lang}</span> · {hexId}
              </span>
            }
          >
            <span className="text-muted">nvim</span>
            <span aria-hidden>·</span>
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
          </PaneHeader>
          <Ruler />
          <div
            data-code-pane={file.id}
            tabIndex={0}
            aria-label={`${file.path}, source`}
            className="scroll-quiet relative min-h-0 flex-1 overflow-auto bg-surface outline-none"
          >
            <CodeView
              lines={HIGHLIGHTED[file.id]}
              cursorLine={cursorLine}
              label={`${file.path} source`}
              onCursor={onCursor}
            />
          </div>
        </div>

        <Splitter label="resize code and render panes" />

        {/* render */}
        <div className={`min-h-0 min-w-0 flex-col lg:flex ${view === "render" ? "flex" : "hidden"}`}>
          <PaneHeader right={`render · ${hexId}`}>
            <span className="text-accent">›</span>
            <span className="text-muted">
              {runner} {file.path}
            </span>
          </PaneHeader>
          <div className="scroll-quiet min-h-0 flex-1 overflow-auto">
            <div className="mx-auto max-w-[760px] px-4 py-8 sm:px-10 sm:py-12">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBar({
  hideOnMobile,
  file,
  cursor,
  command,
  message,
  onCommandChange,
  onCommandSubmit,
  onCommandCancel,
}: {
  hideOnMobile: boolean;
  file: EditorFile;
  cursor: Cursor;
  command: string | null;
  message: Message;
  onCommandChange: (v: string) => void;
  onCommandSubmit: () => void;
  onCommandCancel: () => void;
}) {
  const inCommand = command !== null;

  return (
    <div
      className={`h-7 shrink-0 items-stretch border-t border-line bg-bg text-[11px] ${hideOnMobile ? "hidden lg:flex" : "flex"}`}
    >
      <span
        className={`neon-box relative z-[1] flex items-center px-3 text-[10px] font-medium tracking-[0.08em] text-bg ${
          inCommand ? "bg-green" : "bg-accent"
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
            {message?.text ?? file.path}
          </span>
          <span className="flex items-center gap-4 px-3 text-muted tabular-nums">
            <span className="hidden text-faint xl:inline">
              1–{WINDOW_IDS.length} window · [ ] cycle · : cmd
            </span>
            <span>
              Ln {cursor.line}, Col {cursor.col}
            </span>
            <span className="hidden md:inline">{LANG_LABEL[file.lang]}</span>
          </span>
        </>
      )}
    </div>
  );
}

export type { WindowId };
