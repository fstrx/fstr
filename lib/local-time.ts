import { useSyncExternalStore } from "react";
import { site } from "@/content/site";

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: site.timezone,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function subscribe(cb: () => void) {
  const id = window.setInterval(cb, 5_000);
  return () => window.clearInterval(id);
}

const getSnapshot = () => fmt.format(new Date());
const getServerSnapshot = () => "--:--";

/** "HH:MM" in the site's timezone; "--:--" during SSR. */
export function useLocalTime() {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hour = time === "--:--" ? null : Number(time.slice(0, 2));
  const status =
    hour === null ? "—" : hour < 7 ? "probably asleep" : hour < 9 ? "waking up" : "probably awake";
  return { time, hour, status };
}
