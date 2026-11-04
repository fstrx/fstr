/**
 * Page-wide glitch: a short twitch of the whole page (see `html.glitching`
 * / `html.glitching-loud` in globals.css) plus random neon noise bars.
 *
 * intensity 1 = ambient, 2 = a bit more, 3 = the jack-in reveal.
 */

type Intensity = 1 | 2 | 3;

const DURATION: Record<Intensity, number> = { 1: 380, 2: 420, 3: 640 };
let busy = false;

export function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function glitch(intensity: Intensity = 1) {
  if (busy || reducedMotion()) return false;
  busy = true;

  const loud = intensity === 3;
  const root = document.documentElement;
  const bars = document.createElement("div");
  bars.className = loud ? "glitch-bars loud" : "glitch-bars";
  bars.setAttribute("aria-hidden", "true");

  const n = loud ? 14 + Math.floor(Math.random() * 8) : 4 + Math.floor(Math.random() * 4) + (intensity - 1) * 3;
  const maxH = loud ? 42 : 8 + intensity * 6;
  const tones = loud ? ["a", "b", "c"] : ["a", "b"];
  for (let i = 0; i < n; i++) {
    const bar = document.createElement("span");
    bar.style.top = `${Math.random() * 100}%`;
    bar.style.height = `${2 + Math.random() * maxH}px`;
    bar.style.left = `${Math.random() * (loud ? 15 : 30)}%`;
    bar.style.right = `${Math.random() * (loud ? 15 : 30)}%`;
    bar.style.animationDelay = `${Math.random() * (loud ? 260 : 120)}ms`;
    bar.dataset.tone = tones[(Math.random() * tones.length) | 0];
    bars.append(bar);
  }
  document.body.append(bars);
  const cls = loud ? "glitching-loud" : "glitching";
  root.classList.add(cls);

  window.setTimeout(() => {
    root.classList.remove(cls);
    bars.remove();
    busy = false;
  }, DURATION[intensity]);
  return true;
}
