import { listening } from "@/content/listening";

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

/** "currently listening to" — sits in the elsewhere row */
export function OnRotation() {
  return (
    <div>
      <h2 id="rotation-title" className="mb-5 flex items-center justify-between text-[12.5px] text-faint">
        <span>
          <span className="text-accent">{"//"}</span> on rotation
        </span>
        <Equalizer />
      </h2>
      <ol aria-labelledby="rotation-title" className="divide-y divide-line border-y border-line">
        {listening.map((t, i) => (
          <li key={t.album} className="flex items-baseline gap-4 py-3 text-[13px]">
            <span className="w-4 text-[10px] text-faint tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <span className="min-w-0 flex-1 truncate">
              <span className="text-fg">{t.artist.toLowerCase()}</span>
              <span className="text-faint"> — </span>
              <span className="text-muted">{t.album.toLowerCase()}</span>
            </span>
            <span className="text-[11px] text-accent tabular-nums">{t.year}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
