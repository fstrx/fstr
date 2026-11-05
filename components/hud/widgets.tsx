"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { listening } from "@/content/listening";
import { site } from "@/content/site";
import { useActiveWindow, WINDOW_IDS } from "@/lib/active-file";
import { useTokens } from "@/lib/hud";
import { useLocalTime } from "@/lib/local-time";
import { useCanvasLoop } from "./use-canvas-loop";

/* ── panel chrome ─────────────────────────────────────────── */

export function Panel({
  title,
  code,
  children,
  className = "",
}: {
  title: string;
  code?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`hud-corners relative px-3 pt-2.5 pb-3 ${className}`} aria-label={title}>
      <header className="mb-2.5 flex items-center gap-2">
        <span aria-hidden className="h-2.5 w-1 bg-accent" />
        <h3 className="hud-label text-fg">{title}</h3>
        <span aria-hidden className="hatch-faint h-2 flex-1" />
        {code && <span className="hud-label text-faint">{code}</span>}
      </header>
      {children}
    </section>
  );
}

/* ── id card ──────────────────────────────────────────────── */

export function IdCard() {
  const { time } = useLocalTime();
  return (
    <Panel title="ident" code="0xF5">
      <div className="flex gap-3">
        <div
          aria-hidden
          className="chamfer-sm hatch relative grid size-14 shrink-0 place-items-center border border-accent/60 bg-raised"
        >
          <span className="neon-text font-display text-[22px] font-semibold text-fg">
            f<span className="text-accent">/</span>
          </span>
        </div>
        <dl className="min-w-0 flex-1 space-y-0.5 text-[11px]">
          {[
            ["handle", site.alias],
            ["class", "sys // sec"],
            ["origin", site.location.split(",")[0].toLowerCase()],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2">
              <dt className="hud-label text-faint">{k}</dt>
              <dd className="truncate text-fg">{v}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-2">
            <dt className="hud-label text-faint">status</dt>
            <dd className="flex items-center gap-1.5 text-green">
              <span aria-hidden className="size-1.5 animate-blink bg-green" />
              awake
            </dd>
          </div>
        </dl>
      </div>
      <div className="mt-3 flex items-baseline justify-between border-t border-line pt-2">
        <span className="hud-label text-faint">local · {site.timezoneLabel}</span>
        <span suppressHydrationWarning className="neon-text font-display text-[20px] font-semibold text-yellow tabular-nums">
          {time}
        </span>
      </div>
    </Panel>
  );
}

/* ── telemetry (real numbers) ─────────────────────────────── */

const viewportSub = (cb: () => void) => {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
};
const viewport = () => `${window.innerWidth}×${window.innerHeight}`;

export function Telemetry() {
  const [fps, setFps] = useState<number[]>([]);
  const [uptime, setUptime] = useState(0);
  const vp = useSyncExternalStore(viewportSub, viewport, () => "—");
  const active = useActiveWindow();

  // fps sampler: counts rAF ticks, reports twice a second
  useEffect(() => {
    let raf = 0;
    let frames = 0;
    let since = performance.now();
    const tick = (now: number) => {
      frames++;
      if (now - since >= 500) {
        const v = Math.round((frames * 1000) / (now - since));
        frames = 0;
        since = now;
        setFps((s) => [...s.slice(-29), v]);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const started = Date.now();
    const id = window.setInterval(() => setUptime(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(id);
    };
  }, []);

  const current = fps.at(-1);
  const lo = Math.min(...fps, 60) - 8;
  const hi = Math.max(...fps, 60) + 4;
  const points = fps.map((v, i) => `${100 - ((fps.length - 1 - i) / 29) * 100},${22 - ((v - lo) / (hi - lo)) * 20}`).join(" ");
  const mm = String(Math.floor(uptime / 60)).padStart(2, "0");
  const ss = String(uptime % 60).padStart(2, "0");
  const idx = WINDOW_IDS.indexOf(active) + 1;

  return (
    <Panel title="telemetry" code="live">
      <div className="flex items-end justify-between">
        <div>
          <p className="hud-label text-faint">frame rate</p>
          <p className="font-display text-[22px] leading-none font-semibold text-fg tabular-nums">
            {current ?? "--"}
            <span className="ml-1 text-[11px] text-muted">fps</span>
          </p>
        </div>
        <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="h-7 w-28" aria-hidden>
          <line x1="0" y1="23" x2="100" y2="23" stroke="var(--line-strong)" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
          {fps.length > 1 && (
            <polyline points={points} fill="none" stroke="var(--blue)" strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
          )}
        </svg>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-2 text-[11px]">
        {[
          ["uptime", `${mm}:${ss}`],
          ["view", vp],
          ["win", `0x${idx.toString(16).padStart(2, "0")}`],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="hud-label text-faint">{k}</dt>
            <dd suppressHydrationWarning className="truncate text-fg tabular-nums">
              {v}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

/* ── oscilloscope (decorative) ────────────────────────────── */

export function Scope() {
  const tk = useTokens();
  const ref = useCanvasLoop((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    // grid
    ctx.strokeStyle = tk.line;
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += w / 8) {
      ctx.beginPath();
      ctx.moveTo(Math.round(x) + 0.5, 0);
      ctx.lineTo(Math.round(x) + 0.5, h);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, h / 2 + 0.5);
    ctx.lineTo(w, h / 2 + 0.5);
    ctx.stroke();
    // two traces
    const trace = (color: string, amp: number, f1: number, f2: number, phase: number) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.4;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const p = x / w;
        const env = 0.55 + 0.45 * Math.sin(t * 1.3 + p * 3);
        const y =
          h / 2 +
          (Math.sin(p * f1 + t * 4 + phase) * 0.6 + Math.sin(p * f2 - t * 7) * 0.3 + Math.sin(p * 61 + t * 13) * 0.08) *
            amp *
            env;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    };
    trace(tk.blue, h * 0.32, 18, 41, 0);
    trace(tk.accent, h * 0.22, 27, 9, 1.4);
  }, 30);

  return (
    <Panel title="audio // in" code="ch1·ch2">
      <canvas ref={ref} aria-hidden className="block h-16 w-full" />
      <p className="mt-2 flex items-center justify-between text-[11px]">
        <span className="truncate text-muted">
          ♪ {listening[0].artist.toLowerCase()} — {listening[0].album.toLowerCase()}
        </span>
        <span className="hud-label text-accent">rec</span>
      </p>
    </Panel>
  );
}

/* ── radar sweep (decorative) ─────────────────────────────── */

const BLIPS = [
  [0.62, 0.8],
  [0.35, 2.4],
  [0.8, 3.7],
  [0.5, 5.1],
] as const;

export function Radar() {
  const tk = useTokens();
  const ref = useCanvasLoop((ctx, w, h, t) => {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2 - 4;
    ctx.strokeStyle = tk.line;
    ctx.lineWidth = 1;
    for (const k of [1, 0.66, 0.33]) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * k, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx, cy + r);
    ctx.stroke();

    const sweep = (t * 1.6) % (Math.PI * 2);
    // fading wedge behind the beam
    for (let i = 0; i < 24; i++) {
      const a = sweep - i * 0.04;
      ctx.strokeStyle = tk.green;
      ctx.globalAlpha = 0.5 * (1 - i / 24);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // blips light up as the beam passes, then fade
    for (const [dist, ang] of BLIPS) {
      const since = (sweep - ang + Math.PI * 2) % (Math.PI * 2);
      const a = Math.max(0, 1 - since / 3);
      if (a <= 0) continue;
      ctx.globalAlpha = a;
      ctx.fillStyle = tk.accent;
      ctx.shadowColor = tk.accent;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(ang) * r * dist, cy + Math.sin(ang) * r * dist, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }, 30);

  return (
    <Panel title="net scan" code="bhopal.node">
      <div className="flex items-center gap-3">
        <canvas ref={ref} aria-hidden className="block size-24 shrink-0" />
        <dl className="min-w-0 flex-1 space-y-1 text-[11px]">
          {[
            ["ports", "0 open"],
            ["ice", "nominal"],
            ["trace", "none"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2">
              <dt className="hud-label text-faint">{k}</dt>
              <dd className="text-fg">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Panel>
  );
}

/* ── build loader (indeterminate) ─────────────────────────── */

export function BuildLoader() {
  return (
    <Panel title="building" code="aedura">
      <div className="seg run" aria-hidden>
        {Array.from({ length: 16 }, (_, i) => (
          <i key={i} style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      <p className="mt-2 flex justify-between text-[11px]">
        <span className="text-muted">co-founder &amp; cto</span>
        <span className="hud-label text-yellow">in progress</span>
      </p>
    </Panel>
  );
}
