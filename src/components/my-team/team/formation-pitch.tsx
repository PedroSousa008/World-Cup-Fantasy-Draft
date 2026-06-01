"use client";

import { cn } from "@/lib/utils";
import type { SquadSlot } from "@/lib/squad/formations";
import type { FantasyPlayer } from "@/lib/squad/squad-utils";
import { PitchSlotCard } from "@/components/my-team/team/pitch-slot-card";

interface FormationPitchProps {
  starterSlots: SquadSlot[];
  getPlayer: (slotId: string) => FantasyPlayer | null;
  captainId: string | null;
  viceCaptainId: string | null;
  onEmptyClick: (slotId: string) => void;
  onPlayerClick: (slotId: string) => void;
}

function PitchMarkings() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Touchlines */}
      <div className="absolute inset-x-3 top-2 bottom-2 rounded-sm border border-white/25" />

      {/* Halfway line (top of attacking half) */}
      <div className="absolute inset-x-3 top-2 h-px bg-white/30" />

      {/* Half center circle at top */}
      <div className="absolute left-1/2 top-2 h-[52px] w-[104px] -translate-x-1/2 rounded-b-full border border-b-white/25 border-l-white/25 border-r-white/25 border-t-transparent" />

      {/* Penalty area (bottom — GK end) */}
      <div className="absolute bottom-2 left-1/2 h-[72px] w-[58%] -translate-x-1/2 border border-b-0 border-white/25" />

      {/* Goal area (six-yard box) */}
      <div className="absolute bottom-2 left-1/2 h-[36px] w-[32%] -translate-x-1/2 border border-b-0 border-white/25" />

      {/* Goal line accent */}
      <div className="absolute inset-x-3 bottom-2 h-0.5 bg-white/35" />
    </div>
  );
}

export function FormationPitch({
  starterSlots,
  getPlayer,
  captainId,
  viceCaptainId,
  onEmptyClick,
  onPlayerClick,
}: FormationPitchProps) {
  const lines = {
    FWD: starterSlots.filter((s) => s.position === "FWD"),
    MID: starterSlots.filter((s) => s.position === "MID"),
    DEF: starterSlots.filter((s) => s.position === "DEF"),
    GK: starterSlots.filter((s) => s.position === "GK"),
  };

  const rowGap = (count: number) => (count >= 5 ? "gap-x-1" : count >= 4 ? "gap-x-1.5" : "gap-x-2");

  return (
    <div className="relative mx-3 overflow-hidden rounded-2xl border border-white/10 shadow-lg sm:mx-4">
      {/* FPL-style attacking half — gradient grass */}
      <div className="relative bg-gradient-to-b from-[#3a9458] via-[#2d8048] to-[#1e6b38] px-2 py-4 sm:px-3 sm:py-5">
        {/* Subtle grass stripes */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 28px)",
          }}
        />

        <PitchMarkings />

        <div className="relative flex flex-col gap-3 sm:gap-4">
          {(["FWD", "MID", "DEF", "GK"] as const).map((line) => (
            <div
              key={line}
              className={cn(
                "grid w-full items-end justify-items-center",
                rowGap(lines[line].length),
                line === "GK" && "pb-1"
              )}
              style={{
                gridTemplateColumns: `repeat(${lines[line].length}, minmax(0, 1fr))`,
              }}
            >
              {lines[line].map((slot) => {
                const player = getPlayer(slot.id);
                return (
                  <PitchSlotCard
                    key={slot.id}
                    slot={slot}
                    player={player}
                    isCaptain={player?.id === captainId}
                    isViceCaptain={player?.id === viceCaptainId}
                    onEmptyClick={() => onEmptyClick(slot.id)}
                    onPlayerClick={() => onPlayerClick(slot.id)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
