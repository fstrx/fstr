import { ArrowUpRight } from "lucide-react";
import { projects, type Project } from "@/content/projects";
import { activeSocials } from "@/content/site";
import { Badge, Chip, code, Shard } from "./cp";
import { Prompt } from "./term/prompt";

function hostLabel(url: string) {
  const u = new URL(url);
  return u.hostname === "github.com" ? "source" : u.hostname.replace(/^www\./, "");
}

/** one project as an in-game "gig" card */
function Gig({ p, i }: { p: Project; i: number }) {
  const isRepo = p.link?.includes("github.com");
  const meta = [p.role?.toLowerCase(), p.lang].filter(Boolean).join(" · ");

  const card = (
    <Shard
      as="article"
      tone={p.status ? "accent" : "line"}
      className={p.link ? "group-hover:bg-accent/80 group-focus-visible:bg-accent" : ""}
      title={code("GIG", i + 1)}
      badge={
        p.status ? (
          <Badge solid pulse>
            {p.status}
          </Badge>
        ) : isRepo ? (
          <Badge tone="blue">public src</Badge>
        ) : undefined
      }
      code={meta || undefined}
    >
      <h3 className="font-serif text-[30px] leading-none tracking-[-0.01em] text-fg @md:text-[34px]">{p.name}</h3>
      <p className="mt-3 max-w-[60ch] text-[13px] leading-[1.75] text-muted">{p.about}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {p.tags.map((t) => (
            <Chip key={t}>#{t.replace(/\s+/g, "-")}</Chip>
          ))}
        </div>
        {p.link ? (
          <span className="hud-label chamfer-sm inline-flex items-center gap-1.5 border border-green/50 px-2.5 py-1 text-green transition-colors group-hover:border-green group-hover:bg-green/10">
            access · {hostLabel(p.link)}
            <ArrowUpRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={1.5}
              aria-hidden
            />
          </span>
        ) : (
          <span className="hud-label text-faint">no public link</span>
        )}
      </div>
    </Shard>
  );

  return (
    <li>
      {p.link ? (
        <a
          href={p.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${p.name} — ${hostLabel(p.link)}`}
          className="group block outline-none"
        >
          {card}
        </a>
      ) : (
        card
      )}
    </li>
  );
}

/** the readable, prominent version of projects.ts */
export function ProjectsIndex() {
  const github = activeSocials.find((s) => s.id === "github");

  return (
    <section aria-labelledby="work-title" id="work">
      <div className="flex items-baseline justify-between">
        <h2 id="work-title" className="sr-only">
          projects
        </h2>
        <Prompt cmd="ls -l ~/projects" />
        <span className="hud-label text-faint tabular-nums">{projects.length} gigs</span>
      </div>

      <ol className="mt-6 space-y-5">
        {projects.map((p, i) => (
          <Gig key={p.name} p={p} i={i} />
        ))}
      </ol>

      {github && (
        <p className="mt-6 text-[12px] text-faint">
          more experiments + configs (dwm, nvim, dotfiles) on{" "}
          <a href={github.href} target="_blank" rel="noopener noreferrer" className="link">
            github.com/{github.handle}
          </a>
        </p>
      )}
    </section>
  );
}
