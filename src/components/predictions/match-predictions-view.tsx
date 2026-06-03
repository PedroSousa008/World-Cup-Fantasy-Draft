"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Lock, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/card";
import { MatchCard } from "@/components/tournament/match-card";
import { MatchPredictionModal } from "@/components/predictions/match-prediction-modal";
import { formatKickoff } from "@/lib/tournament/format";
import type { PredictionMatchdayGroup } from "@/lib/predictions/get-match-predictions-data";

interface MatchPredictionsViewProps {
  matchdayGroups: PredictionMatchdayGroup[];
}

export function MatchPredictionsView({ matchdayGroups }: MatchPredictionsViewProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Set<number>>(
    () => new Set(matchdayGroups.map((g) => g.matchday))
  );
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  if (matchdayGroups.length === 0) {
    return (
      <EmptyState
        title="No games scheduled"
        description="Run tournament seed from Owner → Matches to load the World Cup schedule."
        accent="blue"
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        {matchdayGroups.map((group) => {
          const isOpen = expanded.has(group.matchday);
          return (
            <section
              key={group.matchday}
              className="overflow-hidden rounded-2xl border border-white/10"
            >
              <button
                type="button"
                onClick={() => {
                  setExpanded((prev) => {
                    const next = new Set(prev);
                    if (next.has(group.matchday)) next.delete(group.matchday);
                    else next.add(group.matchday);
                    return next;
                  });
                }}
                className="flex w-full items-center justify-between gap-3 bg-white/5 px-4 py-4 text-left"
              >
                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <ChevronDown className="h-5 w-5 text-[#0066FF]" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-white/50" />
                  )}
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Matchday {group.matchday}
                    </h3>
                    {group.deadlineLabel && (
                      <p className="text-xs text-white/50">
                        Deadline {group.deadlineLabel}
                      </p>
                    )}
                    {!group.deadlineLabel && group.kickoffAt && (
                      <p className="text-xs text-white/50">
                        First kickoff {formatKickoff(group.kickoffAt)}
                      </p>
                    )}
                  </div>
                </div>
                {group.predictionsLocked && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs font-semibold text-white/70">
                    <Lock className="h-3 w-3" />
                    Locked
                  </span>
                )}
              </button>
              <div
                className={cn(
                  "grid gap-3 border-t border-white/8 bg-[#081120]/40 p-4 transition-all",
                  !isOpen && "hidden"
                )}
              >
                {group.matches.map((match) => (
                  <div key={match.id} className="space-y-2">
                    <MatchCard
                      match={match}
                      compact
                      onClick={() => setSelectedMatchId(match.id)}
                    />
                    {match.prediction && (
                      <div className="flex flex-wrap items-center gap-2 px-1 text-xs">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#0066FF]/15 px-2 py-1 font-semibold text-[#0066FF]">
                          <Target className="h-3 w-3" />
                          {match.prediction.predictedHomeGoals}–
                          {match.prediction.predictedAwayGoals}
                        </span>
                        {match.prediction.isSettled && (
                          <span
                            className={cn(
                              "rounded-full px-2 py-1 font-semibold",
                              match.prediction.pointsEarned > 0
                                ? "bg-[#00C853]/15 text-[#00C853]"
                                : "bg-white/10 text-white/50"
                            )}
                          >
                            {match.prediction.pointsEarned > 0
                              ? `+${match.prediction.pointsEarned} pts`
                              : "0 pts"}
                          </span>
                        )}
                        {match.predictionLocked && !match.prediction.isSettled && (
                          <span className="text-white/40">Locked</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <MatchPredictionModal
        matchId={selectedMatchId}
        onClose={() => setSelectedMatchId(null)}
        onSaved={() => router.refresh()}
      />
    </>
  );
}
