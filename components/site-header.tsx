import Link from "next/link";
import { activeSocials, site } from "@/content/site";
import { ThemeToggle } from "./theme-toggle";

export function Wordmark() {
  return (
    <span className="text-[13px] tracking-tight">
      <span className="text-fg">varad</span>
      <span className="px-1.5 text-accent">/</span>
      <span className="text-muted">fstr</span>
    </span>
  );
}

/** section nav lives in the tmux bar at the bottom */
export function SiteHeader() {
  return (
    <header className="relative flex h-11 shrink-0 items-center gap-x-6 border-b border-line px-4">
      <span aria-hidden className="neon-rule pointer-events-none absolute inset-x-0 -bottom-px h-px" />
      <Link href="/" aria-label="varad / fstr — home" className="mr-auto">
        <Wordmark />
      </Link>

      <span className="hidden text-[11px] text-faint md:inline">
        {site.handle}: ~ — tmux
      </span>

      <div className="flex items-center gap-4 text-[12.5px]">
        {activeSocials.map((s) => (
          <a
            key={s.id}
            href={s.href}
            target={s.id === "email" ? undefined : "_blank"}
            rel="me noopener noreferrer"
            className="hidden text-muted transition-colors hover:text-fg sm:inline"
          >
            {s.label}
          </a>
        ))}
        <ThemeToggle />
      </div>
    </header>
  );
}
