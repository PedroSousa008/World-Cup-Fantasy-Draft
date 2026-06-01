"use client";

import { memo } from "react";
import {
  WorldCupPlayerCard,
  draftCardToWorldCup,
} from "@/components/player/world-cup-player-card";
import type { DraftPlayerCard } from "@/lib/draft/types";
import { cn } from "@/lib/utils";

interface DraftPlayerCardTileProps {
  player: DraftPlayerCard;
  isSaved: boolean;
  onToggleSaved: () => void;
  onClick: () => void;
}

function DraftPlayerCardTileInner({
  player,
  isSaved,
  onToggleSaved,
  onClick,
}: DraftPlayerCardTileProps) {
  return (
    <WorldCupPlayerCard
      player={draftCardToWorldCup(player)}
      size="draft"
      onClick={onClick}
      footer={
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSaved();
          }}
          className={cn(
            "h-8 w-full rounded-lg text-[9px] font-bold",
            isSaved
              ? "bg-white/15 text-white ring-1 ring-white/20"
              : "bg-[#0066FF] text-white"
          )}
        >
          {isSaved ? "Saved" : "Save Player"}
        </button>
      }
    />
  );
}

export const DraftPlayerCardTile = memo(DraftPlayerCardTileInner);
