/**
 * The currently open file lives in the URL hash (#projects, #now…) so
 * links are shareable and back/forward just works. This is a tiny external
 * store around it for useSyncExternalStore.
 */

import { useSyncExternalStore } from "react";
import { FILE_IDS, isFileId, type FileId } from "./files";

const listeners = new Set<() => void>();
const DEFAULT: FileId = "about";

function read(): FileId {
  const h = window.location.hash.slice(1);
  return isFileId(h) ? h : DEFAULT;
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

export function useActiveFile() {
  return useSyncExternalStore(subscribe, read, () => DEFAULT);
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollToEditor() {
  document.getElementById("editor")?.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
}

export function openFile(id: FileId, opts: { scroll?: boolean } = {}) {
  if (read() !== id) {
    // pushState (not location.hash) so the browser doesn't jump-scroll
    window.history.pushState(null, "", `#${id}`);
    listeners.forEach((l) => l());
  }
  if (opts.scroll) scrollToEditor();
}

export function stepFile(delta: 1 | -1) {
  const i = FILE_IDS.indexOf(read());
  openFile(FILE_IDS[(i + delta + FILE_IDS.length) % FILE_IDS.length]);
}
