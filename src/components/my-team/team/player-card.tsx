"use client";

import { cn } from "@/lib/utils";
import type { SquadPlayer, MatchStatus } from "@/lib/mock/my-team-data";
import { getNationFlag } from "@/lib/mock/my-team-data";

const STATUS_CONFIG: Record<
  MatchStatus,
  { label: string; className: string; dot?: boolean }
> = {
  live: { label: "Live", className: "bg-[#E53935]/15 text-[#E53935]", dot: true },
  finished: { label: "FT", className: "bg-[#081120]/8 text-[#081120]/50" },
  not_started: { label: "NS", className: "bg-[#0066FF]/10 text-[#0066FF]" },
  eliminated: { label: "OUT", className: "bg-[#081120]/8 text-[#081120]/40" },
  injured: { label: "INJ", className: "bg-[#E53935]/10 text-[#E53935]" },
};

interface PlayerCardProps {
  player: SquadPlayer;
  compact?: boolean;
  onTap?: () => void;
}

export function PlayerCard({ player, compact = false, onTap }: PlayerCardProps) {
  const status = STATUS_CONFIG[player.matchStatus];

  return (
    <button
      type="button"
      onClick={onTap}
      className={cn(
        "wc-card relative w-full text-left transition-transform active:scale-[0.98]",
        compact ? "p-2.5" : "p-3",
        player.matchStatus === "live" && "ring-2 ring-[#E53935]/30"
      )}
    >
      <div className="flex items-center gap-2.5">
        <PlayerAvatar name={player.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold text-[#081120]">
              {player.name}
            </span>
            {player.isCaptain && (
              <span className="rounded bg-[#0066FF] px-1 py-0.5 text-[10px] font-bold text-white">
                C
              </span>
            )}
            {player.isViceCaptain && (
              <span className="rounded bg-[#081120]/15 px-1 py-0.5 text-[10px] font-bold text-[#081120]/70">
                VC
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[#081120]/50">
            <span>{player.position}</span>
            <span>·</span>
            <span>{getNationFlag(player.nation)}</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p
            className={cn(
              "text-base font-bold tabular-nums",
              player.matchStatus === "live" ? "text-[#E53935]" : "text-[#081120]"
            )}
          >
            {player.matchdayPoints}
          </p>
          <p className="text-[10px] text-[#081120]/40">{player.totalPoints} tot</p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
            status.className
          )}
        >
          {status.dot && (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#E53935]" />
          )}
          {status.label}
        </span>
      </div>
    </button>
  );
}

export function PlayerAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sizeClass = {
    sm: "h-9 w-9 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-20 w-20 text-2xl",
  }[size];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0066FF]/20 to-[#00C853]/20 font-bold text-[#0066FF]",
        sizeClass
      )}
    >
      {initials}
    </div>
  );
}

export function BenchPlayerCard({
  player,
  onTap,
}: {
  player: SquadPlayer;
  onTap?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="wc-card w-[140px] shrink-0 snap-start p-3 text-left active:scale-[0.97]"
    >
      <PlayerAvatar name={player.name} size="sm" />
      <p className="mt-2 truncate text-xs font-bold text-[#081120]">{player.name}</p>
      <p className="text-[10px] text-[#081120]/45">
        {player.position} · {getNationFlag(player.nation)}
      </p>
      <p className="mt-1 text-sm font-bold tabular-nums text-[#081120]">
        {player.totalPoints} pts
      </p>
    </button>
  );
}
