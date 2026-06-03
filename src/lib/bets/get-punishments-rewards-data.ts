import type { PunishmentsRewardsPayload } from "@/lib/bets/types";
import { getPunishmentsTableRows } from "@/lib/bets/get-punishments-table-rows";
import { getUserLeagueRankCached } from "@/lib/rankings/league-rank-index";

export async function getPunishmentsRewardsData(
  userId: string
): Promise<PunishmentsRewardsPayload> {
  const [rows, currentUserRank] = await Promise.all([
    getPunishmentsTableRows(),
    getUserLeagueRankCached(userId),
  ]);

  return { rows, currentUserRank };
}
