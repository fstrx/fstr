"use client";

import { useEffect } from "react";
import { glitch, reducedMotion } from "@/lib/glitch";
import { matrixRunning } from "@/lib/matrix";

const MIN_MS = 9_000;
const MAX_MS = 22_000;

/** every so often, the whole page twitches. */
export function GlitchFX() {
  useEffect(() => {
    if (reducedMotion()) return;
    let t = 0;
    const schedule = () => {
      t = window.setTimeout(
        () => {
          const root = document.documentElement;
          if (!document.hidden && !root.classList.contains("booting") && !matrixRunning()) {
            glitch(Math.random() > 0.8 ? 2 : 1);
          }
          schedule();
        },
        MIN_MS + Math.random() * (MAX_MS - MIN_MS),
      );
    };
    schedule();
    return () => window.clearTimeout(t);
  }, []);
  return null;
}
