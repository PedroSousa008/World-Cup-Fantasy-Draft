"use client";

import { X } from "lucide-react";
import { WorldCupPlayerCard } from "@/components/player/world-cup-player-card";
import { getPositionLabel } from "@/lib/players/types";
import { slotLabel } from "@/lib/squad/formations";
import type { SquadSlot } from "@/lib/squad/formations";
import type { FantasyPlayer } from "@/lib/squad/squad-utils";

interface AssignedPlayerPickerProps {
  open: boolean;
  onClose: () => void;
  slot: SquadSlot | null;
  players: FantasyPlayer[];
  onSelect: (playerId: string) => void;
}

function toCardData(player: FantasyPlayer) {
  return {
    id: player.id,
    name: player.name,
    photoUrl: player.photoUrl,
    nation: player.nation,
    position: player.position,
    totalPoints: player.totalPoints,
    matchdayPoints: player.matchdayPoints,
    upcomingFixture: player.upcomingFixture,
    matchDate: player.matchDate,
  };
}

export function AssignedPlayerPicker({
  open,
  onClose,
  slot,
  players,
  onSelect,
}: AssignedPlayerPickerProps) {
  if (!open || !slot) return null;

  const title =
    slot.zone === "bench"
      ? "Select player"
      : `Select ${getPositionLabel(slot.position)}`;

  return (
    <div className="fixed inset-0 z-[110] flex flex-col bg-[#081120]">
      <div className="wc-glass flex items-center justify-between border-b px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div>
          <p className="text-xs text-white/45">{slotLabel(slot.position, slot.zone)}</p>
          <p className="font-bold text-white">{title}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 pb-[env(safe-area-inset-bottom)]">
        {players.length === 0 ? (
          <p className="py-12 text-center text-sm text-white/50">
            No assigned players available for this position.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {players.map((player) => (
              <WorldCupPlayerCard
                key={player.id}
                player={toCardData(player)}
                size="draft"
                onClick={() => onSelect(player.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
