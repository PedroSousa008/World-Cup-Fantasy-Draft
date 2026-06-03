import { prisma } from "@/lib/db/prisma";
import { ensureRankingOutcomeRows } from "@/lib/bets/ensure-ranking-outcome-rows";
import type { PunishmentsRewardsPayload } from "@/lib/bets/types";
import { getUserLeagueRank } from "@/lib/rankings/get-user-league-rank";
import { UserRole } from "@prisma/client";

export async function getPunishmentsRewardsData(
  userId: string,
  role: UserRole
): Promise<PunishmentsRewardsPayload> {
  await ensureRankingOutcomeRows();

  const [rows, currentUserRank] = await Promise.all([
    prisma.rankingOutcomeRow.findMany({ orderBy: { position: "asc" } }),
    getUserLeagueRank(userId),
  ]);

  return {
    rows: rows.map((r) => ({ position: r.position, text: r.text })),
    currentUserRank,
    isOwner: role === UserRole.OWNER,
  };
}
