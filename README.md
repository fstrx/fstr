# varad / fstr

Personal site. Next.js (App Router) + TypeScript + Tailwind v4, managed with bun. Fully static.

```sh
bun install
bun dev          # http://localhost:3000
bun run build    # production build
bun run lint
```

## Editing content

Everything personal lives in `content/` — components never need touching for updates.

| file                    | what                                                           |
| ----------------------- | -------------------------------------------------------------- |
| `content/site.ts`       | name, location, timezone, email, socials, `updated` date       |
| `content/projects.ts`   | projects                                                       |
| `content/experience.ts` | roles, newest first (`to` omitted = current)                   |
| `content/interests.ts`  | interests, grouped by verb                                     |
| `content/now.ts`        | the /now snapshot — edit list, bump `updated`                  |
| `content/listening.ts`  | "on rotation" records                                          |

The editor's `.ts` files are generated from these (`lib/files.ts`), so code and the terminal output never drift apart.

Colours are CSS variables at the top of `app/globals.css` (dark + light).

## Domain

No domain is hardcoded. Once you have one, set `NEXT_PUBLIC_SITE_URL` (see `.env.example`); that enables `metadataBase`, the canonical URL, and the sitemap.

## Security

- `/.well-known/security.txt` (RFC 9116) is generated from `content/site.ts` by `lib/files.ts`.
  `Expires` = `site.updated` + 1 year, so **bump `updated` at least once a year** or it goes stale.
  `Canonical` is added automatically once `NEXT_PUBLIC_SITE_URL` is set.
- Security headers live in `next.config.ts`: CSP, HSTS, X-Frame-Options, nosniff,
  Referrer-Policy, COOP, Permissions-Policy; `X-Powered-By` is off. CSP allows
  `'unsafe-inline'` scripts (prerendered pages inline Next's hydration payload; nonces would
  force dynamic rendering) — everything else is same-origin only.
- Headers are applied by the Next server (`next start` / Vercel). A pure static export
  would need them configured on the host instead.
- HSTS has no `includeSubDomains`/`preload` yet; add them once the domain is settled.

## Keyboard

`1`–`6` open file · `[` `]` cycle · `j` `k` move line (editor focused) · `:` command line (`:help`).
