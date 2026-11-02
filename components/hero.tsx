import { site } from "@/content/site";
import { AsciiTorus } from "./ascii-torus";
import { DecodeText } from "./decode-text";

export function Hero() {
  return (
    <section
      aria-labelledby="hello"
      className="grid gap-10 pt-8 pb-14 sm:pt-14 sm:pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:items-center lg:gap-16"
    >
      <div>
        <p className="mb-6 text-micro uppercase text-faint">
          <span className="text-accent">●</span>&nbsp;{" "}
          <DecodeText
            text={`uid=1000(${site.alias}) · ${site.location.toLowerCase()} · ${site.currently.toLowerCase()}`}
          />
        </p>

        <h1
          id="hello"
          className="font-serif text-[44px] leading-[1] tracking-[-0.01em] text-fg sm:text-[64px]"
        >
          hi, i&apos;m varad<span className="text-accent">.</span>
          <span
            aria-hidden
            className="ml-2 inline-block h-[0.68em] w-[0.3em] translate-y-[0.04em] animate-blink bg-fg/55"
          />
        </h1>

        <div className="mt-8 max-w-[56ch] space-y-4 font-sans text-[15px] leading-[1.7] text-muted sm:text-[15.5px]">
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
      </div>

      <AsciiTorus />
    </section>
  );
}
