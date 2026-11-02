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

/** "currently listening to" — a small spec-sheet style panel */
export function OnRotation() {
  return (
    <section aria-labelledby="rotation-title" className="relative border border-line">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <h2 id="rotation-title" className="text-micro uppercase text-muted">
          on rotation
        </h2>
        <span className="flex items-center gap-2 text-micro uppercase text-faint">
          <Equalizer />
          listening
        </span>
      </div>

      <ol className="divide-y divide-line">
        {listening.map((t, i) => (
          <li key={t.album} className="flex items-baseline gap-4 px-4 py-2.5 text-[12.5px]">
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
    </section>
  );
}
