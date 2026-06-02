import type { PlayerPosition } from "@prisma/client";

/** Canonical scoring event keys */
export const SCORING_KEYS = {
  WIN: "WIN",
  CLEAN_SHEET: "CLEAN_SHEET",
  GOAL: "GOAL",
  ASSIST: "ASSIST",
  MOTM: "MOTM",
  YELLOW_CARD: "YELLOW_CARD",
  RED_CARD: "RED_CARD",
  OWN_GOAL: "OWN_GOAL",
  PENALTY_MISS: "PENALTY_MISS",
  PENALTY_SAVE: "PENALTY_SAVE",
} as const;

export type ScoringKey = (typeof SCORING_KEYS)[keyof typeof SCORING_KEYS];

export type PositionPoints = Record<ScoringKey, number>;

const GK: PositionPoints = {
  WIN: 2,
  CLEAN_SHEET: 4,
  GOAL: 10,
  ASSIST: 4,
  MOTM: 3,
  YELLOW_CARD: -1,
  RED_CARD: -3,
  OWN_GOAL: -2,
  PENALTY_MISS: -2,
  PENALTY_SAVE: 5,
};

const DEF: PositionPoints = {
  WIN: 2,
  CLEAN_SHEET: 4,
  GOAL: 4,
  ASSIST: 3,
  MOTM: 3,
  YELLOW_CARD: -1,
  RED_CARD: -3,
  OWN_GOAL: -2,
  PENALTY_MISS: -2,
  PENALTY_SAVE: 0,
};

const MID: PositionPoints = {
  WIN: 2,
  CLEAN_SHEET: 0,
  GOAL: 4,
  ASSIST: 3,
  MOTM: 3,
  YELLOW_CARD: -1,
  RED_CARD: -3,
  OWN_GOAL: -2,
  PENALTY_MISS: -2,
  PENALTY_SAVE: 0,
};

const FWD: PositionPoints = {
  WIN: 2,
  CLEAN_SHEET: 0,
  GOAL: 4,
  ASSIST: 3,
  MOTM: 3,
  YELLOW_CARD: -1,
  RED_CARD: -3,
  OWN_GOAL: -2,
  PENALTY_MISS: -2,
  PENALTY_SAVE: 0,
};

export const POSITION_POINTS: Record<PlayerPosition, PositionPoints> = {
  GK,
  DEF,
  MID,
  FWD,
};

/** Hat-trick: 3+ goals by outfield player → 15 total goal points (not 3×4). */
export const HAT_TRICK_GOAL_POINTS_OUTFIELD = 15;
export const HAT_TRICK_THRESHOLD = 3;

export function goalPointsForMatch(position: PlayerPosition, goalCount: number): number {
  if (goalCount <= 0) return 0;
  const perGoal = POSITION_POINTS[position].GOAL;

  if (position === "GK") {
    return goalCount * perGoal;
  }

  if (goalCount >= HAT_TRICK_THRESHOLD) {
    return HAT_TRICK_GOAL_POINTS_OUTFIELD + (goalCount - HAT_TRICK_THRESHOLD) * perGoal;
  }

  return goalCount * perGoal;
}

export function pointsForKey(position: PlayerPosition, key: ScoringKey): number {
  return POSITION_POINTS[position][key] ?? 0;
}
