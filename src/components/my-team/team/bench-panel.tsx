"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SquadSlot } from "@/lib/squad/formations";
import type { FantasyPlayer } from "@/lib/squad/squad-utils";
import { BenchSlotCard } from "@/components/my-team/team/pitch-slot-card";

interface BenchPanelProps {
  open: boolean;
  onToggle: () => void;
  benchSlots: SquadSlot[];
  getPlayer: (slotId: string) => FantasyPlayer | null;
  captainId: string | null;
  onEmptyClick: (slotId: string) => void;
  onPlayerClick: (slotId: string, playerId: string) => void;
}

export function BenchPanel({
  open,
  onToggle,
  benchSlots,
  getPlayer,
  captainId,
  onEmptyClick,
  onPlayerClick,
}: BenchPanelProps) {
  return (
    <div className="mx-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-white/10 font-bold text-white transition-all active:scale-[0.98]"
      >
        {open ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        {open ? "Close Bench" : "Open Bench"}
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">7 slots</span>
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-500 ease-out",
          open ? "mt-3 max-h-[200px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
          Bench · drag to swap with starters
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {benchSlots.map((slot) => {
            const player = getPlayer(slot.id);
            return (
              <BenchSlotCard
                key={slot.id}
                slot={slot}
                player={player}
                isCaptain={player?.id === captainId}
                onEmptyClick={() => onEmptyClick(slot.id)}
                onPlayerClick={() => player && onPlayerClick(slot.id, player.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
