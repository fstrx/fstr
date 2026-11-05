"use client";

import { useEffect } from "react";
import { glitch, reducedMotion } from "@/lib/glitch";
import { applyNeon, glitchLevel } from "@/lib/hud";
import { matrixRunning } from "@/lib/matrix";

/** [min ms, max ms, chance of a medium glitch] per GLITCH knob level */
const SCHEDULE: Record<number, [number, number, number]> = {
  1: [18_000, 34_000, 0],
  2: [9_000, 22_000, 0.2],
  3: [3_500, 9_000, 0.45],
};

/** every so often, the whole page twitches. the GLITCH knob sets how often. */
export function GlitchFX() {
  const level = glitchLevel.use();

  // NEON knob value is applied once on load (the knob re-applies on change)
  useEffect(() => applyNeon(), []);

  useEffect(() => {
    if (level === 0 || reducedMotion()) return;
    const [min, max, medium] = SCHEDULE[level];
    let t = 0;
    const schedule = () => {
      t = window.setTimeout(
        () => {
          const root = document.documentElement;
          if (!document.hidden && !root.classList.contains("booting") && !matrixRunning()) {
            glitch(Math.random() < medium ? 2 : 1);
          }
          schedule();
        },
        min + Math.random() * (max - min),
      );
    };
    schedule();
    return () => window.clearTimeout(t);
  }, [level]);

  return null;
}
