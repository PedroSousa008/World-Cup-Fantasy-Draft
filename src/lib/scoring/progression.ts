import type { ProgressionStage } from "@prisma/client";
import type { PlayerPosition } from "@prisma/client";

/** Bonus points per player when nation reaches stage (one-time each). */
export const PROGRESSION_STAGE_POINTS: Record<ProgressionStage, number> = {
  LAST_16: 3,
  QUARTER_FINALS: 4,
  SEMI_FINALS: 5,
  FINAL: 6,
  WINNER: 10,
};

export const PROGRESSION_STAGE_ORDER: ProgressionStage[] = [
  "LAST_16",
  "QUARTER_FINALS",
  "SEMI_FINALS",
  "FINAL",
  "WINNER",
];

export const PROGRESSION_STAGE_LABELS: Record<ProgressionStage, string> = {
  LAST_16: "Last 16",
  QUARTER_FINALS: "Quarter Finals",
  SEMI_FINALS: "Semi Finals",
  FINAL: "Final",
  WINNER: "Tournament Winner",
};

export function totalProgressionPointsForStages(stages: ProgressionStage[]): number {
  return stages.reduce((sum, s) => sum + PROGRESSION_STAGE_POINTS[s], 0);
}

export interface ProgressionBonusRow {
  nationalTeamId: string;
  teamName: string;
  stage: ProgressionStage;
  points: number;
}
