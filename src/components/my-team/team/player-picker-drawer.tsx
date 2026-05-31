"use client";

import { useState, useMemo } from "react";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FantasyPlayerCard } from "@/components/player/fantasy-player-card";
import type { FantasyPlayer } from "@/lib/squad/squad-utils";
import type { SquadSlot } from "@/lib/squad/formations";
import { slotLabel } from "@/lib/squad/formations";

interface PlayerPickerDrawerProps {
  open: boolean;
  onClose: () => void;
  slot: SquadSlot | null;
  players: FantasyPlayer[];
  ownerPoolEmpty: boolean;
  onSelect: (playerId: string) => void;
  onViewProfile: (playerId: string) => void;
}

export function PlayerPickerDrawer({
  open,
  onClose,
  slot,
  players,
  ownerPoolEmpty,
  onSelect,
  onViewProfile,
}: PlayerPickerDrawerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return players.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [players, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex flex-col bg-[#081120]">
      <div className="wc-glass flex items-center justify-between border-b px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div>
          <p className="text-xs text-white/45">Assign Player</p>
          <p className="font-bold text-white">
            {slot ? slotLabel(slot.position, slot.zone) : "Player"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3 border-b border-white/8 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type="search"
            placeholder="Search player..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border-0 bg-white/10 pl-10 pr-4 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/40"
          />
        </div>
        <p className="text-[10px] text-white/40">
          Only players assigned to your team by the Owner are available.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 pb-[env(safe-area-inset-bottom)]">
        {ownerPoolEmpty ? (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-[#FFD700]">No players assigned yet</p>
            <p className="mt-2 text-xs text-white/40">
              Wait for the Owner to assign drafted players to your team.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-white/40">
            No available {slot?.position} players for this slot.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((player) => (
              <div key={player.id} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <FantasyPlayerCard player={player} size="list" />
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  <Button size="sm" onClick={() => onSelect(player.id)}>
                    Select
                  </Button>
                  <button
                    type="button"
                    onClick={() => onViewProfile(player.id)}
                    className="text-[10px] font-semibold text-[#FFD700]"
                  >
                    Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
