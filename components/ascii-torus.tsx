"use client";

import { useEffect, useRef } from "react";

/**
 * A shaded torus rendered to text, every frame.
 * Parametric surface → rotate (A around x, B around z) → perspective
 * project → z-buffer → pick a glyph by surface normal · light.
 *
 * Writes straight to a <pre> via textContent, so React never re-renders.
 * Pauses off-screen / in background tabs; one still frame for reduced motion.
 */

const COLS = 54;
const ROWS = 22;
const RAMP = ".,-~:;=!*#$@";
const R1 = 1; // tube radius
const R2 = 2; // ring radius
const K2 = 5; // viewer distance
const K1 = (COLS * K2 * 3) / (8 * (R1 + R2));
const FPS = 24;

function render(A: number, B: number) {
  const chars = new Array<string>(COLS * ROWS).fill(" ");
  const zbuf = new Float32Array(COLS * ROWS);
  const cA = Math.cos(A), sA = Math.sin(A);
  const cB = Math.cos(B), sB = Math.sin(B);

  for (let t = 0; t < 6.283; t += 0.07) {
    const ct = Math.cos(t), st = Math.sin(t);
    const cx = R2 + R1 * ct; // point on the tube's circle
    const cy = R1 * st;

    for (let p = 0; p < 6.283; p += 0.02) {
      const cp = Math.cos(p), sp = Math.sin(p);

      const x = cx * (cB * cp + sA * sB * sp) - cy * cA * sB;
      const y = cx * (sB * cp - sA * cB * sp) + cy * cA * cB;
      const z = K2 + cA * cx * sp + cy * sA;
      const ooz = 1 / z;

      // chars are ~2x taller than wide, so squash y
      const xp = Math.floor(COLS / 2 + K1 * ooz * x);
      const yp = Math.floor(ROWS / 2 - K1 * ooz * y * 0.5);
      if (xp < 0 || xp >= COLS || yp < 0 || yp >= ROWS) continue;

      // luminance: normal · light(0, 1, -1)
      const L = cp * ct * sB - cA * ct * sp - sA * st + cB * (cA * st - ct * sA * sp);
      const i = xp + yp * COLS;
      if (L > 0 && ooz > zbuf[i]) {
        zbuf[i] = ooz;
        chars[i] = RAMP[Math.min(RAMP.length - 1, Math.floor(L * 8))];
      }
    }
  }

  let out = "";
  for (let r = 0; r < ROWS; r++) out += chars.slice(r * COLS, (r + 1) * COLS).join("") + "\n";
  return out;
}

const fmt = (rad: number) => ((rad % 6.283) + 6.283) % 6.283;

export function AsciiTorus() {
  const preRef = useRef<HTMLPreElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const pre = preRef.current;
    const readout = readoutRef.current;
    if (!pre) return;

    let A = 0.9;
    let B = 0.4;
    const draw = () => {
      pre.textContent = render(A, B);
      if (readout) readout.textContent = `a=${fmt(A).toFixed(2)} b=${fmt(B).toFixed(2)}`;
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    draw();
    if (reduced.matches) return;

    let raf = 0;
    let last = 0;
    let visible = true;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < 1000 / FPS) return;
      const dt = Math.min(now - last, 100) / 1000;
      last = now;
      A += 0.9 * dt;
      B += 0.45 * dt;
      draw();
    };
    const start = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(pre);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <figure className="chamfer hud-corners relative border border-line" aria-label="an ascii torus, slowly rotating">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5 hud-label">
        <span className="text-muted">fig. 0</span>
        <span className="text-faint">torus · r=1 R=2</span>
      </div>

      <pre
        ref={preRef}
        aria-hidden
        className="drafting overflow-hidden px-3 py-4 text-center text-[7.5px] leading-[1.15] text-blue/75 select-none sm:text-[9px] lg:text-[8.5px] xl:text-[9.5px]"
      >
        {/* SSR placeholder keeps the box from collapsing before hydration */}
        {(" ".repeat(COLS) + "\n").repeat(ROWS)}
      </pre>

      <figcaption className="flex items-center justify-between border-t border-line px-4 py-2 hud-label text-faint">
        <span ref={readoutRef} className="tabular-nums" suppressHydrationWarning>
          a=0.90 b=0.40
        </span>
        <span>{COLS}×{ROWS} · {FPS}fps</span>
      </figcaption>
    </figure>
  );
}
