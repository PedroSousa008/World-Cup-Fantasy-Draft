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
  onPlayerClick: (slotId: string) => void;
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
    <div className="mx-4 mb-2">
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
          "transition-[max-height,opacity,margin] duration-500 ease-out",
          open ? "mt-3 max-h-[520px] opacity-100" : "mt-0 max-h-0 opacity-0"
        )}
      >
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
          Bench · tap player to substitute
        </p>
        <div
          className={cn(
            "flex items-start gap-3 overflow-x-auto overflow-y-visible pb-6 pt-1",
            "scrollbar-none scroll-contain-x snap-x snap-mandatory",
            "pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          )}
        >
          {benchSlots.map((slot) => {
            const player = getPlayer(slot.id);
            return (
              <BenchSlotCard
                key={slot.id}
                slot={slot}
                player={player}
                isCaptain={player?.id === captainId}
                onEmptyClick={() => onEmptyClick(slot.id)}
                onPlayerClick={() => onPlayerClick(slot.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
