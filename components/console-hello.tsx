"use client";

import { useEffect } from "react";

let greeted = false;

/** a small hello for anyone who opens devtools */
export function ConsoleHello() {
  useEffect(() => {
    if (greeted) return;
    greeted = true;
    console.log(
      "%cvarad / fstr%c\n\nhey, you opened devtools. respect.\nwindow 7 is a live shell (try help), and the editors take :commands\npsst: :crt, :matrix, :glitch\n",
      "font: 500 14px ui-monospace, monospace; color: #ff3e6c",
      "font: 12px ui-monospace, monospace; color: inherit",
    );
  }, []);
  return null;
}
