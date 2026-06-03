import { prisma } from "@/lib/db/prisma";
import type { MatchBetsPayload, MatchBetVoteStats, PromotedMatchBetDto } from "@/lib/bets/types";
import { UserRole } from "@prisma/client";

export async function getMatchBetsData(
  userId: string,
  role: UserRole
): Promise<MatchBetsPayload> {
  const isOwner = role === UserRole.OWNER;

  const promoted = await prisma.ownerPromotedMatchBet.findMany({
    where: { isActive: true },
    include: {
      match: {
        include: {
          homeTeam: { select: { id: true, name: true, flagEmoji: true } },
          awayTeam: { select: { id: true, name: true, flagEmoji: true } },
        },
      },
      votes: isOwner
        ? { select: { pickedTeamId: true } }
        : { where: { userId }, select: { pickedTeamId: true } },
    },
    orderBy: { match: { scheduledAt: "asc" } },
  });

  const allVotesByBet = isOwner
    ? await prisma.matchBetVote.groupBy({
        by: ["promotedBetId", "pickedTeamId"],
        _count: { _all: true },
        where: { promotedBetId: { in: promoted.map((p) => p.id) } },
      })
    : [];

  const bets: PromotedMatchBetDto[] = promoted.map((row) => {
    const match = row.match;
    let stats: MatchBetVoteStats;

    if (isOwner) {
      const voteRows = allVotesByBet.filter((v) => v.promotedBetId === row.id);
      let homeVotes = 0;
      let awayVotes = 0;
      for (const v of voteRows) {
        if (v.pickedTeamId === match.homeTeam.id) homeVotes += v._count._all;
        else if (v.pickedTeamId === match.awayTeam.id) awayVotes += v._count._all;
      }
      stats = { homeVotes, awayVotes, totalVotes: homeVotes + awayVotes };
    } else {
      stats = { homeVotes: 0, awayVotes: 0, totalVotes: 0 };
    }

    const userVote = row.votes[0];
    const pickedTeamId = userVote?.pickedTeamId ?? null;
    const pickedTeamName =
      pickedTeamId === match.homeTeam.id
        ? match.homeTeam.name
        : pickedTeamId === match.awayTeam.id
          ? match.awayTeam.name
          : null;

    return {
      id: row.id,
      matchId: match.id,
      homeTeamId: match.homeTeam.id,
      homeTeamName: match.homeTeam.name,
      homeTeamFlag: match.homeTeam.flagEmoji,
      awayTeamId: match.awayTeam.id,
      awayTeamName: match.awayTeam.name,
      awayTeamFlag: match.awayTeam.flagEmoji,
      homeOdd: row.homeOdd,
      awayOdd: row.awayOdd,
      matchday: match.matchday,
      scheduledAt: match.scheduledAt.toISOString(),
      userPickTeamId: pickedTeamId,
      userPickTeamName: pickedTeamName,
      stats,
    };
  });

  return { bets, isOwner };
}
