import { ArrowUpRight } from "lucide-react";
import { projects, type Project } from "@/content/projects";
import { activeSocials } from "@/content/site";
import { Prompt } from "./term/prompt";

function hostLabel(url: string) {
  const u = new URL(url);
  return u.hostname === "github.com" ? "source" : u.hostname.replace(/^www\./, "");
}

function Row({ p, i }: { p: Project; i: number }) {
  const meta = [p.role?.toLowerCase(), p.lang].filter(Boolean).join(" · ");

  const body = (
    <>
      <span className="pt-[0.55em] text-[11px] text-faint tabular-nums transition-colors group-hover:text-accent">
        {String(i + 1).padStart(2, "0")}
      </span>

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-serif text-[30px] leading-none tracking-[-0.01em] text-fg @md:text-[34px]">
            {p.name}
          </h3>
          {p.status && (
            <span className="inline-flex items-center gap-1.5 text-micro uppercase text-accent">
              <span aria-hidden className="size-1.5 bg-accent motion-safe:animate-blink" />
              {p.status}
            </span>
          )}
        </div>
        <p className="mt-3 max-w-[60ch] text-[13px] leading-[1.75] text-muted">{p.about}</p>
        <p className="mt-2 text-[11px] text-faint">{p.tags.map((t) => `#${t.replace(/\s+/g, "-")}`).join("  ")}</p>
      </div>

      <div className="col-start-2 flex items-baseline justify-between gap-4 text-[12px] @xl:col-start-auto @xl:flex-col @xl:items-end @xl:pt-[0.55em]">
        <span className="text-muted">{meta || " "}</span>
        {p.link ? (
          <span className="inline-flex items-center gap-1 text-green transition-colors group-hover:text-fg">
            {hostLabel(p.link)}
            <ArrowUpRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={1.5}
              aria-hidden
            />
          </span>
        ) : (
          <span className="text-faint">no public link</span>
        )}
      </div>
    </>
  );

  const grid =
    "group grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 gap-y-4 py-7 @xl:grid-cols-[3rem_minmax(0,1fr)_11rem] @xl:gap-x-6";

  return (
    <li className="border-b border-line">
      {p.link ? (
        <a
          href={p.link}
          target="_blank"
          rel="noopener noreferrer"
          className={`${grid} -mx-3 px-3 transition-colors hover:bg-fg/[0.025]`}
        >
          {body}
        </a>
      ) : (
        <div className={`${grid} -mx-3 px-3`}>{body}</div>
      )}
    </li>
  );
}

/** the readable, prominent version of projects.ts */
export function ProjectsIndex() {
  const github = activeSocials.find((s) => s.id === "github");

  return (
    <section aria-labelledby="work-title" id="work" className="">
      <div className="flex items-baseline justify-between border-b border-line pb-3">
        <h2 id="work-title" className="sr-only">
          projects
        </h2>
        <Prompt cmd="ls -l ~/projects" />
        <span className="hud-label text-faint tabular-nums">
          total {projects.length}
        </span>
      </div>

      <ol>
        {projects.map((p, i) => (
          <Row key={p.name} p={p} i={i} />
        ))}
      </ol>

      {github && (
        <p className="mt-5 text-[12px] text-faint">
          more experiments + configs (dwm, nvim, dotfiles) on{" "}
          <a href={github.href} target="_blank" rel="noopener noreferrer" className="link">
            github.com/{github.handle}
          </a>
        </p>
      )}
    </section>
  );
}
