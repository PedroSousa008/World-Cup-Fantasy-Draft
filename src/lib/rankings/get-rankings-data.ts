import { prisma } from "@/lib/db/prisma";
import { loadPowerScoringContext } from "@/lib/powers/scoring-context";
import { getNationFlag } from "@/lib/nations";
import { getPositionLabel } from "@/lib/players/types";
import { MATCHDAY_COUNT, MIN_LEAGUE_TABLE_ROWS } from "@/lib/scoring/constants";
import type { PlayerRankingRow, RankingsData, TeamRankingRow } from "@/lib/rankings/types";
import {
  buildPowerPointsIndex,
  computeUserMatchdayPointsFromIndex,
} from "@/lib/rankings/power-points-index";

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
  const matchdays = Array.from({ length: MATCHDAY_COUNT }, (_, i) => i + 1);

  const [scoringCtx, users, players, recentMatch, allPowers, allRivals] =
    await Promise.all([
      loadPowerScoringContext(),
      prisma.user.findMany({
        select: { id: true, teamName: true, selectedNation: true },
        orderBy: { teamName: "asc" },
      }),
      prisma.player.findMany({
        select: {
          id: true,
          name: true,
          photoUrl: true,
          nationality: true,
          position: true,
          nationalTeam: { select: { name: true, flagEmoji: true } },
          fantasySlots: {
            take: 1,
            select: {
              fantasyTeam: {
                select: { user: { select: { teamName: true } } },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.match.findFirst({
        where: { matchday: { not: null } },
        orderBy: { updatedAt: "desc" },
        select: { matchday: true },
      }),
      prisma.userPower.findMany({
        where: {
          matchday: { not: null },
          status: { in: ["PENDING", "ACTIVE", "USED"] },
        },
      }),
      prisma.rivalChallenge.findMany({
        where: { status: "USED" },
      }),
    ]);

  const powerIndex = buildPowerPointsIndex(allPowers, allRivals);

  const pointsByUserMatchday = new Map<string, number>();
  const getPoints = (userId: string, matchday: number) => {
    const key = `${userId}:${matchday}`;
    if (!pointsByUserMatchday.has(key)) {
      pointsByUserMatchday.set(
        key,
        computeUserMatchdayPointsFromIndex(userId, matchday, scoringCtx, powerIndex)
      );
    }
    return pointsByUserMatchday.get(key) ?? 0;
  };

  const overallEntries = users.map((user) => {
    let points = 0;
    for (const md of matchdays) {
      points += getPoints(user.id, md);
    }
    return {
      userId: user.id,
      teamName: user.teamName,
      nation: user.selectedNation,
      points,
    };
  });

  const overall = buildLeagueTable(overallEntries, MIN_LEAGUE_TABLE_ROWS);

  const matchdayRankings: Record<number, TeamRankingRow[]> = {};
  for (const md of matchdays) {
    const mdEntries = users.map((user) => ({
      userId: user.id,
      teamName: user.teamName,
      nation: user.selectedNation,
      points: getPoints(user.id, md),
    }));
    matchdayRankings[md] = buildLeagueTable(mdEntries, MIN_LEAGUE_TABLE_ROWS);
  }

  const playerRows: PlayerRankingRow[] = players
    .map((player) => {
      const stats = scoringCtx.statsMap.get(player.id);
      const ownerTeamName =
        player.fantasySlots[0]?.fantasyTeam.user.teamName ?? null;
      const nationName = player.nationalTeam?.name ?? player.nationality;

      return {
        playerId: player.id,
        name: player.name,
        nation: nationName,
        nationFlag: player.nationalTeam?.flagEmoji ?? getNationFlag(nationName),
        position: getPositionLabel(player.position),
        photoUrl: player.photoUrl,
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
  playerNationality: string,
  nationalTeamId?: string | null
): Promise<{ fixture: string; date?: string; status: "not_started" | "live" | "finished" }> {
  const { getPlayerFixture } = await import("@/lib/tournament/fixtures");
  const data = await getPlayerFixture(nationalTeamId, playerNationality);
  return {
    fixture: data.fixture,
    date: data.scheduledAt
      ? new Date(data.scheduledAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        })
      : undefined,
    status: data.status,
  };
}
