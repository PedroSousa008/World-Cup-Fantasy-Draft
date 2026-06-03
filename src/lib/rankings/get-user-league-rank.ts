import { getUserLeagueRankCached } from "@/lib/rankings/league-rank-index";

/** Current overall fantasy league rank (1 = first place). */
export async function getUserLeagueRank(userId: string): Promise<number | null> {
  return getUserLeagueRankCached(userId);
}
