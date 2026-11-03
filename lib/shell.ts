/**
 * The tiny shell at the bottom of the page. Pure: takes a command line,
 * returns output lines + an optional side effect for the component to run.
 * Never required for navigation — everything here is also clickable.
 */

import { experience } from "@/content/experience";
import { projects } from "@/content/projects";
import { activeSocials, site } from "@/content/site";
import type { WindowId } from "./active-file";
import { files } from "./files";

export type Line = { text: string; tone?: "muted" | "accent" | "green" | "fg"; href?: string };
export type Effect =
  | { kind: "window"; id: WindowId }
  | { kind: "theme"; theme?: "light" | "dark" }
  | { kind: "clear" };

export type Result = { lines: Line[]; effect?: Effect };

const DIRS: Record<string, WindowId> = {
  "~": "about",
  "/": "about",
  home: "about",
  projects: "projects",
  work: "projects",
  experience: "experience",
  interests: "interests",
  now: "now",
  src: "about",
  links: "about",
  ".well-known": "security",
  security: "security",
};

function findFile(arg: string) {
  const id = arg.replace(/^~\/?|^\.\//, "").replace(/^.*\//, "").replace(/\.(ts|txt)$/, "");
  return files.find((f) => f.id === id);
}

export const COMMANDS = [
  "help", "ls", "cat", "cd", "open", "whoami", "id", "neofetch", "projects",
  "experience", "contact", "theme", "date", "pwd", "uname", "echo", "history", "clear",
];

export function run(input: string, history: string[]): Result {
  const line = input.trim();
  if (!line) return { lines: [] };
  const [cmd, ...rest] = line.split(/\s+/);
  const arg = rest.join(" ");

  switch (cmd) {
    case "help":
    case "?":
      return {
        lines: [
          { text: "available commands:", tone: "muted" },
          { text: "  ls              list files" },
          { text: "  cat <file>      open that file's window" },
          { text: "  cd <dir>        projects · experience · interests · now · security · ~" },
          { text: "  projects        list projects" },
          { text: "  experience      git log, but for jobs" },
          { text: "  neofetch        system info, sort of" },
          { text: "  contact         ways to reach me" },
          { text: "  theme [light|dark]" },
          { text: "  whoami · id · date · pwd · uname · echo · history · clear" },
          { text: "the tmux bar below does all of this with clicks. this is just for fun.", tone: "muted" },
        ],
      };

    case "ls":
    case "ll":
    case "la":
      if (/projects/.test(arg)) return run("projects", history);
      return {
        lines: [
          { text: files.filter((f) => f.dir === "src").map((f) => f.name).join("  "), tone: "fg" },
          { text: ".well-known/security.txt", tone: "green" },
        ],
      };

    case "cat":
    case "less":
    case "vim":
    case "nvim":
    case "open":
    case "code": {
      if (!arg) return { lines: [{ text: `${cmd}: missing file operand`, tone: "accent" }] };
      if (/^\/etc\/(shadow|sudoers)/.test(arg))
        return { lines: [{ text: `${cmd}: ${arg}: Permission denied`, tone: "accent" }] };
      if (arg === "/etc/passwd")
        return {
          lines: [
            { text: "root:x:0:0::/root:/bin/bash" },
            { text: `${site.alias}:x:1000:1000::/home/${site.alias}:/bin/zsh` },
          ],
        };
      const f = findFile(arg);
      if (!f) return { lines: [{ text: `${cmd}: ${arg}: No such file or directory`, tone: "accent" }] };
      return { lines: [{ text: `opening ${f.path}…`, tone: "muted" }], effect: { kind: "window", id: f.id } };
    }

    case "cd": {
      const target = DIRS[arg.replace(/^~\//, "").replace(/\/$/, "") || "~"];
      if (!target) return { lines: [{ text: `cd: no such file or directory: ${arg}`, tone: "accent" }] };
      return { lines: [], effect: { kind: "window", id: target } };
    }

    case "projects":
      return {
        lines: projects.map((p) => ({
          text: `${p.name.toLowerCase().padEnd(12)} ${p.about}`,
          href: p.link,
          tone: p.link ? "green" : "fg",
        })),
      };

    case "experience":
    case "git":
      if (cmd === "git" && !/^log/.test(arg)) return { lines: [{ text: "try: git log", tone: "muted" }] };
      return {
        lines: experience.map((r) => ({
          text: `${r.to ? "○" : "●"} ${r.from}${r.to ? `..${r.to}` : "..now   "}  ${r.role.toLowerCase()} @ ${r.org.toLowerCase()}`,
          tone: r.to ? "fg" : "accent",
        })),
      };

    case "neofetch":
    case "fastfetch": {
      const rows: [string, string][] = [
        ["user", `${site.alias}@bhopal`],
        ["name", site.name.toLowerCase()],
        ["os", site.setup.os],
        ["wm", site.setup.wm],
        ["editor", site.setup.editor],
        ["shell", "zsh"],
        ["focus", site.focus.join(", ")],
        ["building", "aedura"],
        ["tz", `${site.timezone} (utc+05:30)`],
      ];
      return { lines: rows.map(([k, v]) => ({ text: `${k.padEnd(10)}${v}` })) };
    }

    case "contact":
    case "links":
      return { lines: activeSocials.map((s) => ({ text: `${s.label.padEnd(10)}${s.handle}`, href: s.href, tone: "green" })) };

    case "whoami":
      return { lines: [{ text: site.alias }] };
    case "id":
      return { lines: [{ text: `uid=1000(${site.alias}) gid=1000(${site.alias}) groups=1000(${site.alias}),10(wheel)` }] };
    case "pwd":
      return { lines: [{ text: `/home/${site.alias}` }] };
    case "uname":
      return { lines: [{ text: arg.includes("a") ? `Linux bhopal 6.x ${site.alias} x86_64 GNU/Linux` : "Linux" }] };
    case "date":
      return {
        lines: [
          {
            text: new Date().toLocaleString("en-GB", { timeZone: site.timezone, dateStyle: "full", timeStyle: "short" }).toLowerCase() + " ist",
          },
        ],
      };
    case "echo":
      return { lines: [{ text: arg }] };
    case "history":
      return { lines: history.map((h, i) => ({ text: `${String(i + 1).padStart(4)}  ${h}`, tone: "muted" as const })) };
    case "clear":
      return { lines: [], effect: { kind: "clear" } };
    case "theme":
      return {
        lines: [],
        effect: { kind: "theme", theme: arg === "light" || arg === "dark" ? arg : undefined },
      };

    case "sudo":
      return { lines: [{ text: `${site.alias} is not in the sudoers file. this incident will be reported.`, tone: "accent" }] };
    case "rm":
      return { lines: [{ text: "rm: nice try.", tone: "accent" }] };
    case "nmap":
      return { lines: [{ text: "1 host up. 0 interesting ports. it's a static site, there's nothing back here." }] };
    case "ssh":
      return { lines: [{ text: `${site.handle}: Permission denied (publickey).`, tone: "accent" }] };
    case "exit":
    case "logout":
      return { lines: [{ text: "you can't quit the internet. (closing the tab works though)", tone: "muted" }] };
    case "vi":
      return { lines: [{ text: "it's 2026. try nvim.", tone: "muted" }] };

    default:
      return { lines: [{ text: `zsh: command not found: ${cmd}`, tone: "accent" }, { text: "type help for a list.", tone: "muted" }] };
  }
}
