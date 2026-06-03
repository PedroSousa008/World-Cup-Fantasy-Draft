export type ProfileTabSlug =
  | "overview"
  | "records"
  | "squad"
  | "predictions"
  | "achievements";

export interface ProfileHeader {
  username: string;
  teamName: string;
  selectedNation: string;
  nationFlag: string;
  rank: number | null;
  totalPoints: number;
}

export interface ProfileOverviewPayload {
  header: ProfileHeader;
  currentMatchday: number | null;
  currentMatchdayPoints: number;
  cards: {
    rank: number | null;
    totalPoints: number;
    currentMatchdayPoints: number;
  };
}

export interface ProfileMatchdayRecord {
  matchday: number;
  points: number;
}

export interface ProfilePlayerLeader {
  playerId: string;
  name: string;
  value: number;
  nation: string;
  nationFlag: string;
}

export interface ProfileRecordsPayload {
  bestMatchday: ProfileMatchdayRecord | null;
  worstMatchday: ProfileMatchdayRecord | null;
  longestTop3Streak: number;
  highestScoringPlayer: ProfilePlayerLeader | null;
  lowestScoringPlayer: ProfilePlayerLeader | null;
  mostGoals: ProfilePlayerLeader | null;
  mostAssists: ProfilePlayerLeader | null;
}

export interface ProfileSquadRow {
  playerId: string;
  name: string;
  photoUrl: string | null;
  position: string;
  positionLabel: string;
  nation: string;
  nationFlag: string;
  fantasyPoints: number;
}

export interface ProfileSquadPayload {
  rows: ProfileSquadRow[];
}

export interface ProfilePredictionsPayload {
  correctPredictions: number;
  settledPredictions: number;
  predictionAccuracyPercent: number | null;
  betsPlaced: number;
}

export type ProfilePowerStatus = "available" | "used" | "active" | "pending" | "expired";

export interface ProfilePowerRow {
  type: string;
  name: string;
  icon: string;
  status: ProfilePowerStatus;
  statusLabel: string;
}

export interface ProfileAchievementsPayload {
  powers: ProfilePowerRow[];
  matchdayHistory: ProfileMatchdayRecord[];
}

export type ProfileTabPayload =
  | ProfileOverviewPayload
  | ProfileRecordsPayload
  | ProfileSquadPayload
  | ProfilePredictionsPayload
  | ProfileAchievementsPayload;
