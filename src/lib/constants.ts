export const DEFAULT_SCORING_RULES = [
  { key: "goal", name: "Goal", points: 6 },
  { key: "assist", name: "Assist", points: 4 },
  { key: "clean_sheet", name: "Clean Sheet", points: 4 },
  { key: "minutes_played", name: "Minutes Played (60+)", points: 1 },
  { key: "man_of_the_match", name: "Man of the Match", points: 3 },
  { key: "yellow_card", name: "Yellow Card", points: -1 },
  { key: "red_card", name: "Red Card", points: -3 },
  { key: "own_goal", name: "Own Goal", points: -2 },
  { key: "penalty_saved", name: "Penalty Saved", points: 5 },
  { key: "penalty_missed", name: "Penalty Missed", points: -2 },
  { key: "goal_conceded", name: "Goal Conceded (GK/DEF)", points: -1 },
] as const;

export const DEFAULT_POWERS = [
  { key: "double_points", name: "Double Points", description: "Double your fantasy points for one matchday" },
  { key: "triple_captain", name: "Triple Captain", description: "Triple your captain's points" },
  { key: "rival_challenge", name: "Rival Challenge", description: "Challenge a rival for bonus points" },
  { key: "lucky_dip", name: "Lucky Dip", description: "Random bonus player for one matchday" },
  { key: "wildcard", name: "Wildcard", description: "Unlimited transfers for one matchday" },
] as const;

export const TOURNAMENT_PREDICTION_TYPES = [
  { key: "WORLD_CUP_WINNER", label: "World Cup Winner" },
  { key: "RUNNER_UP", label: "Runner-Up" },
  { key: "GOLDEN_BOOT", label: "Golden Boot" },
  { key: "GOLDEN_BALL", label: "Golden Ball" },
  { key: "BEST_YOUNG_PLAYER", label: "Best Young Player" },
  { key: "BIGGEST_SURPRISE", label: "Biggest Surprise Nation" },
  { key: "BIGGEST_FLOP", label: "Biggest Flop Nation" },
] as const;

export const MATCH_PREDICTION_TYPES = [
  { key: "MATCH_WINNER", label: "Match Winner" },
  { key: "CORRECT_SCORE", label: "Correct Score" },
  { key: "FIRST_GOALSCORER", label: "First Goalscorer" },
] as const;

export const BET_TYPES = [
  { key: "MATCH", label: "Match Bet" },
  { key: "PLAYER", label: "Player Bet" },
  { key: "FANTASY", label: "Fantasy Bet" },
  { key: "CUSTOM", label: "Custom Bet" },
] as const;

export const STAKE_TYPES = [
  { key: "POINTS", label: "Points" },
  { key: "MONEY", label: "Money" },
  { key: "DRINKS", label: "Drinks" },
  { key: "DINNER", label: "Dinner" },
  { key: "CUSTOM_PUNISHMENT", label: "Custom Punishment" },
  { key: "CUSTOM_REWARD", label: "Custom Reward" },
] as const;

export const CALENDAR_EVENT_TYPES = [
  { key: "MATCHDAY", label: "Matchday" },
  { key: "DRAFT", label: "Draft" },
  { key: "REDRAFT", label: "Redraft" },
  { key: "BETTING_DEADLINE", label: "Betting Deadline" },
  { key: "PREDICTION_DEADLINE", label: "Prediction Deadline" },
  { key: "CUSTOM", label: "Custom Event" },
] as const;
