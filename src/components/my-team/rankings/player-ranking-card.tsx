"use client";

import { cn } from "@/lib/utils";
import { getNationFlag } from "@/lib/mock/my-team-data";
import type { PlayerRankingRow } from "@/lib/rankings/types";

interface PlayerRankingCardProps {
  row: PlayerRankingRow;
  onClick: () => void;
}

export function PlayerRankingCard({ row, onClick }: PlayerRankingCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-white/95 p-4 text-left shadow-lg ring-1 ring-black/5 transition-all active:scale-[0.99]"
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
          row.rank === 1
            ? "bg-[#0066FF] text-white"
            : row.rank <= 3
              ? "bg-[#0066FF]/15 text-[#0066FF]"
              : "bg-[#081120]/8 text-[#081120]/60"
        )}
      >
        #{row.rank}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-[#081120]">
          {row.name}{" "}
          <span className="text-sm">{getNationFlag(row.nation)}</span>
        </p>
        <p className="truncate text-xs text-[#081120]/50">
          {row.position}
          {row.ownerTeamName ? ` · ${row.ownerTeamName}` : " · Unowned"}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-lg font-black tabular-nums text-[#0066FF]">
          {row.totalPoints}
          <span className="ml-0.5 text-xs font-semibold text-[#081120]/40">pts</span>
        </p>
      </div>
    </button>
  );
}
