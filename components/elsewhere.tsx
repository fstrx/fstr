import { ArrowUpRight } from "lucide-react";
import { activeSocials, socials } from "@/content/site";
import { OnRotation } from "./on-rotation";

export function Elsewhere() {
  const pending = socials.filter((s) => !s.href);

  return (
    <section
      aria-labelledby="elsewhere-title"
      className="mt-20 grid gap-12 sm:mt-28 md:grid-cols-2 md:gap-x-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-x-12"
    >
      <div>
        <h2 id="elsewhere-title" className="mb-5 text-[12.5px] text-faint">
          <span className="text-accent">{"//"}</span> elsewhere
        </h2>
        <ul className="divide-y divide-line border-y border-line">
          {activeSocials.map((s) => (
            <li key={s.id}>
              <a
                href={s.href}
                target={s.id === "email" ? undefined : "_blank"}
                rel="me noopener noreferrer"
                className="group flex items-baseline gap-4 py-3 text-[13px] transition-colors"
              >
                <span className="w-20 text-muted group-hover:text-fg">{s.label}</span>
                <span className="flex-1 text-fg">{s.handle}</span>
                <ArrowUpRight
                  className="size-3.5 translate-y-0.5 text-faint transition-transform group-hover:-translate-y-0 group-hover:translate-x-0.5 group-hover:text-accent"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </a>
            </li>
          ))}
        </ul>
        {pending.length > 0 && (
          <p className="mt-3 text-[11px] text-faint">
            {pending.map((s) => s.label).join(" + ")}: coming soon. dms are open in the meantime.
          </p>
        )}
      </div>

      <OnRotation />

      <div className="md:col-span-2 lg:col-span-1">
        <h2 className="mb-5 text-[12.5px] text-faint">
          <span className="text-accent">{"//"}</span> colophon
        </h2>
        <div className="space-y-3 font-sans text-[14px] leading-[1.7] text-muted">
          <p>
            built with next.js, typescript and tailwind, installed with bun. set in jetbrains mono,
            geist, and instrument serif.
          </p>
          <p>
            mostly static. no analytics, no cookies, no third-party scripts. everything is
            same-origin, locked down with csp + hsts, and there&apos;s a{" "}
            <a href="/.well-known/security.txt" className="link font-mono text-[12.5px]">
              security.txt
            </a>
            .
          </p>
          <p>
            the editor above is real-ish: try{" "}
            <kbd className="font-mono text-[12.5px] text-fg">:help</kbd>.
          </p>
        </div>
      </div>
    </section>
  );
}
