"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { markBooted } from "@/lib/boot";
import { files } from "@/lib/files";
import { glitch } from "@/lib/glitch";

/**
 * "jacking in" boot sequence, once per tab. Only runs if the inline
 * head script flagged `html.booting`. Any key / click skips it.
 */

const LINES: [label: string, value: string][] = [
  ["link", `${site.alias}@bhopal`],
  ["handshake", "ok"],
  ["auth", `uid=1000(${site.alias})`],
  ["mount", `/home/${site.alias}`],
  ["load", `src/*.ts · ${files.length} files`],
  ["render", "████████████ 100%"],
];
const STEP_MS = 140;

const hex = () =>
  Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, "0"),
  ).join(" ");

export function Boot() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"log" | "granted" | "out">("log");
  const [noise, setNoise] = useState<string[]>([]);

  // decide once on mount; the inline script already did the real check
  useEffect(() => {
    if (!document.documentElement.classList.contains("booting")) return;
    const id = window.setTimeout(() => {
      setNoise(Array.from({ length: 6 }, hex));
      setActive(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  // the sequence
  useEffect(() => {
    if (!active) return;
    let t: number;
    if (phase === "log") {
      t = window.setTimeout(
        () => (step < LINES.length ? setStep((s) => s + 1) : setPhase("granted")),
        step === 0 ? 220 : STEP_MS,
      );
    } else if (phase === "granted") {
      t = window.setTimeout(() => setPhase("out"), 650);
    } else {
      markBooted();
      glitch(3);
      t = window.setTimeout(() => setActive(false), 540);
    }
    return () => window.clearTimeout(t);
  }, [active, phase, step]);

  // skip
  useEffect(() => {
    if (!active || phase === "out") return;
    const skip = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      setPhase("out");
    };
    window.addEventListener("keydown", skip, true);
    window.addEventListener("pointerdown", skip, true);
    return () => {
      window.removeEventListener("keydown", skip, true);
      window.removeEventListener("pointerdown", skip, true);
    };
  }, [active, phase]);

  if (!active) return null;

  return (
    <div
      role="status"
      aria-label="loading"
      className={`boot fixed inset-0 z-[310] flex items-center justify-center bg-bg px-6 ${
        phase === "out" ? "boot-out" : phase === "granted" ? "boot-shake" : ""
      }`}
    >
      <div className="w-full max-w-[560px] text-[12.5px] leading-[1.9]">
        <div className="mb-6 flex items-center justify-between border-b border-line pb-2 text-micro uppercase">
          <span className="neon-text text-accent">
            {site.alias}
            {"//"}net
          </span>
          <span className="text-faint">jack-in · tty0</span>
        </div>

        <ul>
          {LINES.slice(0, step).map(([label, value], i) => (
            <li key={label} className="flex gap-3">
              <span className="text-green">[ok]</span>
              <span className="w-24 text-muted">{label}</span>
              <span className="min-w-0 flex-1 truncate text-faint">{"·".repeat(18)}</span>
              <span className={i === LINES.length - 1 ? "text-blue" : "text-fg"}>{value}</span>
            </li>
          ))}
          {phase === "log" && step < LINES.length && (
            <li className="flex gap-3">
              <span className="animate-blink text-accent">[..]</span>
              <span className="text-muted">{LINES[step][0]}</span>
            </li>
          )}
        </ul>

        <pre aria-hidden className="mt-6 overflow-hidden text-[10px] leading-[1.6] text-faint/70">
          {noise.slice(0, Math.min(step + 1, noise.length)).join("\n")}
        </pre>

        <p
          data-text="ACCESS GRANTED"
          className={`glitch mt-6 text-[22px] tracking-[0.3em] text-accent neon-text transition-opacity duration-150 ${
            phase === "log" ? "opacity-0" : "glitch-loud opacity-100"
          }`}
        >
          ACCESS GRANTED
        </p>

        <p className="mt-8 text-micro uppercase text-faint">press any key to skip</p>
      </div>
    </div>
  );
}
