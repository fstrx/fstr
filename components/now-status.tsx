"use client";

import { listening } from "@/content/listening";
import { site } from "@/content/site";
import { useLocalTime } from "@/lib/local-time";

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 border-t border-line pt-3">
      <dt className="text-micro uppercase text-faint">{label}</dt>
      <dd className="mt-1 truncate text-[13px]">{children}</dd>
    </div>
  );
}

/** live HUD: where i am, what time it is there, what's going on */
export function NowStatus() {
  const { time, status } = useLocalTime();
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-5 @md:grid-cols-3">
      <Cell label="location">
        <span className="text-fg">{site.location.toLowerCase()}</span>
      </Cell>
      <Cell label="local time">
        <time suppressHydrationWarning className="text-accent tabular-nums">
          {time}
        </time>{" "}
        <span className="text-muted">{site.timezoneLabel.toLowerCase()}</span>
      </Cell>
      <Cell label="status">
        <span suppressHydrationWarning className="text-fg">
          {status}
        </span>
      </Cell>
      <Cell label="building">
        <span className="text-fg">aedura</span>
      </Cell>
      <Cell label="on repeat">
        <span className="text-muted">{listening[0].artist.toLowerCase()}</span>
      </Cell>
      <Cell label="setup">
        <span className="text-muted">
          {site.setup.wm} · {site.setup.editor}
        </span>
      </Cell>
    </dl>
  );
}
