import { ArrowUpRight } from "lucide-react";
import { experience, fmtMonth } from "@/content/experience";
import { interests } from "@/content/interests";
import { now } from "@/content/now";
import { activeSocials, site } from "@/content/site";
import { AsciiTorus } from "./ascii-torus";
import { Badge, Chip, code, DataRow, Shard, Signal } from "./cp";
import { DecodeText } from "./decode-text";
import { NowStatus } from "./now-status";
import { OnRotation } from "./on-rotation";
import { ProjectsIndex } from "./projects-index";
import { Prompt } from "./term/prompt";

/**
 * The right-hand "render" pane of each tmux window: the readable version
 * of the file on the left, dressed like an in-game interface.
 */

/* ── about: ident shard + contacts ────────────────────────── */

function Contacts() {
  return (
    <Shard title="contacts" code={`${activeSocials.length} linked`} bodyClassName="p-0">
      <ul>
        {activeSocials.map((s, i) => (
          <li key={s.id} className="border-b border-line last:border-b-0">
            <a
              href={s.href}
              target={s.id === "email" ? undefined : "_blank"}
              rel="me noopener noreferrer"
              className="group aberrate relative flex items-center gap-3 px-4 py-3 text-[13px] transition-colors hover:bg-accent/[0.06]"
            >
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-[2px] bg-accent opacity-0 transition-opacity group-hover:opacity-100"
              />
              <span className="hud-label w-12 shrink-0 text-faint">{code("LNK", i + 1)}</span>
              <span className="hud-label w-16 shrink-0 text-muted group-hover:text-fg">{s.label}</span>
              <span className="min-w-0 flex-1 truncate text-fg">{s.handle}</span>
              <Signal level={4} />
              <ArrowUpRight
                className="size-3.5 text-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                strokeWidth={1.5}
                aria-hidden
              />
            </a>
          </li>
        ))}
      </ul>
    </Shard>
  );
}

export function AboutRender() {
  return (
    <div className="space-y-10">
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
          className="glitch font-serif text-[44px] leading-[1] tracking-[-0.01em] text-fg @md:text-[60px]"
        >
          hi, i&apos;m varad<span className="text-accent">.</span>
          <span
            aria-hidden
            className="ml-2 inline-block h-[0.68em] w-[0.3em] translate-y-[0.04em] animate-blink bg-fg/55"
          />
        </h1>
      </div>

      <Shard title="ident.shard" code="0x01 · read" badge={<Badge tone="green">decrypted</Badge>}>
        <div className="max-w-[58ch] space-y-4 text-[13.5px] leading-[1.8] text-muted">
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
      </Shard>

      <div className="grid items-start gap-8 @2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <AsciiTorus />
        <Contacts />
      </div>

      <p className="hud-label text-faint">
        © {site.updated.slice(0, 4)} {site.name.toLowerCase()} <span className="text-accent">{"//"}</span> made in{" "}
        {site.location.split(",")[0].toLowerCase()} <span className="text-accent">{"//"}</span> rev {site.updated}
      </p>
    </div>
  );
}

/* ── projects: gig cards ──────────────────────────────────── */

export function ProjectsRender() {
  return <ProjectsIndex />;
}

/* ── experience: job log ──────────────────────────────────── */

export function ExperienceRender() {
  return (
    <div>
      <Prompt cmd="git log --graph ~/experience" className="mb-8" />
      <ol className="relative space-y-5 before:absolute before:top-3 before:bottom-3 before:left-[7px] before:w-px before:bg-line-strong before:content-['']">
        {experience.map((r, i) => {
          const current = !r.to;
          return (
            <li key={`${r.org}-${r.from}`} className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2">
              <span
                aria-hidden
                className={`relative z-[1] mt-3 text-[15px] leading-none ${current ? "neon-text text-accent" : "text-faint"}`}
              >
                {current ? "◆" : "◇"}
              </span>
              <Shard
                as="article"
                tone={current ? "accent" : "line"}
                title={code("JOB", experience.length - i)}
                badge={
                  current ? (
                    <Badge solid pulse>
                      active
                    </Badge>
                  ) : (
                    <Badge tone="muted">completed</Badge>
                  )
                }
                code={
                  <span className="tabular-nums">
                    {fmtMonth(r.from)} → {r.to ? fmtMonth(r.to) : "now"}
                  </span>
                }
              >
                <h3 className="font-serif text-[26px] leading-tight text-fg @md:text-[30px]">{r.org}</h3>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="hud-label text-yellow">{r.role}</span>
                  {r.where && <span className="hud-label text-faint">{r.where}</span>}
                </p>
                {r.about && <p className="mt-3 max-w-[60ch] text-[13px] leading-[1.75] text-muted">{r.about}</p>}
              </Shard>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ── interests: attribute slots ───────────────────────────── */

export function InterestsRender() {
  return (
    <div className="space-y-10">
      <div>
        <Prompt cmd="ls ~/interests" className="mb-8" />
        <div className="grid gap-4 @xl:grid-cols-2">
          {interests.map((g, i) => {
            const core = i < 2;
            return (
              <Shard
                key={g.verb}
                tone={core ? "accent" : "line"}
                title={g.verb}
                code={code("ATTR", i + 1)}
                badge={core ? <Badge tone="yellow">core</Badge> : undefined}
              >
                <div className="flex flex-wrap gap-2">
                  {g.items.map((item) => (
                    <Chip key={item} tone={core ? "accent" : "muted"}>
                      {item}
                    </Chip>
                  ))}
                </div>
              </Shard>
            );
          })}
        </div>
        <p className="mt-5 text-[12.5px] text-muted">
          the common thread is probably curiosity. also loud guitars.
        </p>
      </div>
      <OnRotation />
    </div>
  );
}

/* ── now: active objectives ───────────────────────────────── */

export function NowRender() {
  return (
    <div className="space-y-10">
      <div>
        <Prompt cmd="cat ~/now" className="mb-8" />
        <Shard
          title="active objectives"
          code={`upd ${now.updated}`}
          badge={
            <Badge solid pulse>
              tracking
            </Badge>
          }
          bodyClassName="p-0"
        >
          <ol>
            {now.items.map((item, i) => (
              <li
                key={item}
                className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-line px-4 py-3 last:border-b-0"
              >
                <span aria-hidden className={i === 0 ? "neon-text text-accent" : "text-accent/70"}>
                  {i === 0 ? "◆" : "◇"}
                </span>
                <span className={`text-[13.5px] ${i === 0 ? "text-fg" : "text-fg/90"}`}>{item}</span>
                <span className="hud-label text-faint">{code("OBJ", i + 1)}</span>
              </li>
            ))}
          </ol>
        </Shard>
        <p className="mt-4 text-[11.5px] text-faint">
          this is a{" "}
          <a href="https://nownownow.com/about" target="_blank" rel="noopener noreferrer" className="link">
            /now page
          </a>
        </p>
      </div>
      <div>
        <Prompt cmd={`cat /proc/${site.alias}/status`} className="mb-6" />
        <Shard title="status" code="live" badge={<Badge tone="green">online</Badge>}>
          <NowStatus />
        </Shard>
      </div>
    </div>
  );
}

/* ── security: secure channel + ICE ───────────────────────── */

const ICE: [string, string][] = [
  ["content-security-policy", "same-origin only, no frames, no plugins"],
  ["strict-transport-security", "https, 1 year"],
  ["x-frame-options", "deny"],
  ["x-content-type-options", "nosniff"],
  ["referrer-policy", "strict-origin-when-cross-origin"],
  ["permissions-policy", "camera, mic, location, payment, usb: off"],
];

export function SecurityRender() {
  return (
    <div className="space-y-10">
      <div>
        <Prompt cmd="curl -s /.well-known/security.txt" className="mb-8" />
        <Shard title="secure channel" code="rfc 9116" badge={<Badge tone="green">open</Badge>}>
          <p className="max-w-[58ch] text-[13.5px] leading-[1.8] text-muted">
            found a vulnerability in this site or one of my projects? please report it privately before
            going public. i care about this stuff, and i&apos;d rather fix it than read about it.
          </p>
          <dl className="mt-4 divide-y divide-line border-t border-line">
            <DataRow label="contact">
              <a href={`mailto:${site.email}`} className="link">
                {site.email}
              </a>
            </DataRow>
            <DataRow label="lang">en</DataRow>
            <DataRow label="background">
              bug bounty &amp; security research <span className="text-muted">(2022–23)</span>
            </DataRow>
            <DataRow label="bounty">
              <span className="text-muted">none, but credit if you want it</span>
            </DataRow>
            <DataRow label="served at">
              <a href="/.well-known/security.txt" className="link">
                /.well-known/security.txt
              </a>
            </DataRow>
          </dl>
        </Shard>
      </div>

      <div>
        <Prompt cmd="curl -sI / | grep -i security" className="mb-6" />
        <Shard
          title="ice layers"
          code={`${ICE.length}/${ICE.length} up`}
          badge={<Badge tone="blue">intact</Badge>}
          bodyClassName="p-0"
        >
          <ul>
            {ICE.map(([h, v], i) => (
              <li
                key={h}
                className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-3 gap-y-0.5 border-b border-line px-4 py-2.5 last:border-b-0 @lg:grid-cols-[3rem_minmax(0,1fr)_auto]"
              >
                <span className="hud-label pt-[2px] text-faint">{code("ICE", i + 1)}</span>
                <span className="text-[12.5px] text-fg">{h}</span>
                <span className="col-start-2 text-[11.5px] text-faint @lg:col-start-auto @lg:text-right">
                  <span className="text-green">✓</span> {v}
                </span>
              </li>
            ))}
          </ul>
        </Shard>
      </div>

      <Shard title="colophon" code="build">
        <div className="max-w-[58ch] space-y-3 text-[13px] leading-[1.8] text-muted">
          <p>
            built with next.js, typescript and tailwind, installed with bun. set in jetbrains mono,
            with instrument serif for the big stuff. mostly static: no analytics, no cookies, no
            third-party scripts.
          </p>
          <p>
            the code on the left is generated from the same data as the render on the right, so they
            never drift apart.
          </p>
        </div>
      </Shard>
    </div>
  );
}
