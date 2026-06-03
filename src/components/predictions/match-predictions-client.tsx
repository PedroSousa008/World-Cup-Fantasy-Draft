"use client";

import { GamesView } from "@/components/tournament/games-view";
import type { MatchdayGroup } from "@/lib/tournament/types";

interface MatchPredictionsClientProps {
  matchdayGroups: MatchdayGroup[];
}

export function MatchPredictionsClient({ matchdayGroups }: MatchPredictionsClientProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/8">
        <p className="text-sm text-white/60">
          Match-by-match predictions are coming soon. Below is the real tournament schedule.
        </p>
      </div>
      <GamesView matchdayGroups={matchdayGroups} />
    </div>
  );
}
