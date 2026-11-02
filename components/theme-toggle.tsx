"use client";

import { Moon, Sun } from "lucide-react";
import { useLayoutEffect } from "react";
import { THEME_KEY, toggleTheme } from "@/lib/theme";

export function ThemeToggle() {
  // React strict-mode remounts reset <html> attrs in dev; re-apply. no-op in prod.
  useLayoutEffect(() => {
    try {
      const t = localStorage.getItem(THEME_KEY);
      if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
    } catch {}
  }, []);

  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      className="group inline-flex size-7 items-center justify-center text-muted transition-colors hover:text-fg"
      aria-label="toggle light / dark theme"
      title="toggle theme (:theme)"
    >
      {/* both icons render; css picks one, so there's no hydration mismatch */}
      <Moon className="size-[15px] light:hidden" strokeWidth={1.5} aria-hidden />
      <Sun className="size-[15px] dark:hidden" strokeWidth={1.5} aria-hidden />
    </button>
  );
}
