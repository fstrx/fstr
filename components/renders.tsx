import { ArrowUpRight } from "lucide-react";
import { experience, fmtMonth } from "@/content/experience";
import { interests } from "@/content/interests";
import { now } from "@/content/now";
import { activeSocials, site } from "@/content/site";
import { AsciiTorus } from "./ascii-torus";
import { DecodeText } from "./decode-text";
import { NowStatus } from "./now-status";
import { OnRotation } from "./on-rotation";
import { ProjectsIndex } from "./projects-index";
import { Prompt } from "./term/prompt";

/**
 * The right-hand "render" pane of each tmux window: the readable version
 * of the file on the left.
 */

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 text-[12.5px] text-faint">
      <span className="text-accent">{"//"}</span> {children}
    </h2>
  );
}

function Links() {
  return (
    <div>
      <Heading>elsewhere</Heading>
      <ul className="divide-y divide-line border-y border-line">
        {activeSocials.map((s) => (
          <li key={s.id}>
            <a
              href={s.href}
              target={s.id === "email" ? undefined : "_blank"}
              rel="me noopener noreferrer"
              className="group aberrate flex items-baseline gap-4 py-3 text-[13px]"
            >
              <span className="w-20 text-muted transition-colors group-hover:text-fg">{s.label}</span>
              <span className="min-w-0 flex-1 truncate text-fg">{s.handle}</span>
              <ArrowUpRight
                className="size-3.5 translate-y-0.5 text-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0 group-hover:text-accent"
                strokeWidth={1.5}
                aria-hidden
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AboutRender() {
  return (
    <div className="space-y-14">
      <div>
        <Prompt cmd="whoami" className="mb-8" />
        <p className="mb-6 text-micro uppercase text-faint">
          <span className="text-accent">●</span>&nbsp;{" "}
          <DecodeText
            text={`uid=1000(${site.alias}) · ${site.location.toLowerCase()} · ${site.currently.toLowerCase()}`}
          />
        </p>
        <h1
          data-text="hi, i'm varad."
          className="glitch font-serif text-[44px] leading-[1] tracking-[-0.01em] text-fg sm:text-[60px]"
        >
          hi, i&apos;m varad<span className="text-accent">.</span>
          <span
            aria-hidden
            className="ml-2 inline-block h-[0.68em] w-[0.3em] translate-y-[0.04em] animate-blink bg-fg/55"
          />
        </h1>
        <div className="mt-8 max-w-[58ch] space-y-4 font-sans text-[15px] leading-[1.7] text-muted">
          <p>
            i&apos;m a <span className="text-fg">student, developer, and founder</span>, mostly into{" "}
            <span className="text-fg">systems and security</span>: how things are engineered,
            programmed, and designed, and how they break. also operating systems and ai, with
            detours into robotics, mathematics, and building interesting things.
          </p>
          <p>
            i enjoy understanding how systems work, experimenting with ideas, and occasionally going
            down unnecessarily deep technical rabbit holes. right now that mostly means{" "}
            <span className="text-fg">building aedura</span>.
          </p>
        </div>
      </div>

      <div className="grid items-start gap-12 2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <AsciiTorus />
        <Links />
      </div>

      <p className="text-[11px] text-faint">
        © {site.updated.slice(0, 4)} {site.name.toLowerCase()} · made in{" "}
        {site.location.split(",")[0].toLowerCase()} · last updated {site.updated}
      </p>
    </div>
  );
}

export function ProjectsRender() {
  return <ProjectsIndex />;
}

export function ExperienceRender() {
  return (
    <div>
      <Prompt cmd="git log --graph ~/experience" className="mb-8" />
      <ol>
        {experience.map((r, i) => {
          const current = !r.to;
          const last = i === experience.length - 1;
          return (
            <li key={`${r.org}-${r.from}`} className="grid grid-cols-[1.75rem_minmax(0,1fr)]">
              <div aria-hidden className="flex flex-col items-center">
                <span className={`text-[14px] leading-[1.6] ${current ? "text-accent" : "text-faint"}`}>
                  {current ? "●" : "○"}
                </span>
                {!last && <span className="w-px flex-1 bg-line-strong" />}
              </div>
              <div className={last ? "" : "pb-9"}>
                <h3 className="font-serif text-[26px] leading-tight text-fg sm:text-[30px]">{r.org}</h3>
                <p className="mt-1 text-[13px] text-fg">{r.role.toLowerCase()}</p>
                <p className="mt-1 text-[11.5px] text-muted tabular-nums">
                  <span className={current ? "text-accent" : ""}>
                    {fmtMonth(r.from)} — {r.to ? fmtMonth(r.to) : "now"}
                  </span>
                  {r.where && <span className="text-faint"> · {r.where}</span>}
                </p>
                {r.about && (
                  <p className="mt-3 max-w-[60ch] font-sans text-[14.5px] leading-relaxed text-muted">{r.about}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function InterestsRender() {
  return (
    <div className="space-y-14">
      <div>
        <Prompt cmd="ls ~/interests" className="mb-8" />
        <dl className="divide-y divide-line border-y border-line">
          {interests.map((g, i) => (
            <div key={g.verb} className="grid gap-x-6 gap-y-1 py-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
              <dt className={`text-[12.5px] ${i < 2 ? "text-accent" : "text-muted"}`}>{g.verb}</dt>
              <dd className="font-sans text-[15px] text-fg">{g.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 font-sans text-[14px] text-muted">
          the common thread is probably curiosity. also loud guitars.
        </p>
      </div>
      <OnRotation />
    </div>
  );
}

export function NowRender() {
  return (
    <div className="space-y-14">
      <div>
        <Prompt cmd="cat ~/now" className="mb-8" />
        <ul className="space-y-3">
          {now.items.map((item) => (
            <li key={item} className="flex gap-4 font-sans text-[16px] text-fg">
              <span aria-hidden className="font-mono text-accent">
                →
              </span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[11.5px] text-faint">
          last updated {now.updated} · this is a{" "}
          <a href="https://nownownow.com/about" target="_blank" rel="noopener noreferrer" className="link">
            /now page
          </a>
        </p>
      </div>
      <div>
        <Prompt cmd={`cat /proc/${site.alias}/status`} className="mb-6" />
        <NowStatus />
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-x-6 gap-y-1 border-t border-line py-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
      <dt className="text-[12.5px] text-muted">{label}</dt>
      <dd className="text-[13px] text-fg">{children}</dd>
    </div>
  );
}

export function SecurityRender() {
  return (
    <div className="space-y-14">
      <div>
        <Prompt cmd="curl -s /.well-known/security.txt" className="mb-8" />
        <p className="max-w-[58ch] font-sans text-[15px] leading-[1.7] text-muted">
          found a vulnerability in this site or one of my projects? please report it privately before
          going public. i care about this stuff, and i&apos;d rather fix it than read about it.
        </p>
        <dl className="mt-8 border-b border-line">
          <Row label="contact">
            <a href={`mailto:${site.email}`} className="link">
              {site.email}
            </a>
          </Row>
          <Row label="lang">en</Row>
          <Row label="background">
            bug bounty & security research <span className="text-muted">(2022–23)</span>
          </Row>
          <Row label="bounty">
            <span className="text-muted">none, but credit if you want it</span>
          </Row>
          <Row label="served at">
            <a href="/.well-known/security.txt" className="link">
              /.well-known/security.txt
            </a>
          </Row>
        </dl>
      </div>

      <div>
        <Prompt cmd="curl -sI / | grep -i security" className="mb-5" />
        <ul className="space-y-1.5 text-[12.5px]">
          {[
            ["content-security-policy", "same-origin only, no frames, no plugins"],
            ["strict-transport-security", "https, 1 year"],
            ["x-frame-options", "deny"],
            ["x-content-type-options", "nosniff"],
            ["referrer-policy", "strict-origin-when-cross-origin"],
            ["permissions-policy", "camera, mic, location, payment, usb: off"],
          ].map(([h, v]) => (
            <li key={h} className="flex flex-wrap gap-x-3">
              <span className="text-green">✓</span>
              <span className="text-fg">{h}</span>
              <span className="text-faint">{v}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <Heading>colophon</Heading>
        <div className="max-w-[58ch] space-y-3 font-sans text-[14px] leading-[1.7] text-muted">
          <p>
            built with next.js, typescript and tailwind, installed with bun. set in jetbrains mono,
            geist, and instrument serif. mostly static: no analytics, no cookies, no third-party
            scripts.
          </p>
          <p>
            the code on the left is generated from the same data as the render on the right, so they
            never drift apart.
          </p>
        </div>
      </div>
    </div>
  );
}
