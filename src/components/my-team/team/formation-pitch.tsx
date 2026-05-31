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
  onPlayerClick: (slotId: string, playerId: string) => void;
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

  return (
    <div className="relative mx-4 overflow-hidden rounded-3xl border border-[#00C853]/25 shadow-[0_8px_40px_rgba(0,200,83,0.12)]">
      {/* Pitch surface */}
      <div className="relative bg-gradient-to-b from-[#1a6b38] via-[#1e7a40] to-[#155a30] px-3 py-5">
        {/* Pitch markings */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
          <div className="absolute inset-x-4 inset-y-3 rounded-2xl border-2 border-white" />
          <div className="absolute left-1/2 top-3 bottom-3 w-px -translate-x-1/2 bg-white" />
          <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white" />
          <div className="absolute left-1/2 top-3 h-10 w-20 -translate-x-1/2 border-2 border-b-0 border-white" />
          <div className="absolute bottom-3 left-1/2 h-10 w-20 -translate-x-1/2 border-2 border-t-0 border-white" />
        </div>

        {/* Subtle ball-pattern overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,102,255,0.08),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(0,200,83,0.06),transparent_50%)]" />

        <div className="relative space-y-3 transition-all duration-500 ease-out">
          {(["FWD", "MID", "DEF", "GK"] as const).map((line) => (
            <div
              key={line}
              className={cn(
                "flex justify-center gap-2 transition-all duration-500",
                line === "GK" && "pt-1"
              )}
              style={{ gap: lines[line].length > 4 ? "4px" : "8px" }}
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
                    onPlayerClick={() => player && onPlayerClick(slot.id, player.id)}
                    draggable
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
