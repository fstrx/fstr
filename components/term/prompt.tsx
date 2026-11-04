"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";

/**
 * `fstr@bhopal ~ › <cmd>` — types the command out the first time it
 * scrolls into view. SSR / no-JS / reduced-motion show it fully typed.
 */
export function Prompt({ cmd, path = "~", className = "" }: { cmd: string; path?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        let i = 0;
        el.textContent = "";
        setTyping(true);
        timer = window.setInterval(() => {
          i += 1;
          el.textContent = cmd.slice(0, i);
          if (i >= cmd.length) {
            window.clearInterval(timer);
            setTyping(false);
          }
        }, 32);
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    // hide it until it starts typing, but only if it's below the fold
    const r = el.getBoundingClientRect();
    if (r.top > window.innerHeight || el.offsetParent === null) el.textContent = "";
    io.observe(el);

    return () => {
      io.disconnect();
      window.clearInterval(timer);
      el.textContent = cmd;
    };
  }, [cmd]);

  return (
    <p className={`text-[12.5px] leading-[1.7] ${className}`}>
      <span className="text-green">{site.handle}</span> <span className="text-faint">{path}</span>{" "}
      <span className="neon-text text-accent">›</span>{" "}
      <span ref={ref} className="text-fg">
        {cmd}
      </span>
      {typing && (
        <span aria-hidden className="ml-0.5 inline-block h-[1.05em] w-[0.6em] translate-y-[0.2em] bg-fg/70" />
      )}
    </p>
  );
}
