/**
 * The active tmux "window" lives in the URL hash (#projects, #shell…) so
 * links are shareable and back/forward just works. Windows = the editor
 * files + a full-width shell.
 */

import { useSyncExternalStore } from "react";
import { FILE_IDS, isFileId, type FileId } from "./files";

export const WINDOW_IDS = [...FILE_IDS, "shell"] as const;
export type WindowId = (typeof WINDOW_IDS)[number];

export const isWindowId = (v: string): v is WindowId => (WINDOW_IDS as readonly string[]).includes(v);

const listeners = new Set<() => void>();
const DEFAULT: WindowId = "about";

function read(): WindowId {
  const h = window.location.hash.slice(1);
  return isWindowId(h) ? h : DEFAULT;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("hashchange", cb);
  window.addEventListener("popstate", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("hashchange", cb);
    window.removeEventListener("popstate", cb);
  };
}

export function useActiveWindow() {
  return useSyncExternalStore(subscribe, read, () => DEFAULT);
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function openWindow(id: WindowId) {
  if (read() === id) return;
  // pushState (not location.hash) so the browser doesn't jump-scroll
  window.history.pushState(null, "", `#${id}`);
  listeners.forEach((l) => l());
}

/** kept for callers that think in files (shell `cat`, vim `:e`) */
export function openFile(id: FileId) {
  openWindow(id);
}

export function stepWindow(delta: 1 | -1) {
  const i = WINDOW_IDS.indexOf(read());
  openWindow(WINDOW_IDS[(i + delta + WINDOW_IDS.length) % WINDOW_IDS.length]);
}

export { isFileId };
