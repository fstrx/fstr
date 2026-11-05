"use client";

import { CRT_MODES, setCrt, useCrt } from "@/lib/crt";
import { applyNeon, glitchLevel, hudOpen, neonLevel } from "@/lib/hud";
import { setSplit, SPLIT_DEFAULT, SPLIT_MAX, SPLIT_MIN, useSplit } from "@/lib/split";
import { Knob } from "./knob";
import { BuildLoader, IdCard, Panel, Radar, Scope, Telemetry } from "./widgets";

function Controls() {
  const glitch = glitchLevel.use();
  const neon = neonLevel.use();
  const split = useSplit();
  const crt = useCrt();

  return (
    <Panel title="controls" code="knobs">
      <div className="grid grid-cols-2 gap-x-2 gap-y-4">
        <Knob
          label="glitch"
          value={glitch}
          min={0}
          max={3}
          defaultValue={2}
          labels={["off", "low", "med", "high"]}
          onChange={(v) => glitchLevel.set(v)}
        />
        <Knob
          label="neon"
          value={neon}
          min={0}
          max={3}
          defaultValue={2}
          labels={["off", "soft", "std", "hot"]}
          onChange={(v) => {
            neonLevel.set(v);
            applyNeon(v);
          }}
        />
        <Knob
          label="split"
          value={Math.round(split)}
          min={SPLIT_MIN}
          max={SPLIT_MAX}
          defaultValue={SPLIT_DEFAULT}
          format={(v) => `${v}%`}
          onChange={(v) => setSplit(v)}
        />
        <Knob
          label="crt"
          value={CRT_MODES.indexOf(crt)}
          min={0}
          max={3}
          defaultValue={0}
          labels={["off", "on", "grn", "amb"]}
          onChange={(v) => setCrt(CRT_MODES[v])}
        />
      </div>
      <p className="mt-3 text-center text-[10px] text-faint">drag · scroll · arrows · dbl-click resets</p>
    </Panel>
  );
}

/** right-hand HUD rail. wide screens only; toggled from the header or `:hud`. */
export function HudRail() {
  const open = hudOpen.use();
  if (!open) return null;

  return (
    <aside
      aria-label="hud"
      className="scroll-quiet hidden w-[280px] shrink-0 flex-col gap-3 overflow-y-auto border-l border-line bg-surface/40 p-3 xl:flex"
    >
      <div className="flex items-center gap-2">
        <span className="hud-label text-accent neon-text">hud</span>
        <span aria-hidden className="hatch h-2.5 flex-1" />
        <span className="hud-label text-faint">sys v2.0</span>
      </div>
      <IdCard />
      <Controls />
      <Telemetry />
      <Scope />
      <Radar />
      <BuildLoader />
      <p className="hud-label pb-1 text-center text-faint">{"// end of feed"}</p>
    </aside>
  );
}
