"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};
// computed once per page load: getSnapshot must return a stable value
let cached: string | null = null;
const fmt = () => (cached ??= stamp());
const stamp = () =>
  new Date()
    .toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(/,/g, "")
    .toLowerCase();

/** "last login: tue nov 3 21:52:07 on ttys000" — the visitor's own clock */
export function LastLogin() {
  const when = useSyncExternalStore(noop, fmt, () => "—");
  return (
    <p className="text-[11.5px] text-faint" suppressHydrationWarning>
      last login: {when} on ttys000
    </p>
  );
}
