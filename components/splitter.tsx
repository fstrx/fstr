"use client";

import { useRef, useState } from "react";
import { setSplit, SPLIT_DEFAULT, SPLIT_MAX, SPLIT_MIN, useSplit } from "@/lib/split";

/**
 * Vertical divider between the code and render panes (desktop only).
 * Drag, arrow keys, Home/End, double-click to reset.
 */
export function Splitter({ label }: { label: string }) {
  const split = useSplit();
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function fromClientX(x: number) {
    const grid = ref.current?.parentElement;
    if (!grid) return;
    const r = grid.getBoundingClientRect();
    setSplit(((x - r.left) / r.width) * 100, false);
  }

  function end() {
    setDragging(false);
    document.documentElement.classList.remove("is-resizing");
    setSplit(split); // persist the final value
  }

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuemin={SPLIT_MIN}
      aria-valuemax={SPLIT_MAX}
      aria-valuenow={Math.round(split)}
      tabIndex={0}
      title="drag to resize · double-click to reset"
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
        document.documentElement.classList.add("is-resizing");
      }}
      onPointerMove={(e) => dragging && fromClientX(e.clientX)}
      onPointerUp={end}
      onPointerCancel={end}
      onDoubleClick={() => setSplit(SPLIT_DEFAULT)}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 10 : 2;
        if (e.key === "ArrowLeft") setSplit(split - step);
        else if (e.key === "ArrowRight") setSplit(split + step);
        else if (e.key === "Home") setSplit(SPLIT_MIN);
        else if (e.key === "End") setSplit(SPLIT_MAX);
        else if (e.key === "Enter") setSplit(SPLIT_DEFAULT);
        else return;
        e.preventDefault();
      }}
      className="group relative z-10 hidden cursor-col-resize touch-none bg-line outline-none lg:block"
    >
      {/* wider invisible hit area */}
      <span aria-hidden className="absolute inset-y-0 -left-[5px] -right-[5px]" />
      {/* hover / drag / focus highlight */}
      <span
        aria-hidden
        className={`absolute inset-y-0 -left-px w-[3px] transition-colors group-hover:bg-accent/60 group-focus-visible:bg-accent ${
          dragging ? "bg-accent" : ""
        }`}
      />
      {/* grip */}
      <span
        aria-hidden
        className={`absolute top-1/2 left-1/2 flex h-8 w-[7px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-[3px] border border-line bg-bg transition-colors group-hover:border-accent/60 ${
          dragging ? "border-accent" : ""
        }`}
      >
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-[1px] bg-faint" />
        ))}
      </span>
    </div>
  );
}
