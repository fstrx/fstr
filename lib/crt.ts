/**
 * :crt easter egg. Pure CSS (see `html.crt` in globals.css); this just
 * flips classes on <html>. Not persisted — a reload turns it off.
 */

import { useSyncExternalStore } from "react";

export type CrtMode = "off" | "on" | "green" | "amber";
export const CRT_MODES: CrtMode[] = ["off", "on", "green", "amber"];

const MODES = ["crt", "crt-green", "crt-amber", "crt-boot"];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** for the HUD knob: re-renders when :crt / the knob changes the mode */
export function useCrt(): CrtMode {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getCrt,
    () => "off",
  );
}

export function getCrt(): CrtMode {
  const c = document.documentElement.classList;
  if (!c.contains("crt")) return "off";
  return c.contains("crt-green") ? "green" : c.contains("crt-amber") ? "amber" : "on";
}

export function setCrt(mode: CrtMode): CrtMode {
  const root = document.documentElement;
  const wasOff = getCrt() === "off";
  root.classList.remove(...MODES);
  if (mode === "off") {
    emit();
    return mode;
  }

  root.classList.add("crt");
  if (mode !== "on") root.classList.add(`crt-${mode}`);

  // power-on animation only when the tube was off
  if (wasOff) {
    root.classList.add("crt-boot");
    window.setTimeout(() => root.classList.remove("crt-boot"), 700);
  }
  emit();
  return mode;
}

/** `:crt` / `crt` argument handling, shared by vim + shell */
export function crtCommand(arg: string): { text: string; error?: boolean } {
  const a = arg.trim().toLowerCase();
  let next: CrtMode;
  if (!a) next = getCrt() === "off" ? "on" : "off";
  else if (a === "on" || a === "off" || a === "green" || a === "amber") next = a;
  else return { text: `crt: unknown mode "${arg}" (on, off, green, amber)`, error: true };

  setCrt(next);
  return {
    text:
      next === "off"
        ? "crt: off. welcome back to the future."
        : `crt: ${next === "on" ? "on" : `${next} phosphor`}. :crt off to escape`,
  };
}
