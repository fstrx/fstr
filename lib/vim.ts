/**
 * `:commands` for the vim-ish status line. Pure-ish: returns a message,
 * may switch windows / theme as a side effect.
 */

import { site } from "@/content/site";
import { openWindow } from "./active-file";
import { crtCommand } from "./crt";
import { glitch } from "./glitch";
import { hudOpen } from "./hud";
import { matrixCommand } from "./matrix";
import { files } from "./files";
import { setTheme, toggleTheme } from "./theme";

export type Message = { text: string; error?: boolean } | null;

/* ── :commands (the easter egg) ──────────────────────────── */

export function runCommand(raw: string, ctx: { setLine: (n: number) => void }): Message {
  const input = raw.trim().replace(/^:/, "");
  if (!input) return null;
  const [name, ...args] = input.split(/\s+/);
  const arg = args.join(" ");

  if (/^\d+$/.test(name)) {
    ctx.setLine(Number(name));
    return null;
  }

  switch (name) {
    case "e":
    case "edit":
    case "open":
    case "b": {
      const id = arg.replace(/^.*\//, "").replace(/\.(ts|txt)$/, "");
      const f = files.find((x) => x.id === id);
      if (f) {
        openWindow(f.id);
        return { text: `"${f.path}" opened` };
      }
      return { text: arg ? `E212: can't open file "${arg}"` : "E32: no file name", error: true };
    }
    case "ls":
    case "files":
      return { text: files.map((f, i) => `${i + 1} ${f.name}`).join("   ") };
    case "theme":
    case "colorscheme":
    case "colo":
      if (arg === "light" || arg === "dark") {
        setTheme(arg);
        return { text: `theme: ${arg}` };
      }
      return { text: `theme: ${toggleTheme()}` };
    // easter egg: deliberately not listed in :help
    case "crt":
      return crtCommand(arg);
    case "matrix":
    case "cmatrix":
      return matrixCommand();
    case "hud": {
      const next = arg === "on" ? true : arg === "off" ? false : !hudOpen.get();
      hudOpen.set(next);
      return { text: `hud: ${next ? "on" : "off"}${next ? " (wide screens)" : ""}` };
    }
    case "glitch":
      return glitch(arg === "loud" ? 3 : 2) ? { text: "s̷y̶s̴:: signal unstable" } : { text: "glitch: reduced motion is on, the signal stays clean" };
    case "set":
      if (arg === "crt") return crtCommand("on");
      if (arg === "nocrt") return crtCommand("off");
      if (/^(bg|background)=(light|dark)$/.test(arg)) {
        const t = arg.split("=")[1] as "light" | "dark";
        setTheme(t);
        return { text: `background=${t}` };
      }
      return { text: `E518: unknown option: ${arg || "(none)"}`, error: true };
    case "q":
    case "q!":
    case "qa":
    case "qa!":
    case "wq":
    case "wq!":
    case "x":
    case "exit":
      return { text: "E37: you can't quit the internet. (closing the tab works though)", error: true };
    case "w":
      return { text: "E45: 'readonly' option is set. this is my website, after all.", error: true };
    case "whoami":
      return { text: `${site.alias} — ${site.name.toLowerCase()}, ${site.location.toLowerCase()}` };
    case "sudo":
      return { text: `${site.alias} is not in the sudoers file. this incident will be reported.`, error: true };
    case "id":
      return { text: `uid=1000(${site.alias}) gid=1000(${site.alias}) groups=1000(${site.alias}),10(wheel)` };
    case "nmap":
      return { text: "1 host up. 0 interesting ports. it's a static site, there's nothing back here." };
    case "ssh":
      return { text: `${site.handle}: Permission denied (publickey).`, error: true };
    case "cat":
    case "less":
    case "vim":
    case "nvim":
      if (/^\/etc\/(shadow|sudoers)/.test(arg)) return { text: `${name}: ${arg}: Permission denied`, error: true };
      if (arg === "/etc/passwd")
        return { text: `root:x:0:0::/root:/bin/bash  ${site.alias}:x:1000:1000::/home/${site.alias}:/bin/zsh` };
      return runCommand(`e ${arg}`, ctx);
    case "help":
    case "h":
      return { text: ":e <file>  :ls  :<line>  :theme  :id  :whoami  :q   (there are a few more)" };
    default:
      return { text: `E492: not an editor command: ${input}`, error: true };
  }
}

