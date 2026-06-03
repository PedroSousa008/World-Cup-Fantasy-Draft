import type { MatchStatus } from "@prisma/client";

export interface MatchDetailEvent {
  id: string;
  eventType: string;
  minute: number | null;
  player: {
    id: string;
    name: string;
    position: string;
  } | null;
}

export interface MatchDetailResponse {
  id: string;
  matchday: number | null;
  groupName: string | null;
  stage: string;
  scheduledAt: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: {
    id: string;
    name: string;
    flagEmoji: string | null;
  };
  awayTeam: {
    id: string;
    name: string;
    flagEmoji: string | null;
  };
  manOfTheMatch: {
    id: string;
    name: string;
    position: string;
  } | null;
  events: MatchDetailEvent[];
}

export function eventTypeLabel(type: string): string {
  switch (type) {
    case "GOAL":
      return "Goal";
    case "ASSIST":
      return "Assist";
    case "YELLOW_CARD":
      return "Yellow card";
    case "RED_CARD":
      return "Red card";
    case "OWN_GOAL":
      return "Own goal";
    case "PENALTY_MISS":
      return "Penalty miss";
    case "PENALTY_SAVE":
      return "Penalty save";
    default:
      return type.replace(/_/g, " ").toLowerCase();
  }
}
