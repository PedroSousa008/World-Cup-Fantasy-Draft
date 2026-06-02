import { prisma } from "@/lib/db/prisma";
import type { PlayerComputedStats } from "@/lib/scoring/compute-player-stats";
import { loadAllPlayerStats } from "@/lib/scoring/load-all-player-stats";
import { MATCHDAY_COUNT } from "@/lib/scoring/constants";
import { getActiveStarterPlayerIds } from "@/lib/squad/matchday-squad";

export interface PowerScoringContext {
  statsMap: Map<string, PlayerComputedStats>;
  fantasyTeams: Map<
    string,
    { captainId: string | null; starterIdsByMatchday: Map<number, string[]> }
  >;
  getPlayerMatchdayPoints: (playerId: string, matchday: number) => number;
}

export async function loadPowerScoringContext(): Promise<PowerScoringContext> {
  const [statsMap, teams, matchdaySquads] = await Promise.all([
    loadAllPlayerStats(),
    prisma.fantasyTeam.findMany({
      select: { userId: true, captainId: true },
    }),
    prisma.userMatchdaySquad.findMany({
      select: { userId: true, matchday: true, assignments: true },
    }),
  ]);

  const squadsByUser = new Map<string, Map<number, string[]>>();
  for (const row of matchdaySquads) {
    if (!row.assignments || typeof row.assignments !== "object") continue;
    const assignments = row.assignments as Record<string, string | null>;
    const starterIds = Object.entries(assignments)
      .filter(([slotId]) => !slotId.startsWith("bench-"))
      .map(([, pid]) => pid)
      .filter((pid): pid is string => Boolean(pid));

    if (!squadsByUser.has(row.userId)) squadsByUser.set(row.userId, new Map());
    squadsByUser.get(row.userId)!.set(row.matchday, starterIds);
  }

  const fantasyTeams = new Map<
    string,
    { captainId: string | null; starterIdsByMatchday: Map<number, string[]> }
  >();

  for (const t of teams) {
    const mdMap = squadsByUser.get(t.userId) ?? new Map();
    for (let md = 1; md <= MATCHDAY_COUNT; md++) {
      if (!mdMap.has(md) || mdMap.get(md)!.length === 0) {
        const ids = await getActiveStarterPlayerIds(t.userId, md);
        mdMap.set(md, ids);
      }
    }
    fantasyTeams.set(t.userId, {
      captainId: t.captainId,
      starterIdsByMatchday: mdMap,
    });
  }

  return {
    statsMap,
    fantasyTeams,
    getPlayerMatchdayPoints: (playerId, matchday) =>
      statsMap.get(playerId)?.matchdayPoints[matchday] ?? 0,
  };
}

/** Synchronous — uses preloaded starter IDs from context. */
export function computeBaseSquadMatchdayPoints(
  ctx: PowerScoringContext,
  userId: string,
  matchday: number
): number {
  const team = ctx.fantasyTeams.get(userId);
  if (!team) return 0;

  const starterIds = team.starterIdsByMatchday.get(matchday) ?? [];

  let total = 0;
  for (const playerId of starterIds) {
    let pts = ctx.getPlayerMatchdayPoints(playerId, matchday);
    if (team.captainId === playerId) {
      pts *= 2;
    }
    total += pts;
  }
  return total;
}

export async function computeBaseSquadMatchdayPointsAsync(
  ctx: PowerScoringContext,
  userId: string,
  matchday: number
): Promise<number> {
  return computeBaseSquadMatchdayPoints(ctx, userId, matchday);
}

/** Matchday points including power modifiers (for rankings) */
export async function computeUserMatchdayPointsWithPowers(
  userId: string,
  matchday: number,
  ctx?: PowerScoringContext
): Promise<number> {
  const context = ctx ?? (await loadPowerScoringContext());
  let total = computeBaseSquadMatchdayPoints(context, userId, matchday);

  const powers = await prisma.userPower.findMany({
    where: {
      userId,
      matchday,
      status: { in: ["PENDING", "ACTIVE", "USED"] },
    },
  });

  for (const power of powers) {
    switch (power.powerType) {
      case "DOUBLE_POINTS": {
        if (power.targetPlayerId) {
          const base = context.getPlayerMatchdayPoints(power.targetPlayerId, matchday);
          total += base;
        }
        break;
      }
      case "TRIPLE_CAPTAIN": {
        const team = context.fantasyTeams.get(userId);
        if (team?.captainId) {
          const base = context.getPlayerMatchdayPoints(team.captainId, matchday);
          total += base;
        }
        break;
      }
      default:
        break;
    }
  }

  const cursesOnMe = await prisma.userPower.findMany({
    where: {
      powerType: "CURSE",
      targetUserId: userId,
      matchday,
      status: { in: ["PENDING", "ACTIVE", "USED"] },
    },
  });
  for (const curse of cursesOnMe) {
    if (curse.targetPlayerId) {
      const base = context.getPlayerMatchdayPoints(curse.targetPlayerId, matchday);
      total -= base - Math.floor(base / 2);
    }
  }

  const rivalAsOpponent = await prisma.rivalChallenge.findFirst({
    where: {
      matchday,
      status: "USED",
      OR: [{ challengerId: userId }, { opponentId: userId }],
    },
  });

  if (rivalAsOpponent) {
    if (rivalAsOpponent.challengerId === userId && rivalAsOpponent.challengerFinalPoints != null) {
      return rivalAsOpponent.challengerFinalPoints;
    }
    if (rivalAsOpponent.opponentId === userId && rivalAsOpponent.opponentFinalPoints != null) {
      return rivalAsOpponent.opponentFinalPoints;
    }
    return total;
  }

  return total;
}
