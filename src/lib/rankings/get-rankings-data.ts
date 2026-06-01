import { prisma } from "@/lib/db/prisma";
import {
  buildScoringMap,
  computePlayerStats,
  type MatchEventWithMatch,
} from "@/lib/scoring/compute-player-stats";
import { syncPowerStatuses } from "@/lib/powers/settle-powers";
import { computeUserMatchdayPointsWithPowers } from "@/lib/powers/scoring-context";
import { MATCHDAY_COUNT, MIN_LEAGUE_TABLE_ROWS } from "@/lib/scoring/constants";
import type { PlayerRankingRow, RankingsData, TeamRankingRow } from "@/lib/rankings/types";

function buildLeagueTable(
  entries: { userId: string; teamName: string; nation: string; points: number }[],
  minRows: number
): TeamRankingRow[] {
  const sorted = [...entries].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return a.teamName.localeCompare(b.teamName);
  });

  const rows: TeamRankingRow[] = sorted.map((entry, index) => ({
    rank: index + 1,
    userId: entry.userId,
    teamName: entry.teamName,
    nation: entry.nation,
    points: entry.points,
    isEmpty: false,
  }));

  const targetRows = Math.max(minRows, rows.length);
  while (rows.length < targetRows) {
    rows.push({
      rank: rows.length + 1,
      teamName: null,
      nation: null,
      points: null,
      isEmpty: true,
    });
  }

  return rows;
}

export async function getRankingsData(currentUserTeamName: string): Promise<RankingsData> {
  await syncPowerStatuses();

  const matchdays = Array.from({ length: MATCHDAY_COUNT }, (_, i) => i + 1);

  const [users, fantasyTeams, players, events, scoringRules, recentMatch] =
    await Promise.all([
      prisma.user.findMany({
        select: { id: true, teamName: true, selectedNation: true },
        orderBy: { teamName: "asc" },
      }),
      prisma.fantasyTeam.findMany({
        include: {
          user: { select: { id: true, teamName: true, selectedNation: true } },
          players: { select: { playerId: true } },
        },
      }),
      prisma.player.findMany({
        include: {
          fantasySlots: {
            include: {
              fantasyTeam: {
                include: { user: { select: { teamName: true } } },
              },
            },
          },
        },
      }),
      prisma.matchEvent.findMany({
        where: { playerId: { not: null } },
        include: {
          match: {
            include: { homeTeam: true, awayTeam: true },
          },
        },
      }),
      prisma.scoringRule.findMany({ where: { isActive: true } }),
      prisma.match.findFirst({
        where: { matchday: { not: null } },
        orderBy: { updatedAt: "desc" },
        select: { matchday: true },
      }),
    ]);

  const scoring = buildScoringMap(scoringRules);
  const eventsByPlayer = new Map<string, MatchEventWithMatch[]>();
  for (const event of events) {
    if (!event.playerId) continue;
    const list = eventsByPlayer.get(event.playerId) ?? [];
    list.push(event as MatchEventWithMatch);
    eventsByPlayer.set(event.playerId, list);
  }

  const motmMatches = await prisma.match.findMany({
    where: { manOfTheMatchId: { not: null } },
    select: { id: true, matchday: true, manOfTheMatchId: true },
  });

  const motmByPlayer = new Map<string, { id: string; matchday: number | null }[]>();
  for (const match of motmMatches) {
    if (!match.manOfTheMatchId) continue;
    const list = motmByPlayer.get(match.manOfTheMatchId) ?? [];
    list.push({ id: match.id, matchday: match.matchday });
    motmByPlayer.set(match.manOfTheMatchId, list);
  }

  const playerStatsMap = new Map<
    string,
    ReturnType<typeof computePlayerStats>
  >();

  for (const player of players) {
    playerStatsMap.set(
      player.id,
      computePlayerStats(
        player,
        eventsByPlayer.get(player.id) ?? [],
        motmByPlayer.get(player.id) ?? [],
        scoring
      )
    );
  }

  const matchdayPointsCache = new Map<string, number>();

  async function userPointsForMatchday(userId: string, matchday?: number): Promise<number> {
    if (matchday != null) {
      const key = `${userId}:${matchday}`;
      if (!matchdayPointsCache.has(key)) {
        matchdayPointsCache.set(
          key,
          await computeUserMatchdayPointsWithPowers(userId, matchday)
        );
      }
      return matchdayPointsCache.get(key) ?? 0;
    }

    let total = 0;
    for (const md of matchdays) {
      total += await userPointsForMatchday(userId, md);
    }
    return total;
  }

  const overallEntries = await Promise.all(
    users.map(async (user) => ({
      userId: user.id,
      teamName: user.teamName,
      nation: user.selectedNation,
      points: await userPointsForMatchday(user.id),
    }))
  );

  const overall = buildLeagueTable(overallEntries, MIN_LEAGUE_TABLE_ROWS);

  const matchdayRankings: Record<number, TeamRankingRow[]> = {};
  for (const md of matchdays) {
    const mdEntries = await Promise.all(
      users.map(async (user) => ({
        userId: user.id,
        teamName: user.teamName,
        nation: user.selectedNation,
        points: await userPointsForMatchday(user.id, md),
      }))
    );
    matchdayRankings[md] = buildLeagueTable(mdEntries, MIN_LEAGUE_TABLE_ROWS);
  }

  const playerRows: PlayerRankingRow[] = players
    .map((player) => {
      const stats = playerStatsMap.get(player.id);
      const ownerTeamName =
        player.fantasySlots[0]?.fantasyTeam.user.teamName ?? null;

      return {
        playerId: player.id,
        name: player.name,
        nation: player.nationality,
        position: player.position,
        ownerTeamName,
        totalPoints: stats?.totalPoints ?? 0,
      };
    })
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return a.name.localeCompare(b.name);
    })
    .map((row, index) => ({ ...row, rank: index + 1 }));

  const defaultMatchday =
    recentMatch?.matchday != null &&
    recentMatch.matchday >= 1 &&
    recentMatch.matchday <= MATCHDAY_COUNT
      ? recentMatch.matchday
      : 1;

  return {
    overall,
    matchdayRankings,
    players: playerRows,
    defaultMatchday,
    matchdays,
    currentUserTeamName,
  };
}

export async function getUpcomingFixtureForPlayer(
  playerNationality: string
): Promise<{ fixture: string; date?: string; status: "not_started" | "live" | "finished" }> {
  const team = await prisma.nationalTeam.findFirst({
    where: {
      OR: [{ name: playerNationality }, { code: playerNationality }],
    },
  });

  if (!team) {
    return { fixture: "No fixture scheduled", status: "not_started" };
  }

  const nextMatch = await prisma.match.findFirst({
    where: {
      OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
      status: { in: ["SCHEDULED", "LIVE"] },
    },
    orderBy: { scheduledAt: "asc" },
    include: { homeTeam: true, awayTeam: true },
  });

  if (!nextMatch) {
    return { fixture: "No fixture scheduled", status: "not_started" };
  }

  const opponent =
    nextMatch.homeTeamId === team.id ? nextMatch.awayTeam.name : nextMatch.homeTeam.name;
  const status =
    nextMatch.status === "LIVE"
      ? "live"
      : nextMatch.status === "FINISHED"
        ? "finished"
        : "not_started";

  return {
    fixture: `${team.name} vs ${opponent}`,
    date: nextMatch.scheduledAt.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
    status,
  };
}
