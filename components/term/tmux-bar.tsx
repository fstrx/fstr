"use client";

import { useSyncExternalStore } from "react";
import { site } from "@/content/site";
import { openWindow, useActiveWindow, WINDOW_IDS } from "@/lib/active-file";
import { useLocalTime } from "@/lib/local-time";

const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: site.timezone, day: "2-digit", month: "short" });
const subscribe = (cb: () => void) => {
  const id = window.setInterval(cb, 60_000);
  return () => window.clearInterval(id);
};
const getDate = () => dateFmt.format(new Date()).toLowerCase();

/**
 * tmux-style status line at the bottom of the workspace.
 * It's the site nav: each window is a section.
 */
export function TmuxBar() {
  const active = useActiveWindow();
  const { time } = useLocalTime();
  const date = useSyncExternalStore(subscribe, getDate, () => "");

  return (
    <nav
      aria-label="sections"
      className="flex h-7 shrink-0 items-stretch border-t border-line bg-raised text-[11.5px]"
    >
      <span className="flex items-center bg-accent px-2.5 font-medium text-bg">[{site.alias}]</span>

      <ul className="scroll-quiet flex min-w-0 flex-1 items-stretch overflow-x-auto [scrollbar-width:none]">
        {WINDOW_IDS.map((id, i) => {
          const current = active === id;
          return (
            <li key={id} className="flex">
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  openWindow(id);
                }}
                aria-current={current ? "true" : undefined}
                className={`flex items-center px-2.5 whitespace-nowrap transition-colors ${
                  current ? "bg-fg/[0.07] text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {i + 1}:{id}
                <span className={current ? "text-accent" : "invisible"}>*</span>
              </a>
            </li>
          );
        })}
      </ul>

      <span className="hidden items-center gap-3 px-3 text-muted tabular-nums sm:flex">
        <span>&quot;{site.location.split(",")[0].toLowerCase()}&quot;</span>
        <span suppressHydrationWarning className="text-fg">
          {time}
        </span>
        <span suppressHydrationWarning>{date}</span>
      </span>
    </nav>
  );
}
