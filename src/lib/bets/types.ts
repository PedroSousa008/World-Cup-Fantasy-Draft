export interface RankingOutcomeRowDto {
  position: number;
  text: string;
}

export interface PunishmentsRewardsPayload {
  rows: RankingOutcomeRowDto[];
  currentUserRank: number | null;
  isOwner: boolean;
}

export interface MatchBetVoteStats {
  homeVotes: number;
  awayVotes: number;
  totalVotes: number;
}

export interface PromotedMatchBetDto {
  id: string;
  matchId: string;
  homeTeamId: string;
  homeTeamName: string;
  homeTeamFlag: string | null;
  awayTeamId: string;
  awayTeamName: string;
  awayTeamFlag: string | null;
  homeOdd: string;
  awayOdd: string;
  matchday: number | null;
  scheduledAt: string;
  userPickTeamId: string | null;
  userPickTeamName: string | null;
  stats: MatchBetVoteStats;
}

export interface MatchBetsPayload {
  bets: PromotedMatchBetDto[];
  isOwner: boolean;
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
