"use client";

import { MobileFullScreenModal } from "@/components/ui/mobile-full-screen-modal";
import { WorldCupPlayerCard } from "@/components/player/world-cup-player-card";
import { getPositionLabel } from "@/lib/players/types";
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
    matchdayPoints: player.currentMatchdayPoints ?? 0,
    upcomingFixture: player.upcomingFixture,
    matchDate: player.matchDate,
    managerNationAbbr: player.managerNationAbbr,
  };
}

export function AssignedPlayerPicker({
  open,
  onClose,
  slot,
  players,
  onSelect,
}: AssignedPlayerPickerProps) {
  if (!slot) return null;

  const positionLabel =
    slot.zone === "bench" ? "Any position" : getPositionLabel(slot.position);

  return (
    <MobileFullScreenModal
      open={open}
      onClose={onClose}
      title="Select Player"
      subtitle={`${positionLabel} · ${slot.zone === "starter" ? "Starting XI" : "Bench"}`}
    >
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
              variant="team"
              onClick={() => onSelect(player.id)}
            />
          ))}
        </div>
      )}
    </MobileFullScreenModal>
  );
}
