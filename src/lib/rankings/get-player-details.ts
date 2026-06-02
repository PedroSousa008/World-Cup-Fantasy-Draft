import { prisma } from "@/lib/db/prisma";
import { buildCleanSheetBonuses } from "@/lib/scoring/clean-sheets";
import {
  buildScoringMap,
  computePlayerStats,
  pointsForRuleKey,
  type MatchEventWithMatch,
} from "@/lib/scoring/compute-player-stats";
import { SCORING_EVENT_TYPES } from "@/lib/scoring/constants";
import { getPlayerFixture } from "@/lib/tournament/fixtures";
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

  const [scoringRules, motmMatches, fixtureData, latestMatchday, finishedMatches, squadPlayers] =
    await Promise.all([
      prisma.scoringRule.findMany({ where: { isActive: true } }),
      prisma.match.findMany({
        where: { manOfTheMatchId: playerId },
        select: { id: true, matchday: true },
      }),
      getPlayerFixture(player.nationalTeamId, player.nationality),
      prisma.match.findFirst({
        where: { matchday: { not: null } },
        orderBy: { updatedAt: "desc" },
        select: { matchday: true },
      }),
      prisma.match.findMany({
        where: { status: "FINISHED", homeScore: { not: null }, awayScore: { not: null } },
        include: { homeTeam: true, awayTeam: true },
      }),
      prisma.player.findMany({
        select: { id: true, nationalTeamId: true, position: true },
      }),
    ]);

  const scoring = buildScoringMap(scoringRules);
  const csPoints = pointsForRuleKey(scoring, SCORING_EVENT_TYPES.CLEAN_SHEET, player.position);
  const cleanSheetBonuses = buildCleanSheetBonuses(finishedMatches, squadPlayers, csPoints);
  const csByMd = new Map<number, number>();
  for (const entry of cleanSheetBonuses.get(player.id) ?? []) {
    csByMd.set(entry.matchday, (csByMd.get(entry.matchday) ?? 0) + entry.points);
  }

  const stats = computePlayerStats(
    player,
    player.matchEvents as MatchEventWithMatch[],
    motmMatches,
    scoring,
    csByMd
  );

  const fixture = {
    fixture: fixtureData.fixture,
    date: fixtureData.scheduledAt
      ? new Date(fixtureData.scheduledAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        })
      : undefined,
    status: fixtureData.status,
  };

  const currentMd = latestMatchday?.matchday ?? 1;

  return {
    id: player.id,
    name: player.name,
    position: player.position as PlayerPosition,
    nation: player.nationality,
    club: player.club ?? "—",
    price: 0,
    totalPoints: stats.totalPoints,
    currentMatchdayPoints: stats.matchdayPoints[currentMd] ?? 0,
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
