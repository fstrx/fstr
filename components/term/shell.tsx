"use client";

import { useRef, useState } from "react";
import { site } from "@/content/site";
import { openWindow } from "@/lib/active-file";
import { files } from "@/lib/files";
import { COMMANDS, run, type Effect, type Line } from "@/lib/shell";
import { setTheme, toggleTheme } from "@/lib/theme";

type Entry = { cmd: string; lines: Line[] };

const TONE: Record<NonNullable<Line["tone"]>, string> = {
  muted: "text-muted",
  accent: "text-accent",
  green: "text-green",
  fg: "text-fg",
};

function apply(effect: Effect) {
  switch (effect.kind) {
    case "window":
      openWindow(effect.id);
      break;
    case "theme":
      if (effect.theme) setTheme(effect.theme);
      else toggleTheme();
      break;
  }
}

function complete(value: string) {
  const parts = value.split(/\s+/);
  if (parts.length === 1) {
    const hits = COMMANDS.filter((c) => c.startsWith(parts[0]));
    return hits.length === 1 ? `${hits[0]} ` : value;
  }
  const last = parts[parts.length - 1];
  const hits = files.map((f) => f.name).filter((n) => n.startsWith(last));
  if (hits.length !== 1) return value;
  parts[parts.length - 1] = hits[0];
  return parts.join(" ");
}

function Output({ line }: { line: Line }) {
  const cls = `block whitespace-pre-wrap break-words ${TONE[line.tone ?? "fg"]}`;
  if (line.href)
    return (
      <a
        href={line.href}
        target={line.href.startsWith("mailto:") ? undefined : "_blank"}
        rel="noopener noreferrer"
        className={`${cls} underline decoration-current/30 underline-offset-[3px] hover:decoration-current`}
      >
        {line.text}
      </a>
    );
  return <span className={cls}>{line.text}</span>;
}

/** an optional, tiny shell. nothing on the site requires it. */
export function Shell() {
  // start with a neofetch so the window isn't empty (deterministic → SSR-safe)
  const [entries, setEntries] = useState<Entry[]>(() => [{ cmd: "neofetch", lines: run("neofetch", []).lines }]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    const cmd = value;
    const nextHistory = cmd.trim() ? [...history, cmd.trim()] : history;
    const res = run(cmd, nextHistory);
    setHistory(nextHistory);
    setCursor(null);
    setValue("");
    if (res.effect?.kind === "clear") {
      setEntries([]);
      return;
    }
    setEntries((e) => [...e, { cmd, lines: res.lines }].slice(-30));
    if (res.effect) apply(res.effect);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Tab" && value) {
      e.preventDefault();
      setValue(complete(value));
    } else if (e.key === "ArrowUp" && history.length) {
      e.preventDefault();
      const i = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(i);
      setValue(history[i]);
    } else if (e.key === "ArrowDown" && cursor !== null) {
      e.preventDefault();
      const i = cursor + 1;
      if (i >= history.length) {
        setCursor(null);
        setValue("");
      } else {
        setCursor(i);
        setValue(history[i]);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    }
  }

  return (
    <section
      id="shell"
      aria-label="interactive shell"
      className="min-h-full cursor-text text-[12.5px] leading-[1.7]"
      onClick={() => {
        if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true });
      }}
    >
      <p className="text-muted">
        <span className="text-accent">#</span> this one&apos;s live. type <span className="text-fg">help</span>, or
        don&apos;t: the tmux bar below does everything with clicks.
      </p>

      <div aria-live="polite" className="mt-3">
        {entries.map((entry, i) => (
          <div key={i} className="mb-2">
            <p>
              <span className="text-green">{site.handle}</span> <span className="text-faint">~</span>{" "}
              <span className="text-accent">›</span> <span className="text-fg">{entry.cmd}</span>
            </p>
            {entry.lines.map((l, j) => (
              <Output key={j} line={l} />
            ))}
          </div>
        ))}
      </div>

      <label className="flex items-baseline gap-[1ch]">
        <span className="shrink-0">
          <span className="text-green">{site.handle}</span> <span className="text-faint">~</span>{" "}
          <span className="text-accent">›</span>
        </span>
        <span className="sr-only">shell command</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          enterKeyHint="go"
          placeholder="help"
          className="min-w-0 flex-1 bg-transparent text-fg caret-accent outline-none placeholder:text-faint"
        />
      </label>
    </section>
  );
}
