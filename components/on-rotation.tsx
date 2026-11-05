import { listening } from "@/content/listening";
import { Badge, code, Shard } from "./cp";

function Equalizer() {
  return (
    <span aria-hidden className="inline-flex h-2.5 items-end gap-[2px]">
      {[0, 0.35, 0.7, 0.15].map((delay) => (
        <span
          key={delay}
          className="w-[2px] origin-bottom animate-eq bg-accent"
          style={{ height: "100%", animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}

/** "currently listening to", as an audio log */
export function OnRotation() {
  return (
    <Shard
      title="audio log · on rotation"
      code={<Equalizer />}
      badge={<Badge tone="accent">rec</Badge>}
      bodyClassName="p-0"
    >
      <ol>
        {listening.map((t, i) => (
          <li
            key={t.album}
            className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-line px-4 py-3 text-[13px] last:border-b-0"
          >
            <span className="hud-label text-faint">{code("TRK", i + 1)}</span>
            <span className="min-w-0 truncate">
              <span className="text-fg">{t.artist.toLowerCase()}</span>
              <span className="text-faint"> — </span>
              <span className="text-muted">{t.album.toLowerCase()}</span>
            </span>
            <span className="hud-label text-yellow tabular-nums">{t.year}</span>
          </li>
        ))}
      </ol>
    </Shard>
  );
}
