/**
 * Cyberpunk-interface primitives for the render panes: data shards,
 * slanted chips, status badges, signal bars. Server-safe (no hooks).
 */

/**
 * A chamfered frame with a visible 1px border on every edge (including the
 * cut corners): the outer layer is the border colour, the inner layer is
 * inset by 1px with the same chamfer.
 */
export function Shard({
  title,
  code,
  badge,
  children,
  className = "",
  bodyClassName = "",
  tone = "line",
  as: Tag = "section",
}: {
  title?: React.ReactNode;
  code?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  tone?: "line" | "accent" | "blue" | "yellow";
  as?: "section" | "div" | "article" | "li";
}) {
  const border = {
    line: "bg-line-strong",
    accent: "bg-accent/70",
    blue: "bg-blue/60",
    yellow: "bg-yellow/60",
  }[tone];
  return (
    <Tag className={`chamfer ${border} p-px transition-colors ${className}`}>
      <div className="chamfer h-full bg-surface">
        {(title || code || badge) && (
          <header className="flex items-center gap-2 border-b border-line px-4 py-2">
            <span aria-hidden className="h-3 w-[3px] bg-accent" />
            {title && <span className="hud-label shrink-0 text-fg">{title}</span>}
            {badge}
            <span aria-hidden className="hatch-faint h-2 min-w-2 flex-1" />
            {code && <span className="hud-label min-w-0 truncate text-faint">{code}</span>}
          </header>
        )}
        <div className={`px-4 py-4 ${bodyClassName}`}>{children}</div>
      </div>
    </Tag>
  );
}

/** slanted tag chip */
export function Chip({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "accent" | "blue" }) {
  const cls = {
    muted: "border-line-strong text-muted",
    accent: "border-accent/60 text-accent",
    blue: "border-blue/50 text-blue",
  }[tone];
  return (
    <span className={`inline-block -skew-x-12 border px-2 py-0.5 ${cls}`}>
      <span className="inline-block skew-x-12 text-[11px]">{children}</span>
    </span>
  );
}

/** status badge: solid for live states, outlined for done/info */
export function Badge({
  children,
  tone = "accent",
  solid = false,
  pulse = false,
}: {
  children: React.ReactNode;
  tone?: "accent" | "blue" | "yellow" | "muted" | "green";
  solid?: boolean;
  pulse?: boolean;
}) {
  const color = {
    accent: solid ? "bg-accent text-bg" : "border-accent/70 text-accent",
    blue: solid ? "bg-blue text-bg" : "border-blue/60 text-blue",
    yellow: solid ? "bg-yellow text-bg" : "border-yellow/60 text-yellow",
    green: solid ? "bg-green text-bg" : "border-green/60 text-green",
    muted: solid ? "bg-line-strong text-fg" : "border-line-strong text-muted",
  }[tone];
  return (
    <span
      className={`hud-label slant-r inline-flex shrink-0 items-center gap-1.5 py-[1px] pr-3 pl-1.5 text-[9.5px] ${solid ? "" : "border"} ${color}`}
    >
      {pulse && <span aria-hidden className="size-1.5 animate-blink bg-current" />}
      {children}
    </span>
  );
}

/** decorative signal-strength bars */
export function Signal({ level = 4 }: { level?: 1 | 2 | 3 | 4 }) {
  return (
    <span aria-hidden className="inline-flex h-3 items-end gap-[2px]">
      {[1, 2, 3, 4].map((n) => (
        <span key={n} className={`w-[3px] ${n <= level ? "bg-green" : "bg-line-strong"}`} style={{ height: `${n * 25}%` }} />
      ))}
    </span>
  );
}

/** "LBL ........ value" data row */
export function DataRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-x-4 gap-y-0.5 py-2 @md:grid-cols-[8.5rem_minmax(0,1fr)]">
      <dt className="hud-label pt-[2px] text-faint">{label}</dt>
      <dd className="text-[13px] text-fg">{children}</dd>
    </div>
  );
}

export const code = (prefix: string, n: number) => `${prefix}-${String(n).padStart(2, "0")}`;
