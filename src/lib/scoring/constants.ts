/** Match event types the Owner enters — keys align with ScoringRule.ruleKey */
export const SCORING_EVENT_TYPES = {
  GOAL: "GOAL",
  ASSIST: "ASSIST",
  YELLOW_CARD: "YELLOW_CARD",
  RED_CARD: "RED_CARD",
  OWN_GOAL: "OWN_GOAL",
  MOTM: "MOTM",
  APPEARANCE: "APPEARANCE",
  MINUTES_PLAYED: "MINUTES_PLAYED",
} as const;

export const DEFAULT_SCORING_POINTS: Record<string, number> = {
  GOAL: 4,
  ASSIST: 3,
  YELLOW_CARD: -1,
  RED_CARD: -3,
  OWN_GOAL: -2,
  MOTM: 5,
  APPEARANCE: 1,
  MINUTES_PLAYED: 0,
};

export const MATCHDAY_COUNT = 8;
export const MIN_LEAGUE_TABLE_ROWS = 10;
