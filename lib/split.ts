/**
 * Code/render split ratio (percent width of the code pane), shared by all
 * windows. Remembered per visitor in localStorage — a convenience only,
 * everything works if storage is unavailable.
 */

import { useSyncExternalStore } from "react";

export const SPLIT_DEFAULT = 46.5;
export const SPLIT_MIN = 20;
export const SPLIT_MAX = 80;
const KEY = "split";

const listeners = new Set<() => void>();
let value: number | null = null;

const clamp = (n: number) => Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, n));

function read(): number {
  if (value === null) {
    let stored = NaN;
    try {
      stored = Number(localStorage.getItem(KEY));
    } catch {}
    value = Number.isFinite(stored) && stored > 0 ? clamp(stored) : SPLIT_DEFAULT;
  }
  return value;
}

export function setSplit(next: number, persist = true) {
  value = clamp(Math.round(next * 10) / 10);
  if (persist) {
    try {
      localStorage.setItem(KEY, String(value));
    } catch {}
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useSplit() {
  return useSyncExternalStore(subscribe, read, () => SPLIT_DEFAULT);
}
