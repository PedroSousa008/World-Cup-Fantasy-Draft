import { prisma } from "@/lib/db/prisma";
import {
  buildScoringMap,
  computePlayerStats,
  type MatchEventWithMatch,
} from "@/lib/scoring/compute-player-stats";
import { getUpcomingFixtureForPlayer } from "@/lib/rankings/get-rankings-data";
import type { FantasyPlayer } from "@/lib/squad/squad-utils";
import type { PlayerPosition } from "@/lib/mock/my-team-data";

export interface DbPlayerDetails extends FantasyPlayer {
  ownerTeamName: string | null;
  minutesPlayed: number;
  ownGoals: number;
}

export async function getPlayerDetailsFromDb(
  playerId: string
): Promise<DbPlayerDetails | null> {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      matchEvents: {
        include: {
          match: { include: { homeTeam: true, awayTeam: true } },
        },
      },
      fantasySlots: {
        include: {
          fantasyTeam: {
            include: { user: { select: { teamName: true } } },
          },
        },
      },
    },
  });

  if (!player) return null;

  const [scoringRules, motmMatches, fixture, latestMatchday] = await Promise.all([
    prisma.scoringRule.findMany({ where: { isActive: true } }),
    prisma.match.findMany({
      where: { manOfTheMatchId: playerId },
      select: { id: true, matchday: true },
    }),
    getUpcomingFixtureForPlayer(player.nationality),
    prisma.match.findFirst({
      where: { matchday: { not: null } },
      orderBy: { updatedAt: "desc" },
      select: { matchday: true },
    }),
  ]);

  const scoring = buildScoringMap(scoringRules);
  const stats = computePlayerStats(
    player,
    player.matchEvents as MatchEventWithMatch[],
    motmMatches,
    scoring
  );

  const currentMd = latestMatchday?.matchday ?? 1;

  return {
    id: player.id,
    name: player.name,
    position: player.position as PlayerPosition,
    nation: player.nationality,
    club: player.club ?? "—",
    price: 0,
    totalPoints: stats.totalPoints,
    matchdayPoints: stats.matchdayPoints[currentMd] ?? 0,
    matchStatus: fixture.status,
    upcomingFixture: fixture.fixture,
    matchDate: fixture.date,
    goals: stats.goals,
    assists: stats.assists,
    yellowCards: stats.yellowCards,
    redCards: stats.redCards,
    motmAwards: stats.motmAwards,
    minutesPlayed: stats.minutesPlayed,
    ownGoals: stats.ownGoals,
    isDrafted: player.fantasySlots.length > 0,
    ownerTeamName: player.fantasySlots[0]?.fantasyTeam.user.teamName ?? null,
    matchHistory: stats.matchHistory,
  };
}
