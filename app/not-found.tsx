import type { Metadata } from "next";
import Link from "next/link";
import { MissingPath } from "@/components/missing-path";
import { Wordmark } from "@/components/site-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/content/site";
import { files } from "@/lib/files";

export const metadata: Metadata = {
  title: "404",
  robots: { index: false },
};

function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <>
      <p className="mt-4 text-faint first:mt-0">
        <span className="text-green">{site.handle}</span> ~/{site.alias}
      </p>
      <p className="text-fg">
        <span className="text-accent">›</span> {children}
      </p>
    </>
  );
}

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[760px] flex-col px-4 sm:px-6">
      <header className="flex items-center justify-between py-6 sm:py-8">
        <Link href="/" aria-label="varad / fstr — home">
          <Wordmark />
        </Link>
        <ThemeToggle />
      </header>

      <main id="main" className="flex flex-1 flex-col justify-center pb-24">
        <p className="mb-4 text-micro uppercase text-faint">fig. 404 — file not found</p>
        <h1 className="font-serif text-[44px] leading-none text-fg sm:text-[60px]">
          nothing here<span className="text-accent">.</span>
        </h1>

        <div className="relative mt-10 border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="text-micro uppercase text-muted">terminal</span>
            <span className="text-micro uppercase text-faint">exit 1</span>
          </div>
          <div className="px-4 py-4 text-[12.5px] leading-[1.7]">
            <Prompt>
              cat <MissingPath />
            </Prompt>
            <p className="text-accent">
              cat: <MissingPath />: no such file or directory
            </p>

            <Prompt>ls src/</Prompt>
            <p className="flex flex-wrap gap-x-5">
              {files.map((f) => (
                <Link key={f.id} href={`/#${f.id}`} className="link">
                  {f.name}
                </Link>
              ))}
            </p>

            <Prompt>
              cd{" "}
              <Link href="/" className="link">
                ~
              </Link>
            </Prompt>
          </div>
        </div>

        <p className="mt-6 font-sans text-[14px] text-muted">
          probably a typo, a dead link, or something i moved. the homepage is a safe bet.
        </p>
      </main>
    </div>
  );
}
