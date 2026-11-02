"use client";

import { site } from "@/content/site";
import { listening } from "@/content/listening";
import { useLocalTime } from "@/lib/local-time";

function Cell({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className="text-micro uppercase text-faint">{label}</dt>
      <dd className="mt-1 truncate text-[12.5px]">{children}</dd>
    </div>
  );
}

/** heads-up display: where i am, what time it is there, what's going on */
export function SiteFooter() {
  const { time, status } = useLocalTime();

  return (
    <footer className="mt-20 border-t border-line pt-5 pb-8 sm:mt-28">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1.4fr]">
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
        <Cell label="on repeat" className="col-span-2 sm:col-span-1">
          <span className="text-muted">{listening[0].artist.toLowerCase()}</span>
        </Cell>
      </dl>

      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-[11px] text-faint">
        <p>
          © {site.updated.slice(0, 4)} {site.name.toLowerCase()} <span className="px-1 text-line-strong">·</span>{" "}
          made in {site.location.split(",")[0].toLowerCase()}
        </p>
        <p>
          last updated <span className="tabular-nums">{site.updated}</span>
          <span className="px-1 text-line-strong">·</span> no cookies, no trackers
        </p>
      </div>
    </footer>
  );
}
