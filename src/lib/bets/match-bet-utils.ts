import type { MatchBetPick, PromotedMatchBetStatus } from "@/lib/bets/types";

export function pickToDisplayLabel(
  pick: MatchBetPick,
  homeTeamName: string,
  awayTeamName: string
): string {
  if (pick === "HOME") return homeTeamName;
  if (pick === "AWAY") return awayTeamName;
  return "Draw";
}

export function isVotingOpen(status: PromotedMatchBetStatus): boolean {
  return status === "VOTING_OPEN";
}

export const BET_ODDS_INPUT_CLASS =
  "mt-1 h-10 w-full rounded-lg border border-[#081120]/15 bg-white px-2 text-sm font-medium text-[#081120] placeholder:text-[#081120]/40 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30";

export const BET_SELECT_CLASS =
  "h-11 w-full rounded-xl border border-[#081120]/15 bg-white px-3 text-sm font-medium text-[#081120]";
