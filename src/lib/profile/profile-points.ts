import type { LeaguePointsContext } from "@/lib/rankings/league-points-context";
import {
  computeUserMatchdayPointsFromIndex,
} from "@/lib/rankings/power-points-index";
import { computeUserLeaguePointsFromContext } from "@/lib/rankings/user-total-points";
import { getUserLeagueRankCached } from "@/lib/rankings/league-rank-index";
import { getNationFlag } from "@/lib/nations";
import { getPositionLabel } from "@/lib/players/types";
import { prisma } from "@/lib/db/prisma";
import { loadAllPlayerStats } from "@/lib/scoring/load-all-player-stats";
import type { PlayerComputedStats } from "@/lib/scoring/compute-player-stats";
import type {
  ProfileHeader,
  ProfileMatchdayRecord,
  ProfilePlayerLeader,
  ProfileSquadRow,
} from "@/lib/profile/types";

export async function buildProfileHeader(
  userId: string,
  ctx: LeaguePointsContext
): Promise<ProfileHeader> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, teamName: true, selectedNation: true },
  });

  const { totalPoints } = computeUserLeaguePointsFromContext(userId, ctx);
  const rank = await getUserLeagueRankCached(userId);

  return {
    username: user?.username ?? "—",
    teamName: user?.teamName ?? "—",
    selectedNation: user?.selectedNation ?? "—",
    nationFlag: getNationFlag(user?.selectedNation ?? ""),
    rank,
    totalPoints,
  };
}

export function computeUserMatchdayHistory(
  userId: string,
  ctx: LeaguePointsContext
): ProfileMatchdayRecord[] {
  return ctx.matchdays.map((matchday) => ({
    matchday,
    points: computeUserMatchdayPointsFromIndex(
      userId,
      matchday,
      ctx.scoringCtx,
      ctx.powerIndex
    ),
  }));
}

export function pickBestWorstMatchday(
  history: ProfileMatchdayRecord[]
): {
  best: ProfileMatchdayRecord | null;
  worst: ProfileMatchdayRecord | null;
} {
  const played = history.filter((row) => row.points > 0);
  if (played.length === 0) {
    if (history.length === 0) return { best: null, worst: null };
    const fallback = [...history].sort((a, b) => b.points - a.points);
    return { best: fallback[0] ?? null, worst: fallback[fallback.length - 1] ?? null };
  }

  const best = [...played].sort((a, b) => b.points - a.points)[0]!;
  const worst = [...played].sort((a, b) => a.points - b.points)[0]!;
  return { best, worst };
}

/** Consecutive matchdays finishing in the top 3 for that matchday's points. */
export function computeLongestTop3Streak(
  userId: string,
  ctx: LeaguePointsContext
): number {
  let longest = 0;
  let current = 0;

  for (const matchday of ctx.matchdays) {
    const scores = ctx.users.map((user) => ({
      userId: user.id,
      points: computeUserMatchdayPointsFromIndex(
        user.id,
        matchday,
        ctx.scoringCtx,
        ctx.powerIndex
      ),
      teamName: user.teamName,
    }));

    scores.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return a.teamName.localeCompare(b.teamName);
    });

    const rank = scores.findIndex((row) => row.userId === userId) + 1;
    if (rank > 0 && rank <= 3) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
}

function toPlayerLeader(
  player: {
    id: string;
    name: string;
    nationalTeam: { name: string; flagEmoji: string | null } | null;
    nationality: string;
  },
  value: number
): ProfilePlayerLeader {
  const nation = player.nationalTeam?.name ?? player.nationality;
  return {
    playerId: player.id,
    name: player.name,
    value,
    nation,
    nationFlag: player.nationalTeam?.flagEmoji ?? getNationFlag(nation),
  };
}

export async function loadUserSquadPlayerStats(userId: string): Promise<{
  players: {
    id: string;
    name: string;
    photoUrl: string | null;
    position: string;
    nationalTeam: { name: string; flagEmoji: string | null } | null;
    nationality: string;
  }[];
  statsByPlayerId: Map<string, PlayerComputedStats>;
}> {
  const team = await prisma.fantasyTeam.findUnique({
    where: { userId },
    include: {
      players: {
        include: {
          player: { include: { nationalTeam: true } },
        },
      },
    },
  });

  const players =
    team?.players.map((slot) => slot.player).filter((p) => p.availability === "AVAILABLE") ??
    [];

  const statsMap = await loadAllPlayerStats();
  const statsByPlayerId = new Map<string, PlayerComputedStats>();
  for (const player of players) {
    const stats = statsMap.get(player.id);
    if (stats) statsByPlayerId.set(player.id, stats);
  }

  return { players, statsByPlayerId };
}

export function buildSquadRows(
  players: {
    id: string;
    name: string;
    photoUrl: string | null;
    position: string;
    nationalTeam: { name: string; flagEmoji: string | null } | null;
    nationality: string;
  }[],
  statsByPlayerId: Map<string, PlayerComputedStats>
): ProfileSquadRow[] {
  return players.map((player) => {
    const nation = player.nationalTeam?.name ?? player.nationality;
    const stats = statsByPlayerId.get(player.id);
    return {
      playerId: player.id,
      name: player.name,
      photoUrl: player.photoUrl,
      position: player.position,
      positionLabel: getPositionLabel(player.position),
      nation,
      nationFlag: player.nationalTeam?.flagEmoji ?? getNationFlag(nation),
      fantasyPoints: stats?.totalPoints ?? 0,
    };
  });
}

export function buildTeamLeaders(
  players: {
    id: string;
    name: string;
    nationalTeam: { name: string; flagEmoji: string | null } | null;
    nationality: string;
  }[],
  statsByPlayerId: Map<string, PlayerComputedStats>
): {
  highestScoringPlayer: ProfilePlayerLeader | null;
  lowestScoringPlayer: ProfilePlayerLeader | null;
  mostGoals: ProfilePlayerLeader | null;
  mostAssists: ProfilePlayerLeader | null;
} {
  if (players.length === 0) {
    return {
      highestScoringPlayer: null,
      lowestScoringPlayer: null,
      mostGoals: null,
      mostAssists: null,
    };
  }

  const withStats = players.map((player) => ({
    player,
    stats: statsByPlayerId.get(player.id),
  }));

  const byPoints = [...withStats].sort(
    (a, b) => (b.stats?.totalPoints ?? 0) - (a.stats?.totalPoints ?? 0)
  );
  const byGoals = [...withStats].sort(
    (a, b) => (b.stats?.goals ?? 0) - (a.stats?.goals ?? 0)
  );
  const byAssists = [...withStats].sort(
    (a, b) => (b.stats?.assists ?? 0) - (a.stats?.assists ?? 0)
  );

  const highest = byPoints[0];
  const lowest = byPoints[byPoints.length - 1];
  const topGoals = byGoals[0];
  const topAssists = byAssists[0];

  return {
    highestScoringPlayer: highest
      ? toPlayerLeader(highest.player, highest.stats?.totalPoints ?? 0)
      : null,
    lowestScoringPlayer: lowest
      ? toPlayerLeader(lowest.player, lowest.stats?.totalPoints ?? 0)
      : null,
    mostGoals: topGoals && (topGoals.stats?.goals ?? 0) > 0
      ? toPlayerLeader(topGoals.player, topGoals.stats?.goals ?? 0)
      : null,
    mostAssists: topAssists && (topAssists.stats?.assists ?? 0) > 0
      ? toPlayerLeader(topAssists.player, topAssists.stats?.assists ?? 0)
      : null,
  };
}
