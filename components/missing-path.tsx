"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** the path the visitor asked for (client-only; "this-page" during prerender) */
export function MissingPath() {
  const path = useSyncExternalStore(
    noop,
    () => decodeURIComponent(window.location.pathname),
    () => "this-page",
  );
  return <span className="break-all">{path}</span>;
}
