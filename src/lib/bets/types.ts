export interface RankingOutcomeRowDto {
  position: number;
  text: string;
}

export interface PunishmentsRewardsPayload {
  rows: RankingOutcomeRowDto[];
  currentUserRank: number | null;
}

/** Poll/API payload — never includes edit permissions (set on server only). */
export type PunishmentsRewardsPollPayload = PunishmentsRewardsPayload;

export type MatchBetPick = "HOME" | "DRAW" | "AWAY";

export type PromotedMatchBetStatus = "VOTING_OPEN" | "ODDS_PUBLISHED";

export interface MatchBetVoteStats {
  homeVotes: number;
  drawVotes: number;
  awayVotes: number;
  totalVotes: number;
}

export interface PromotedMatchBetDto {
  id: string;
  matchId: string;
  status: PromotedMatchBetStatus;
  homeTeamId: string;
  homeTeamName: string;
  homeTeamFlag: string | null;
  awayTeamId: string;
  awayTeamName: string;
  awayTeamFlag: string | null;
  homeOdd: string | null;
  drawOdd: string | null;
  awayOdd: string | null;
  matchday: number | null;
  scheduledAt: string;
  userPick: MatchBetPick | null;
  userPickLabel: string | null;
  stats: MatchBetVoteStats;
}

export interface MatchBetsPayload {
  bets: PromotedMatchBetDto[];
}

export interface OwnerMatchOption {
  id: string;
  matchday: number | null;
  scheduledAt: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamFlag: string | null;
  awayTeamFlag: string | null;
  alreadyPromoted: boolean;
}
