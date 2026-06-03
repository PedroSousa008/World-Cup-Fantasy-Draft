"use client";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { getNationFlag } from "@/lib/nations";
import { formatKickoff, matchScoreLabel } from "@/lib/tournament/format";
import type { TournamentMatchCard } from "@/lib/tournament/types";

interface MatchDetailSheetProps {
  match: TournamentMatchCard;
  onClose: () => void;
}

export function MatchDetailSheet({ match, onClose }: MatchDetailSheetProps) {
  const score = matchScoreLabel(match);

  return (
    <BottomSheet open={true} onClose={onClose} title="Match details">
      <div className="space-y-4 pb-6">
        <p className="text-sm text-[#081120]/60">{formatKickoff(match.scheduledAt)}</p>
        <div className="flex items-center justify-between gap-4">
          <div className="text-center">
            <span className="text-3xl">{match.homeTeam.flagEmoji ?? getNationFlag(match.homeTeam.name)}</span>
            <p className="mt-2 font-semibold text-[#081120]">{match.homeTeam.name}</p>
          </div>
          <div className="text-center">
            {score ? (
              <p className="text-2xl font-bold text-[#081120]">{score}</p>
            ) : (
              <p className="text-lg font-semibold text-[#081120]/40">vs</p>
            )}
            <p className="mt-1 text-xs font-semibold uppercase text-[#081120]/45">
              {match.status === "FINISHED" ? "Full time" : match.status.toLowerCase()}
            </p>
          </div>
          <div className="text-center">
            <span className="text-3xl">{match.awayTeam.flagEmoji ?? getNationFlag(match.awayTeam.name)}</span>
            <p className="mt-2 font-semibold text-[#081120]">{match.awayTeam.name}</p>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-[#081120]/5 p-3">
            <dt className="text-[#081120]/50">Matchday</dt>
            <dd className="font-semibold text-[#081120]">{match.matchday}</dd>
          </div>
          <div className="rounded-xl bg-[#081120]/5 p-3">
            <dt className="text-[#081120]/50">Group</dt>
            <dd className="font-semibold text-[#081120]">{match.groupName ?? "—"}</dd>
          </div>
        </dl>
      </div>
    </BottomSheet>
  );
}
