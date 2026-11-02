import { ArrowUpRight } from "lucide-react";
import { interests } from "@/content/interests";
import { now } from "@/content/now";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import type { FileId } from "@/lib/files";

/**
 * The "terminal" pane: a plain-language rendering of whichever file is
 * open. This is the readable version; the code is the fun version.
 */

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-fg">{children}</dd>
    </div>
  );
}

function AboutOutput() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-fg">
          {site.name.toLowerCase()} <span className="text-muted">(aka {site.alias})</span>
        </p>
        <p aria-hidden className="text-faint">
          {"─".repeat(26)}
        </p>
      </div>
      <dl className="space-y-1">
        <Row label="based">{site.location.toLowerCase()}</Row>
        <Row label="does">student · developer · founder</Row>
        <Row label="currently">
          <span className="text-accent">cto @ aedura</span>
        </Row>
        <Row label="into">{site.focus.join(" · ")}</Row>
        <Row label="setup">
          {site.setup.os} · {site.setup.wm} · {site.setup.editor}
        </Row>
        <Row label="timezone">utc+05:30</Row>
      </dl>
      <p className="font-sans text-[13.5px] leading-relaxed text-muted">
        i like knowing how things work all the way down — which is a polite way of saying i
        rewrite things from scratch more often than strictly necessary.
      </p>
    </div>
  );
}

function ProjectsOutput() {
  return (
    <ul className="space-y-5">
      {projects.map((p) => (
        <li key={p.name}>
          <div className="flex flex-wrap items-baseline gap-x-3">
            <span className="text-fg">{p.name.toLowerCase()}</span>
            {(p.role || p.status || p.lang) && (
              <span className="text-[11px] text-accent">
                {[p.role?.toLowerCase(), p.status, p.lang].filter(Boolean).join(" · ")}
              </span>
            )}
            {p.link && (
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="link ml-auto inline-flex items-center gap-0.5 text-[11.5px]"
              >
                {p.link.includes("github.com") ? "source" : "visit"}
                <ArrowUpRight className="size-3" strokeWidth={1.5} aria-hidden />
                <span className="sr-only">({p.name})</span>
              </a>
            )}
          </div>
          <p className="mt-1 font-sans text-[13.5px] leading-relaxed text-muted">{p.about}</p>
        </li>
      ))}
    </ul>
  );
}

function InterestsOutput() {
  return (
    <div className="space-y-5">
      <dl className="space-y-2.5">
        {interests.map((g) => (
          <div key={g.verb} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3">
            <dt className="text-muted">{g.verb}</dt>
            <dd className="text-fg">{g.items.join(", ")}</dd>
          </div>
        ))}
      </dl>
      <p className="font-sans text-[13.5px] leading-relaxed text-muted">
        the common thread is probably curiosity. also loud guitars.
      </p>
    </div>
  );
}

function NowOutput() {
  return (
    <div className="space-y-5">
      <ul className="space-y-1.5">
        {now.items.map((item) => (
          <li key={item} className="flex gap-3">
            <span aria-hidden className="text-accent">→</span>
            <span className="text-fg">{item}</span>
          </li>
        ))}
      </ul>
      <p className="text-[11.5px] text-faint">
        last updated {now.updated} · {site.location.toLowerCase()}
      </p>
    </div>
  );
}

function SecurityOutput() {
  return (
    <div className="space-y-5">
      <p className="font-sans text-[13.5px] leading-relaxed text-muted">
        found a vulnerability in this site or one of my projects? please report it privately
        before going public. i care about this stuff, and i&apos;d rather fix it than read about it.
      </p>
      <dl className="space-y-1">
        <Row label="contact">
          <a href={`mailto:${site.email}`} className="link">
            {site.email}
          </a>
        </Row>
        <Row label="lang">en</Row>
        <Row label="bounty">
          <span className="text-muted">none, but credit if you want it</span>
        </Row>
        <Row label="served at">
          <a href="/.well-known/security.txt" className="link">
            /.well-known/security.txt
          </a>
        </Row>
      </dl>
      <p className="text-[11.5px] text-faint">
        <span className="text-green">✓</span> rfc 9116 · csp · hsts · frame-ancestors none · nosniff
      </p>
    </div>
  );
}

export const outputs: Record<FileId, () => React.ReactElement> = {
  about: AboutOutput,
  projects: ProjectsOutput,
  interests: InterestsOutput,
  now: NowOutput,
  security: SecurityOutput,
};
