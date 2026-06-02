"use client";

import { cn } from "@/lib/utils";
import { getNationFlag } from "@/lib/nations";
import { formatKickoffTime, matchScoreLabel } from "@/lib/tournament/format";
import type { TournamentMatchCard } from "@/lib/tournament/types";

interface MatchCardProps {
  match: TournamentMatchCard;
  onClick?: () => void;
  compact?: boolean;
}

export function MatchCard({ match, onClick, compact }: MatchCardProps) {
  const score = matchScoreLabel(match);
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "wc-card w-full text-left transition-transform",
        onClick && "cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
        compact ? "p-4" : "p-5"
      )}
    >
      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-[#081120]/50">
        <span>Group {match.groupName ?? "—"}</span>
        <span>MD{match.matchday}</span>
        <span>{formatKickoffTime(match.scheduledAt)}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <TeamSide name={match.homeTeam.name} flag={match.homeTeam.flagEmoji} align="left" />
        <div className="shrink-0 text-center">
          {score ? (
            <span className="text-xl font-bold tabular-nums text-[#081120]">{score}</span>
          ) : (
            <span className="text-sm font-semibold text-[#081120]/40">vs</span>
          )}
        </div>
        <TeamSide name={match.awayTeam.name} flag={match.awayTeam.flagEmoji} align="right" />
      </div>
    </Wrapper>
  );
}

function TeamSide({
  name,
  flag,
  align,
}: {
  name: string;
  flag: string | null;
  align: "left" | "right";
}) {
  const emoji = flag ?? getNationFlag(name);
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-1",
        align === "right" ? "items-end text-right" : "items-start"
      )}
    >
      <span className="text-2xl leading-none">{emoji}</span>
      <span className="truncate text-sm font-semibold text-[#081120]">{name}</span>
    </div>
  );
}
