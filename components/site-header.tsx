"use client";

import Link from "next/link";
import { activeSocials, site } from "@/content/site";
import { hudOpen } from "@/lib/hud";
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

function HudToggle() {
  const open = hudOpen.use();
  return (
    <button
      type="button"
      aria-pressed={open}
      onClick={() => hudOpen.set(!open)}
      title="toggle hud (:hud)"
      className="hud-label chamfer-sm hidden border border-line-strong px-2 py-0.5 text-muted transition-colors hover:text-fg aria-pressed:border-accent/70 aria-pressed:bg-accent/10 aria-pressed:text-accent xl:inline-block"
    >
      hud {open ? "on" : "off"}
    </button>
  );
}

/** section nav lives in the tmux bar at the bottom */
export function SiteHeader() {
  return (
    <header className="relative flex h-11 shrink-0 items-center gap-x-5 border-b border-line px-4">
      <span aria-hidden className="neon-rule pointer-events-none absolute inset-x-0 -bottom-px h-px" />
      <span aria-hidden className="hatch hidden h-3 w-6 sm:block" />
      <Link href="/" aria-label="varad / fstr — home" className="mr-auto">
        <Wordmark />
      </Link>

      <span className="hud-label hidden text-faint md:inline">
        net <span className="text-accent">{"//"}</span> {site.handle}
      </span>

      <nav aria-label="elsewhere" className="flex items-center gap-4">
        {activeSocials.map((s) => (
          <a
            key={s.id}
            href={s.href}
            target={s.id === "email" ? undefined : "_blank"}
            rel="me noopener noreferrer"
            className="aberrate hud-label hidden text-muted transition-colors hover:text-fg sm:inline"
          >
            {s.label}
          </a>
        ))}
      </nav>
      <HudToggle />
      <ThemeToggle />
    </header>
  );
}
