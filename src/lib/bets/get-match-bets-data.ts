import { MatchBetPick } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { pickToDisplayLabel } from "@/lib/bets/match-bet-utils";
import type { MatchBetsPayload, MatchBetVoteStats, PromotedMatchBetDto } from "@/lib/bets/types";
import type { PromotedMatchBetStatus } from "@/lib/bets/types";
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
          by: ["promotedBetId", "pick"],
          _count: { _all: true },
          where: { promotedBetId: { in: betIds } },
        })
      : Promise.resolve([]),
    prisma.matchBetVote.findMany({
      where: { userId, promotedBetId: { in: betIds } },
      select: { promotedBetId: true, pick: true },
    }),
  ]);

  const userVoteByBet = new Map(
    userVotes.map((v) => [v.promotedBetId, v.pick as MatchBetPick])
  );

  const bets: PromotedMatchBetDto[] = promoted.map((row) => {
    const match = row.match;
    let stats: MatchBetVoteStats = {
      homeVotes: 0,
      drawVotes: 0,
      awayVotes: 0,
      totalVotes: 0,
    };

    if (showVoteStats) {
      const voteRows = voteGroups.filter((v) => v.promotedBetId === row.id);
      let homeVotes = 0;
      let drawVotes = 0;
      let awayVotes = 0;
      for (const v of voteRows) {
        if (v.pick === MatchBetPick.HOME) homeVotes += v._count._all;
        else if (v.pick === MatchBetPick.DRAW) drawVotes += v._count._all;
        else if (v.pick === MatchBetPick.AWAY) awayVotes += v._count._all;
      }
      stats = {
        homeVotes,
        drawVotes,
        awayVotes,
        totalVotes: homeVotes + drawVotes + awayVotes,
      };
    }

    const userPick = (userVoteByBet.get(row.id) as MatchBetPick | undefined) ?? null;
    const userPickLabel =
      userPick != null
        ? pickToDisplayLabel(userPick, match.homeTeam.name, match.awayTeam.name)
        : null;

    return {
      id: row.id,
      matchId: match.id,
      status: row.status as PromotedMatchBetStatus,
      homeTeamId: match.homeTeam.id,
      homeTeamName: match.homeTeam.name,
      homeTeamFlag: match.homeTeam.flagEmoji,
      awayTeamId: match.awayTeam.id,
      awayTeamName: match.awayTeam.name,
      awayTeamFlag: match.awayTeam.flagEmoji,
      homeOdd: row.homeOdd,
      drawOdd: row.drawOdd,
      awayOdd: row.awayOdd,
      matchday: match.matchday,
      scheduledAt: match.scheduledAt.toISOString(),
      userPick,
      userPickLabel,
      stats,
    };
  });

  return { bets };
}
