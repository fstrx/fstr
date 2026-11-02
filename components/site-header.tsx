"use client";

import Link from "next/link";
import { activeSocials } from "@/content/site";
import { openFile, useActiveFile } from "@/lib/active-file";
import { FILE_IDS } from "@/lib/files";
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

export function SiteHeader() {
  const active = useActiveFile();

  return (
    <header className="flex flex-wrap items-center gap-x-8 gap-y-3 py-6 sm:py-8">
      <Link href="/" aria-label="varad / fstr — home" className="mr-auto">
        <Wordmark />
      </Link>

      <nav aria-label="sections" className="order-last w-full sm:order-none sm:w-auto">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] sm:gap-x-5">
          {FILE_IDS.map((id, i) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  openFile(id, { scroll: true });
                }}
                aria-current={active === id ? "true" : undefined}
                className="group inline-flex items-baseline gap-1.5 text-muted transition-colors hover:text-fg aria-[current]:text-fg"
              >
                <span className="text-[10px] text-faint group-aria-[current]:text-accent">{i + 1}</span>
                {id}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-4 text-[12.5px]">
        {activeSocials.map((s) => (
          <a
            key={s.id}
            href={s.href}
            target={s.id === "email" ? undefined : "_blank"}
            rel="me noopener noreferrer"
            className="hidden text-muted transition-colors hover:text-fg lg:inline"
          >
            {s.label}
          </a>
        ))}
        <ThemeToggle />
      </div>
    </header>
  );
}
