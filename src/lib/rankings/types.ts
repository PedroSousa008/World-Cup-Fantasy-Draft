export interface TeamRankingRow {
  rank: number;
  userId?: string;
  teamName: string | null;
  nation: string | null;
  points: number | null;
  isEmpty: boolean;
}

export interface PlayerRankingRow {
  rank: number;
  playerId: string;
  name: string;
  nation: string;
  position: string;
  ownerTeamName: string | null;
  totalPoints: number;
}

export interface RankingsData {
  overall: TeamRankingRow[];
  matchdayRankings: Record<number, TeamRankingRow[]>;
  players: PlayerRankingRow[];
  defaultMatchday: number;
  matchdays: number[];
  currentUserTeamName: string;
}
