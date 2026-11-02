/**
 * Site-wide identity + configuration.
 *
 * Everything personal lives in /content so the site can be updated
 * without touching components. No domain is hardcoded anywhere:
 * set NEXT_PUBLIC_SITE_URL at deploy time (see .env.example).
 */

export const site = {
  name: "Varad Sharma",
  alias: "fstr",
  handle: "fstr@bhopal",
  location: "Bhopal, India",
  timezone: "Asia/Kolkata",
  timezoneLabel: "IST",
  currently: "building Aedura",
  description:
    "varad sharma (fstr) — student, developer, and founder from bhopal, india. into systems and security: how things are engineered, programmed, designed, and how they break.",
  /** the core four, in order. shown in about.ts + the about output */
  focus: ["systems", "security", "os", "ai"],
  /** used for security.txt + the contact link */
  email: "fstrone@proton.me",
  /** daily driver. see github.com/fstrx/dwm, /slstatus, /nvim-config */
  setup: { os: "linux", wm: "dwm", editor: "neovim" },
  /** shown in the footer + now.ts. bump this when you edit /content. */
  updated: "2026-11-02",
  /**
   * Absolute URL of the deployed site, e.g. "https://example.com".
   * Left undefined until a domain is chosen.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL || undefined,
} as const;

export type Social = {
  id: "github" | "x" | "linkedin" | "email";
  label: string;
  /** what's shown in the editor / output, e.g. "@fstrxrr" */
  handle: string;
  href?: string;
};

/** Links with no `href` are hidden everywhere until filled in. */
export const socials: Social[] = [
  { id: "github", label: "github", handle: "fstrx", href: "https://github.com/fstrx" },
  { id: "x", label: "x", handle: "@fstrxrr", href: "https://x.com/fstrxrr" },
  { id: "linkedin", label: "linkedin", handle: "varads19", href: "https://www.linkedin.com/in/varads19" },
  { id: "email", label: "email", handle: site.email, href: `mailto:${site.email}` },
];

export const activeSocials = socials.filter(
  (s): s is Social & { href: string } => Boolean(s.href),
);
