"use client";

import { useEffect } from "react";

let greeted = false;

/** a small hello for anyone who opens devtools */
export function ConsoleHello() {
  useEffect(() => {
    if (greeted) return;
    greeted = true;
    console.log(
      "%cvarad / fstr%c\n\nhey, you opened devtools. respect.\nthe editor takes commands — press : and try :help\n",
      "font: 500 14px ui-monospace, monospace; color: #d75b66",
      "font: 12px ui-monospace, monospace; color: inherit",
    );
  }, []);
  return null;
}
