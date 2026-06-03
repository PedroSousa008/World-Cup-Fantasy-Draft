import { prisma } from "@/lib/db/prisma";
import type { MatchBetsPayload, MatchBetVoteStats, PromotedMatchBetDto } from "@/lib/bets/types";
import { isPlatformOwner } from "@/lib/auth/permissions";

export async function getMatchBetsData(
  userId: string,
  options: { includeVoteStats?: boolean } = {}
): Promise<MatchBetsPayload> {
  const showVoteStats =
    options.includeVoteStats ?? (await isPlatformOwner(userId));

  const promoted = await prisma.ownerPromotedMatchBet.findMany({
    where: { isActive: true },
    include: {
      match: {
        include: {
          homeTeam: { select: { id: true, name: true, flagEmoji: true } },
          awayTeam: { select: { id: true, name: true, flagEmoji: true } },
        },
      },
    },
    orderBy: { match: { scheduledAt: "asc" } },
  });

  const betIds = promoted.map((p) => p.id);

  const [voteGroups, userVotes] = await Promise.all([
    showVoteStats
      ? prisma.matchBetVote.groupBy({
          by: ["promotedBetId", "pickedTeamId"],
          _count: { _all: true },
          where: { promotedBetId: { in: betIds } },
        })
      : Promise.resolve([]),
    prisma.matchBetVote.findMany({
      where: { userId, promotedBetId: { in: betIds } },
      select: { promotedBetId: true, pickedTeamId: true },
    }),
  ]);

  const userVoteByBet = new Map(
    userVotes.map((v) => [v.promotedBetId, v.pickedTeamId])
  );

  const bets: PromotedMatchBetDto[] = promoted.map((row) => {
    const match = row.match;
    let stats: MatchBetVoteStats = { homeVotes: 0, awayVotes: 0, totalVotes: 0 };

    if (showVoteStats) {
      const voteRows = voteGroups.filter((v) => v.promotedBetId === row.id);
      let homeVotes = 0;
      let awayVotes = 0;
      for (const v of voteRows) {
        if (v.pickedTeamId === match.homeTeam.id) homeVotes += v._count._all;
        else if (v.pickedTeamId === match.awayTeam.id) awayVotes += v._count._all;
      }
      stats = { homeVotes, awayVotes, totalVotes: homeVotes + awayVotes };
    }

    const pickedTeamId = userVoteByBet.get(row.id) ?? null;
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

  return { bets };
}
