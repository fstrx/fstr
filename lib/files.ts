/**
 * Builds the "source files" shown in the editor from /content.
 * Edit /content, not this file — the code below just serializes it.
 */

import { interests } from "@/content/interests";
import { now } from "@/content/now";
import { projects } from "@/content/projects";
import { activeSocials, site } from "@/content/site";

export const FILE_IDS = ["about", "projects", "interests", "now", "security"] as const;
export type FileId = (typeof FILE_IDS)[number];

export type EditorFile = {
  id: FileId;
  name: string;
  path: string;
  dir: "src" | ".well-known";
  lang: "ts" | "txt";
  /** line the cursor starts on */
  cursor: number;
  source: string;
};

const s = (v: string) => JSON.stringify(v);
const arr = (items: string[]) => `[${items.map(s).join(", ")}]`;

function aboutSource() {
  const links = activeSocials.map((l) => `  ${l.id}: ${s(l.href)},`);

  return [
    `// about.ts`,
    `// the short version. the long one has more rabbit holes.`,
    ``,
    `export const varad = {`,
    `  name: ${s(site.name)},`,
    `  alias: ${s(site.alias)},`,
    `  location: ${s(site.location)},`,
    `  occupation: ${arr(["student", "developer", "founder"])},`,
    `  currently: ${s(site.currently)},`,
    `  timezone: ${s(site.timezone)}, // UTC+05:30`,
    `  into: ${arr([...site.focus])},`,
    `} as const;`,
    ``,
    `export const setup = {`,
    `  os: ${s(site.setup.os)},`,
    `  wm: ${s(site.setup.wm)},`,
    `  editor: ${s(site.setup.editor)}, // this page is cosplaying as it`,
    `};`,
    ``,
    `export const elsewhere = {`,
    ...links,
    `};`,
  ].join("\n");
}

function projectsSource() {
  const body = projects.flatMap((p) => {
    const lines = [`  {`, `    name: ${s(p.name)},`, `    about: ${s(p.about)},`];
    if (p.role) lines.push(`    role: ${s(p.role)},`);
    if (p.status) lines.push(`    status: ${s(p.status)},`);
    if (p.lang) lines.push(`    lang: ${s(p.lang)},`);
    lines.push(`    tags: ${arr(p.tags)},`);
    if (p.link) lines.push(`    link: ${s(p.link)},`);
    lines.push(`  },`);
    return lines;
  });

  return [
    `// projects.ts`,
    `// things i've built, am building, or keep breaking.`,
    ``,
    `type Project = {`,
    `  name: string;`,
    `  about: string;`,
    `  tags: string[];`,
    `  role?: string;`,
    `  link?: string;`,
    `};`,
    ``,
    `export const projects: Project[] = [`,
    ...body,
    `];`,
  ].join("\n");
}

function interestsSource() {
  return [
    `// interests.ts`,
    `// core stuff first. subject to change without notice.`,
    ``,
    `export const interests = {`,
    ...interests.map((g) => `  ${g.verb}: ${arr(g.items)},`),
    `} satisfies Record<string, string[]>;`,
  ].join("\n");
}

function nowSource() {
  return [
    `// now.ts`,
    `// what i'm up to at the moment.`,
    `// last updated: ${now.updated}`,
    ``,
    `export const now = [`,
    ...now.items.map((item) => `  ${s(item)},`),
    `] as const;`,
    ``,
    `export const location = ${s(site.location.toLowerCase())};`,
  ].join("\n");
}

/**
 * RFC 9116 security.txt. Served for real at /.well-known/security.txt
 * (app/.well-known/security.txt/route.ts) and shown in the editor.
 * Expires is one year after `site.updated`; bump `updated` to renew.
 */
export function securityTxt() {
  const [y, m, d] = site.updated.split("-");
  // order = preference (rfc 9116 §2.5.3): email first
  const contacts = ["email", "x"].flatMap((id) => activeSocials.filter((l) => l.id === id));
  return [
    `# security.txt — rfc 9116`,
    `#`,
    `# found something broken or exploitable in this site`,
    `# or in any of my repos? please report it privately first.`,
    `# no bounty, but you'll get credit if you want it.`,
    ``,
    ...contacts.map((l) => `Contact: ${l.href}`),
    `Expires: ${Number(y) + 1}-${m}-${d}T00:00:00.000Z`,
    `Preferred-Languages: en`,
    ...(site.url ? [`Canonical: ${new URL("/.well-known/security.txt", site.url)}`] : []),
  ].join("\n");
}

export const files: EditorFile[] = [
  { id: "about", name: "about.ts", path: "src/about.ts", dir: "src", lang: "ts", cursor: 4, source: aboutSource() },
  { id: "projects", name: "projects.ts", path: "src/projects.ts", dir: "src", lang: "ts", cursor: 12, source: projectsSource() },
  { id: "interests", name: "interests.ts", path: "src/interests.ts", dir: "src", lang: "ts", cursor: 4, source: interestsSource() },
  { id: "now", name: "now.ts", path: "src/now.ts", dir: "src", lang: "ts", cursor: 5, source: nowSource() },
  {
    id: "security",
    name: "security.txt",
    path: ".well-known/security.txt",
    dir: ".well-known",
    lang: "txt",
    cursor: 7,
    source: securityTxt(),
  },
];

export const isFileId = (v: string): v is FileId =>
  (FILE_IDS as readonly string[]).includes(v);

/** `export const foo` / `type Foo` lines, for the outline view */
export function outline(source: string, lang: EditorFile["lang"] = "ts") {
  if (lang === "txt") {
    return source.split("\n").flatMap((line, i) => {
      const m = line.match(/^([A-Za-z-]+):/);
      return m ? [{ kind: "field" as const, name: m[1], line: i + 1 }] : [];
    });
  }
  return source.split("\n").flatMap((line, i) => {
    const m = line.match(/^(?:export\s+)?(const|type)\s+([A-Za-z_$][\w$]*)/);
    return m ? [{ kind: m[1] as "const" | "type" | "field", name: m[2], line: i + 1 }] : [];
  });
}
