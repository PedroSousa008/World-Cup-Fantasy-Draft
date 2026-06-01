"use client";

import { cn } from "@/lib/utils";
import type { FantasyPlayer } from "@/lib/squad/squad-utils";
import type { SquadSlot } from "@/lib/squad/formations";
import { slotLabel } from "@/lib/squad/formations";
import { FantasyPlayerCard } from "@/components/player/fantasy-player-card";

interface PitchSlotCardProps {
  slot: SquadSlot;
  player: FantasyPlayer | null;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  onEmptyClick: () => void;
  onPlayerClick: () => void;
}

export function PitchSlotCard({
  slot,
  player,
  isCaptain,
  isViceCaptain,
  onEmptyClick,
  onPlayerClick,
}: PitchSlotCardProps) {
  if (!player) {
    return (
      <button
        type="button"
        onClick={onEmptyClick}
        className={cn(
          "flex min-h-[88px] w-full max-w-[72px] flex-col items-center justify-center gap-1 rounded-xl",
          "border-2 border-dashed border-white/30 bg-white/5 px-1 py-2",
          "transition-all duration-300 active:scale-95"
        )}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFD700]/15 text-lg text-[#FFD700]/70">
          +
        </span>
        <span className="text-center text-[8px] font-semibold leading-tight text-white/50">
          {slotLabel(slot.position, slot.zone)}
        </span>
      </button>
    );
  }

  return (
    <FantasyPlayerCard
      player={player}
      size="pitch"
      isCaptain={isCaptain}
      isViceCaptain={isViceCaptain}
      onClick={onPlayerClick}
    />
  );
}

export function BenchSlotCard({
  slot: _slot,
  player,
  isCaptain,
  onEmptyClick,
  onPlayerClick,
}: Omit<PitchSlotCardProps, "isViceCaptain">) {
  if (!player) {
    return (
      <button
        type="button"
        onClick={onEmptyClick}
        className={cn(
          "flex h-[130px] w-[96px] shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-2xl",
          "border-2 border-dashed border-[#FFD700]/25 bg-black/20",
          "transition-all duration-300 active:scale-95"
        )}
      >
        <span className="text-xl text-[#FFD700]/40">+</span>
        <span className="text-[9px] font-semibold text-white/40">Add Player</span>
      </button>
    );
  }

  return (
    <div className="shrink-0 snap-start">
      <FantasyPlayerCard
        player={player}
        size="bench"
        isCaptain={isCaptain}
        onClick={onPlayerClick}
      />
    </div>
  );
}
