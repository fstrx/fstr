"use client";

import { useEffect, useRef } from "react";

const GLYPHS = "!<>-_\\/[]{}=+*^?#01";

/**
 * Renders `text` normally (SSR / no-JS / reduced motion), then on mount
 * scrambles it and resolves left → right, like a terminal decoding output.
 */
export function DecodeText({ text, duration = 900, className }: { text: string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - t0) / duration);
      const settled = Math.floor(progress * text.length);
      let out = text.slice(0, settled);
      for (let i = settled; i < text.length; i++) {
        const c = text[i];
        out += c === " " || c === "·" ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      el.textContent = text;
    };
  }, [text, duration]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
