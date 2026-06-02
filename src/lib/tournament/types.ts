import type { MatchStatus } from "@prisma/client";

export interface TournamentTeamRef {
  id: string;
  name: string;
  slug: string;
  flagEmoji: string | null;
  groupName: string | null;
}

export interface TournamentMatchCard {
  id: string;
  matchday: number;
  groupName: string | null;
  scheduledAt: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  bettingOpen: boolean;
  homeTeam: TournamentTeamRef;
  awayTeam: TournamentTeamRef;
  manOfTheMatchId: string | null;
}

export interface GroupStandingRow {
  position: number;
  teamId: string;
  teamName: string;
  teamCode: string;
  flagEmoji: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  qualified: boolean;
  eliminated: boolean;
  isThirdPlace: boolean;
  /** Owner manual correction is active for this team. */
  manualOverride: boolean;
}

export interface GroupTable {
  group: string;
  rows: GroupStandingRow[];
}

export interface ThirdPlaceRow extends GroupStandingRow {
  group: string;
}

export interface MatchdayGroup {
  matchday: number;
  kickoffAt: string | null;
  isLocked: boolean;
  matches: TournamentMatchCard[];
}

export interface PlayerFixture {
  fixture: string;
  opponent: string;
  scheduledAt: string | null;
  matchday: number | null;
  groupName: string | null;
  status: "not_started" | "live" | "finished";
}
