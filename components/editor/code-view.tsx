"use client";

import { memo } from "react";
import type { Token } from "@/lib/highlight";

type Props = {
  lines: Token[][];
  cursorLine: number;
  label: string;
  onCursor: (line: number, col: number) => void;
};

function TokenSpan({ t }: { t: Token }) {
  if (t.href) {
    // keep any quotes as code, make only the url itself clickable
    const q = /^["'`]/.test(t.value) ? t.value[0] : "";
    return (
      <span className="tok-string">
        {q}
        <a
          href={t.href}
          target={t.href.startsWith("mailto:") ? undefined : "_blank"}
          rel="noopener noreferrer"
          className="underline decoration-current/30 underline-offset-[3px] transition-colors hover:text-fg hover:decoration-fg"
        >
          {q ? t.value.slice(1, -1) : t.value}
        </a>
        {q}
      </span>
    );
  }
  return <span className={`tok-${t.type}`}>{t.value}</span>;
}

/** gutter width in ch — the ruler reads this too */
export const GUTTER_CH = 5;

function CodeViewImpl({ lines, cursorLine, label, onCursor }: Props) {
  function handleMouseUp(e: React.MouseEvent<HTMLElement>) {
    const row = (e.target as HTMLElement).closest<HTMLElement>("[data-line]");
    if (!row) return;
    const line = Number(row.dataset.line);
    const cell = row.lastElementChild as HTMLElement | null;
    let col = 1;
    const sel = window.getSelection();
    if (cell && sel?.focusNode && cell.contains(sel.focusNode)) {
      const r = document.createRange();
      r.setStart(cell, 0);
      r.setEnd(sel.focusNode, sel.focusOffset);
      col = r.toString().length + 1;
    }
    onCursor(line, col);
  }

  return (
    <pre
      aria-label={label}
      onMouseUp={handleMouseUp}
      className="py-3 text-[12px] leading-[1.75] sm:text-[13px]"
    >
      <code className="block">
        {lines.map((tokens, i) => {
          const n = i + 1;
          const active = n === cursorLine;
          const indent = (tokens[0]?.value.match(/^ */)?.[0].length ?? 0) + 2;
          return (
            <span
              key={n}
              data-line={n}
              className={`group grid cursor-text ${active ? "bg-fg/[0.05]" : "hover:bg-fg/[0.025]"}`}
              style={{ gridTemplateColumns: `${GUTTER_CH}ch minmax(0,1fr)` }}
            >
              <span
                aria-hidden
                className={`select-none pr-[1.5ch] text-right tabular-nums ${active ? "text-fg" : "text-faint"}`}
              >
                {n}
              </span>
              <span
                className="whitespace-pre-wrap break-words pr-4"
                style={{ paddingLeft: `${indent}ch`, textIndent: `-${indent}ch` }}
              >
                {tokens.length ? tokens.map((t, j) => <TokenSpan key={j} t={t} />) : "​"}
              </span>
            </span>
          );
        })}
      </code>
    </pre>
  );
}

export const CodeView = memo(CodeViewImpl);

/** column ruler, like the axis on a technical drawing */
export function Ruler() {
  const marks = Array.from({ length: 16 }, (_, i) => (i + 1) * 5);
  return (
    <div
      aria-hidden
      className="relative hidden h-5 select-none overflow-hidden border-b border-line text-[13px] sm:block"
      style={{ marginLeft: `${GUTTER_CH}ch` }}
    >
      {marks.map((c) => (
        <span
          key={c}
          className="absolute bottom-0 w-px bg-line-strong"
          style={{ left: `${c - 1}ch`, height: c % 10 === 0 ? 7 : 4 }}
        >
          {c % 20 === 0 && (
            <span className="absolute bottom-[8px] left-0 -translate-x-1/2 text-[9px] leading-none text-faint">
              {c}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
