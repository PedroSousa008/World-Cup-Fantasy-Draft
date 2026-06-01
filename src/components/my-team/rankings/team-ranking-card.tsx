"use client";

import { cn } from "@/lib/utils";
import { getNationFlag } from "@/lib/mock/my-team-data";
import type { TeamRankingRow } from "@/lib/rankings/types";

interface TeamRankingCardProps {
  row: TeamRankingRow;
  highlight?: boolean;
  pointsLabel?: string;
}

export function TeamRankingCard({
  row,
  highlight,
  pointsLabel = "pts",
}: TeamRankingCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl bg-white/95 p-4 shadow-lg ring-1 ring-black/5",
        highlight && "ring-2 ring-[#0066FF]/35"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
          row.isEmpty
            ? "bg-[#081120]/5 text-[#081120]/30"
            : row.rank === 1
              ? "bg-[#0066FF] text-white"
              : row.rank <= 3
                ? "bg-[#0066FF]/15 text-[#0066FF]"
                : "bg-[#081120]/8 text-[#081120]/60"
        )}
      >
        #{row.rank}
      </span>

      <div className="min-w-0 flex-1">
        {row.isEmpty ? (
          <p className="truncate font-semibold text-[#081120]/35">Empty Slot</p>
        ) : (
          <p className="truncate font-bold text-[#081120]">
            {row.teamName}{" "}
            <span className="ml-0.5">{getNationFlag(row.nation ?? "")}</span>
          </p>
        )}
      </div>

      <div className="shrink-0 text-right">
        {row.isEmpty ? (
          <span className="text-sm font-semibold text-[#081120]/25">—</span>
        ) : (
          <p className="text-lg font-black tabular-nums text-[#0066FF]">
            {row.points ?? 0}
            <span className="ml-0.5 text-xs font-semibold text-[#081120]/40">
              {pointsLabel}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
