"use client";

import { MatchPredictionsView } from "@/components/predictions/match-predictions-view";
import type { PredictionMatchdayGroup } from "@/lib/predictions/get-match-predictions-data";

interface MatchPredictionsClientProps {
  matchdayGroups: PredictionMatchdayGroup[];
}

export function MatchPredictionsClient({ matchdayGroups }: MatchPredictionsClientProps) {
  return <MatchPredictionsView matchdayGroups={matchdayGroups} />;
}
