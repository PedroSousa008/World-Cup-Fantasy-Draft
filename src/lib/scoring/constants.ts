/** Match event types the Owner enters — keys align with ScoringRule.ruleKey */
export const SCORING_EVENT_TYPES = {
  GOAL: "GOAL",
  ASSIST: "ASSIST",
  YELLOW_CARD: "YELLOW_CARD",
  RED_CARD: "RED_CARD",
  OWN_GOAL: "OWN_GOAL",
  PENALTY_MISS: "PENALTY_MISS",
  PENALTY_SAVE: "PENALTY_SAVE",
  MOTM: "MOTM",
  CLEAN_SHEET: "CLEAN_SHEET",
  WIN: "WIN",
  APPEARANCE: "APPEARANCE",
  MINUTES_PLAYED: "MINUTES_PLAYED",
} as const;

export const DEFAULT_SCORING_POINTS: Record<string, number> = {
  GOAL: 4,
  ASSIST: 3,
  YELLOW_CARD: -1,
  RED_CARD: -3,
  OWN_GOAL: -2,
  PENALTY_MISS: -2,
  MOTM: 5,
  CLEAN_SHEET: 4,
  APPEARANCE: 1,
  MINUTES_PLAYED: 0,
};

/** Default points by position (falls back to DEFAULT_SCORING_POINTS when no override). */
export const DEFAULT_POSITION_SCORING: Record<
  string,
  Partial<Record<keyof typeof SCORING_EVENT_TYPES, number>>
> = {
  GK: { GOAL: 6, CLEAN_SHEET: 4 },
  DEF: { GOAL: 6, CLEAN_SHEET: 4 },
  MID: { GOAL: 5 },
  FWD: { GOAL: 4 },
};

export const MATCHDAY_COUNT = 8;
export const MIN_LEAGUE_TABLE_ROWS = 10;
