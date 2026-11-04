/**
 * Page-wide glitch: a ~320ms twitch of the whole page (see `html.glitching`
 * in globals.css) plus a few random neon noise bars on top.
 */

const DURATION = 320;
let busy = false;

export function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function glitch(intensity: 1 | 2 = 1) {
  if (busy || reducedMotion()) return false;
  busy = true;

  const root = document.documentElement;
  const bars = document.createElement("div");
  bars.className = "glitch-bars";
  bars.setAttribute("aria-hidden", "true");
  const n = 3 + Math.floor(Math.random() * 4) * intensity;
  for (let i = 0; i < n; i++) {
    const bar = document.createElement("span");
    bar.style.top = `${Math.random() * 100}%`;
    bar.style.height = `${2 + Math.random() * (10 * intensity)}px`;
    bar.style.left = `${Math.random() * 30}%`;
    bar.style.right = `${Math.random() * 30}%`;
    bar.style.animationDelay = `${Math.random() * 120}ms`;
    bar.dataset.tone = Math.random() > 0.5 ? "a" : "b";
    bars.append(bar);
  }
  document.body.append(bars);
  root.classList.add("glitching");

  window.setTimeout(() => {
    root.classList.remove("glitching");
    bars.remove();
    busy = false;
  }, DURATION);
  return true;
}
