"use client";

import { PlayerAvatar } from "@/components/player/player-avatar";
import { getNationFlag } from "@/lib/nations";
import { getPositionLabel } from "@/lib/players/types";
import type { DraftPlayerCard } from "@/lib/draft/types";
import { cn } from "@/lib/utils";

interface DraftPlayerCardTileProps {
  player: DraftPlayerCard;
  isSaved: boolean;
  onToggleSaved: () => void;
  onClick: () => void;
}

export function DraftPlayerCardTile({
  player,
  isSaved,
  onToggleSaved,
  onClick,
}: DraftPlayerCardTileProps) {
  const flag = player.nationFlag || getNationFlag(player.nation);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className={cn(
        "flex min-w-0 flex-col rounded-xl bg-white/95 p-2 text-left shadow-md ring-1 ring-black/5",
        "cursor-pointer transition-all active:scale-[0.97]"
      )}
    >
      <div className="relative mx-auto h-12 w-12 shrink-0 overflow-hidden rounded-full">
        <PlayerAvatar
          name={player.name}
          photoUrl={player.photoUrl}
          className="h-12 w-12 rounded-full"
          initialsClassName="h-12 w-12 text-[10px]"
        />
      </div>

      <p className="mt-1.5 truncate text-center text-[10px] font-bold leading-tight text-[#081120]">
        {player.name}
      </p>

      {player.isAssigned && player.ownerSelectedNation && (
        <span className="mx-auto mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#081120]/5 text-[9px]">
          {getNationFlag(player.ownerSelectedNation)}
        </span>
      )}

      <p className="mt-0.5 truncate text-center text-[8px] text-[#081120]/50">
        {getPositionLabel(player.position)} · {flag}
      </p>

      <p className="mt-1 text-center text-[10px] font-black tabular-nums text-[#0066FF]">
        {player.totalPoints}
        <span className="text-[8px] font-semibold text-[#081120]/40"> pts</span>
      </p>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSaved();
        }}
        className={cn(
          "mt-2 h-8 rounded-lg px-2 text-[9px] font-bold transition-colors",
          isSaved
            ? "bg-[#081120]/10 text-[#081120] ring-1 ring-[#081120]/10"
            : "bg-[#0066FF] text-white"
        )}
      >
        {isSaved ? "Saved" : "Save Player"}
      </button>
    </div>
  );
}
