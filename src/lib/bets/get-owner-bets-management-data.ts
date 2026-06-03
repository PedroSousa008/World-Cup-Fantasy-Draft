import { prisma } from "@/lib/db/prisma";
import type { OwnerMatchOption, PromotedMatchBetDto } from "@/lib/bets/types";
import { getMatchBetsData } from "@/lib/bets/get-match-bets-data";
import { UserRole } from "@prisma/client";

export async function getOwnerBetsManagementData(ownerId: string) {
  const [matches, promotedIds, betsPayload] = await Promise.all([
    prisma.match.findMany({
      where: { matchday: { not: null } },
      include: {
        homeTeam: { select: { name: true, flagEmoji: true } },
        awayTeam: { select: { name: true, flagEmoji: true } },
      },
      orderBy: [{ matchday: "asc" }, { scheduledAt: "asc" }],
    }),
    prisma.ownerPromotedMatchBet.findMany({ select: { matchId: true } }),
    getMatchBetsData(ownerId, UserRole.OWNER),
  ]);

  const promotedSet = new Set(promotedIds.map((p) => p.matchId));

  const matchOptions: OwnerMatchOption[] = matches.map((m) => ({
    id: m.id,
    matchday: m.matchday,
    scheduledAt: m.scheduledAt.toISOString(),
    homeTeamName: m.homeTeam.name,
    awayTeamName: m.awayTeam.name,
    homeTeamFlag: m.homeTeam.flagEmoji,
    awayTeamFlag: m.awayTeam.flagEmoji,
    alreadyPromoted: promotedSet.has(m.id),
  }));

  return {
    matchOptions,
    activeBets: betsPayload.bets as PromotedMatchBetDto[],
  };
}
