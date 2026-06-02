"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/card";
import { MatchCard } from "@/components/tournament/match-card";
import { MatchDetailSheet } from "@/components/tournament/match-detail-sheet";
import { formatKickoff } from "@/lib/tournament/format";
import type { MatchdayGroup, TournamentMatchCard } from "@/lib/tournament/types";

interface GamesViewProps {
  matchdayGroups: MatchdayGroup[];
}

export function GamesView({ matchdayGroups }: GamesViewProps) {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set(matchdayGroups.map((g) => g.matchday)));
  const [selected, setSelected] = useState<TournamentMatchCard | null>(null);

  if (matchdayGroups.length === 0) {
    return (
      <EmptyState
        title="No games scheduled"
        description="Run tournament seed from Owner → Matches to load the World Cup schedule."
        accent="green"
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        {matchdayGroups.map((group) => {
          const isOpen = expanded.has(group.matchday);
          return (
            <section key={group.matchday} className="overflow-hidden rounded-2xl border border-white/10">
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
                    <ChevronDown className="h-5 w-5 text-[#00C853]" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-white/50" />
                  )}
                  <div>
                    <h3 className="text-base font-bold text-white">Matchday {group.matchday}</h3>
                    {group.kickoffAt && (
                      <p className="text-xs text-white/50">First kickoff {formatKickoff(group.kickoffAt)}</p>
                    )}
                  </div>
                </div>
                {group.isLocked && (
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
                  <MatchCard key={match.id} match={match} onClick={() => setSelected(match)} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
      {selected && (
        <MatchDetailSheet match={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
