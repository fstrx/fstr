"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Rotary knob. Drag up/down, scroll, or use the keyboard (arrows,
 * PageUp/Down, Home/End). Double-click resets. Exposed as role="slider".
 * `labels` turns it into a detented selector (one detent per label).
 */

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  labels?: string[];
  format?: (v: number) => string;
  onChange: (v: number) => void;
};

const SWEEP = 270; // degrees of travel
const START = -135;
const SIZE = 60;
const R = 22; // dial radius
const C = SIZE / 2;

function polar(deg: number, r: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
}

function arc(from: number, to: number, r: number) {
  const [x1, y1] = polar(from, r);
  const [x2, y2] = polar(to, r);
  const large = to - from > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

export function Knob({ label, value, min, max, step = 1, defaultValue, labels, format, onChange }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ y: number; v: number } | null>(null);
  const id = useId();

  const span = max - min;
  const t = span === 0 ? 0 : (value - min) / span;
  const angle = START + t * SWEEP;
  const ticks = labels ? labels.length : 11;
  const text = labels ? labels[Math.round(value - min)] : format ? format(value) : String(value);

  const clamp = (v: number) => {
    const snapped = Math.round((v - min) / step) * step + min;
    return Math.min(max, Math.max(min, Number(snapped.toFixed(4))));
  };
  const set = (v: number) => {
    const next = clamp(v);
    if (next !== value) onChange(next);
  };

  // wheel needs a non-passive listener to preventDefault page scroll
  const latest = useRef({ value, set, span, step });
  useEffect(() => {
    latest.current = { value, set, span, step };
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { value: v, set: s, step: st } = latest.current;
      s(v + (e.deltaY < 0 ? st : -st));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1.5 select-none">
      <span id={`${id}-l`} className="hud-label text-muted">
        {label}
      </span>
      <svg
        ref={ref}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="slider"
        tabIndex={0}
        aria-labelledby={`${id}-l`}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={text}
        className={`cursor-ns-resize touch-none outline-none focus-visible:drop-shadow-[0_0_6px_var(--accent)] ${dragging ? "drop-shadow-[0_0_8px_var(--accent)]" : ""}`}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { y: e.clientY, v: value };
          setDragging(true);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          // 140px of travel = full range
          set(drag.current.v + ((drag.current.y - e.clientY) / 140) * span);
        }}
        onPointerUp={() => {
          drag.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
        onDoubleClick={() => defaultValue !== undefined && set(defaultValue)}
        onKeyDown={(e) => {
          const big = Math.max(step, span / 5);
          let next: number | null = null;
          if (e.key === "ArrowUp" || e.key === "ArrowRight") next = value + step;
          else if (e.key === "ArrowDown" || e.key === "ArrowLeft") next = value - step;
          else if (e.key === "PageUp") next = value + big;
          else if (e.key === "PageDown") next = value - big;
          else if (e.key === "Home") next = min;
          else if (e.key === "End") next = max;
          if (next === null) return;
          e.preventDefault();
          e.stopPropagation(); // don't let digits/arrows reach window shortcuts
          set(next);
        }}
      >
        {/* tick ring */}
        {Array.from({ length: ticks }, (_, i) => {
          const a = START + (i / (ticks - 1)) * SWEEP;
          const [x1, y1] = polar(a, R + 4);
          const [x2, y2] = polar(a, R + (labels ? 8 : 6));
          const lit = i / (ticks - 1) <= t + 1e-6;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={lit ? "var(--accent)" : "var(--line-strong)"}
              strokeWidth={labels ? 2 : 1.25}
            />
          );
        })}
        {/* track + value arc */}
        <path d={arc(START, START + SWEEP, R)} fill="none" stroke="var(--line-strong)" strokeWidth={2} />
        {t > 0.001 && (
          <path
            d={arc(START, angle, R)}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2}
            style={{ filter: "drop-shadow(0 0 calc(3px * var(--glow, 1)) var(--accent))" }}
          />
        )}
        {/* body */}
        <circle cx={C} cy={C} r={R - 5} fill="var(--raised)" stroke="var(--line-strong)" />
        <circle cx={C} cy={C} r={R - 10} fill="none" stroke="var(--line)" strokeDasharray="2 3" />
        {/* pointer */}
        {(() => {
          const [x1, y1] = polar(angle, 5);
          const [x2, y2] = polar(angle, R - 6);
          return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--yellow)" strokeWidth={2} strokeLinecap="square" />;
        })()}
        <circle cx={C} cy={C} r={2} fill="var(--yellow)" />
      </svg>
      <span className="hud-label min-w-[4ch] text-center text-fg tabular-nums">{text}</span>
    </div>
  );
}
