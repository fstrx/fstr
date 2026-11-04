/**
 * Boot sequence gate. The inline script runs in <head> before first paint:
 * if this tab hasn't booted yet (and motion is allowed) it adds
 * `html.booting`, which hides the page behind a solid cover until
 * <Boot/> mounts and plays the sequence. A 5s fail-safe removes the
 * class even if JS never hydrates, so the page can't get stuck hidden.
 */

export const BOOT_KEY = "booted";

export const bootScript = `(function(){try{var d=document.documentElement;if(sessionStorage.getItem("${BOOT_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.classList.add("booting");setTimeout(function(){d.classList.remove("booting")},5000)}catch(e){}})()`;

export function markBooted() {
  try {
    sessionStorage.setItem(BOOT_KEY, "1");
  } catch {}
  document.documentElement.classList.remove("booting");
}
