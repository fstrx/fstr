/**
 * :matrix / cmatrix easter egg. A full-screen canvas of falling glyphs,
 * coloured from the current theme tokens (so it follows :crt green/amber).
 * Any key or click exits, like the real cmatrix. Nothing persists.
 */

const GLYPHS =
  "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789<>=+*:;";
// sits under the :crt overlay (z 100/101) so scanlines draw over the rain
const FONT_PX = 16;
const FPS = 22;

let stop: (() => void) | null = null;

export const matrixRunning = () => stop !== null;

export function startMatrix(): boolean {
  if (stop) return false;

  const root = document.documentElement;
  const css = getComputedStyle(root);
  // rain on cream paper looks wrong: in plain light theme, use the dark palette
  const lightPaper = root.dataset.theme === "light" && !root.classList.contains("crt");
  const color = (name: string, fallback: string) =>
    lightPaper ? fallback : css.getPropertyValue(name).trim() || fallback;
  const bg = color("--bg", "#0c0b0a");
  const rain = color("--green", "#93b585");
  const head = color("--fg", "#e7e1d3");
  const family = getComputedStyle(document.body).fontFamily;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100vw;height:100vh;z-index:90;cursor:pointer;opacity:0;transition:opacity 400ms ease";
  const hint = document.createElement("div");
  hint.setAttribute("role", "status");
  hint.textContent = "cmatrix · press any key to exit";
  hint.style.cssText = `position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:91;font:11px ${family};letter-spacing:.08em;color:${rain};background:${bg};padding:4px 10px;border:1px solid ${rain};opacity:0;transition:opacity 400ms ease;pointer-events:none`;
  document.body.append(canvas, hint);

  const ctx = canvas.getContext("2d")!;
  let cols = 0;
  let drops: number[] = [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    cols = Math.ceil(window.innerWidth / FONT_PX);
    // start columns at random heights above the screen so it "pours in"
    drops = Array.from({ length: cols }, () => -Math.floor(Math.random() * (window.innerHeight / FONT_PX)));
  }

  const glyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

  function frame() {
    const h = window.innerHeight;
    // translucent wash = fading trails
    ctx.globalAlpha = 0.09;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, window.innerWidth, h);
    ctx.globalAlpha = 1;
    ctx.font = `${FONT_PX}px ${family}`;
    ctx.textBaseline = "top";

    for (let i = 0; i < cols; i++) {
      const y = drops[i] * FONT_PX;
      if (y >= 0) {
        // previous head becomes body
        ctx.fillStyle = rain;
        ctx.fillText(glyph(), i * FONT_PX, y - FONT_PX);
        ctx.fillStyle = head;
        ctx.fillText(glyph(), i * FONT_PX, y);
      }
      if (y > h && Math.random() > 0.975) drops[i] = -Math.floor(Math.random() * 20);
      drops[i] += 1;
    }
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(() => {
    canvas.style.opacity = "1";
    hint.style.opacity = "0.9";
  });

  let raf = 0;
  let last = 0;
  if (reduced) {
    // one still frame: fill the screen as if it had been raining a while
    for (let i = 0; i < 60; i++) frame();
  } else {
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden || now - last < 1000 / FPS) return;
      last = now;
      frame();
    };
    raf = requestAnimationFrame(tick);
  }

  // ignore the keystroke/click that launched it
  const startedAt = performance.now();
  const onExit = (e: Event) => {
    if (performance.now() - startedAt < 350) return;
    e.preventDefault();
    e.stopPropagation(); // don't let the exit key also trigger a shortcut
    stop?.();
  };
  window.addEventListener("keydown", onExit, true);
  canvas.addEventListener("pointerdown", onExit);

  stop = () => {
    stop = null;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    window.removeEventListener("keydown", onExit, true);
    canvas.style.opacity = "0";
    hint.style.opacity = "0";
    window.setTimeout(() => {
      canvas.remove();
      hint.remove();
    }, 420);
  };
  return true;
}

/** `:matrix` / `matrix` text response, shared by vim + shell */
export function matrixCommand(): { text: string } {
  return startMatrix()
    ? { text: "cmatrix: follow the green rain. any key to exit." }
    : { text: "cmatrix: already running" };
}
