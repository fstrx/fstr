"use client";

import { useEffect, useRef } from "react";

/**
 * Drives a small HiDPI canvas: calls draw(ctx, w, h, t) at `fps`, pauses
 * when off-screen or the tab is hidden, and draws a single still frame
 * under prefers-reduced-motion. `draw` can change between renders (e.g.
 * new theme colours) without restarting the loop.
 */
export function useCanvasLoop(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void,
  fps = 30,
) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
  });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: width, h: height };
    };
    let size = fit();
    const ro = new ResizeObserver(() => {
      size = fit();
    });
    ro.observe(canvas);

    const frame = (t: number) => drawRef.current(ctx, size.w, size.h, t / 1000);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame(1.7);
      return () => ro.disconnect();
    }

    let raf = 0;
    let last = 0;
    let visible = true;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden || now - last < 1000 / fps) return;
      last = now;
      frame(now);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [fps]);

  return ref;
}
