/**
 * HUD settings the knobs control, plus a hook that exposes the live theme
 * colours to canvas widgets. Each setting is a tiny external store,
 * remembered per visitor in localStorage (a convenience; safe to lose).
 */

import { useSyncExternalStore } from "react";

function createStore<T extends number | boolean>(key: string, fallback: T, valid: (v: unknown) => v is T) {
  const listeners = new Set<() => void>();
  let value: T | null = null;

  const read = (): T => {
    if (value === null) {
      let stored: unknown = null;
      try {
        const raw = localStorage.getItem(key);
        stored = raw === null ? null : JSON.parse(raw);
      } catch {}
      value = valid(stored) ? stored : fallback;
    }
    return value;
  };

  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  };

  return {
    get: read,
    set(next: T) {
      value = next;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      listeners.forEach((l) => l());
    },
    subscribe,
    /** React hook */
    use: () => useSyncExternalStore(subscribe, read, () => fallback),
  };
}

const isLevel = (max: number) => (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= max;

/** 0 off · 1 low · 2 med (default) · 3 high */
export const glitchLevel = createStore<number>("hud:glitch", 2, isLevel(3));

/** 0 off · 1 soft · 2 default · 3 hot — scales every neon glow via --glow */
export const neonLevel = createStore<number>("hud:neon", 2, isLevel(3));
export const NEON_SCALE = [0, 0.5, 1, 1.9];

export function applyNeon(level = neonLevel.get()) {
  document.documentElement.style.setProperty("--glow", String(NEON_SCALE[level] ?? 1));
}

/** the right-hand HUD rail (wide screens only) */
export const hudOpen = createStore<boolean>("hud:open", true, (v): v is boolean => typeof v === "boolean");

/* ── live theme colours for canvases ─────────────────────── */

export type Tokens = { bg: string; fg: string; muted: string; faint: string; line: string; accent: string; blue: string; yellow: string; green: string };

const TOKEN_NAMES = ["bg", "fg", "muted", "faint", "line", "accent", "blue", "yellow", "green"] as const;
const FALLBACK: Tokens = {
  bg: "#0a0a0d", fg: "#e6e3dc", muted: "#8a8893", faint: "#52505c", line: "#2a1c22",
  accent: "#ff3e6c", blue: "#5ad1ff", yellow: "#f3e600", green: "#5ff2c4",
};

let cached: Tokens | null = null;
let cachedKey = "";

function readTokens(): Tokens {
  const root = document.documentElement;
  // theme + crt classes fully determine the palette
  const key = `${root.dataset.theme}|${root.className}`;
  if (cached && key === cachedKey) return cached;
  const css = getComputedStyle(root);
  const t = { ...FALLBACK };
  for (const n of TOKEN_NAMES) t[n] = css.getPropertyValue(`--${n}`).trim() || FALLBACK[n];
  cached = t;
  cachedKey = key;
  return t;
}

function subscribeTokens(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
  return () => mo.disconnect();
}

export function useTokens(): Tokens {
  return useSyncExternalStore(subscribeTokens, readTokens, () => FALLBACK);
}
