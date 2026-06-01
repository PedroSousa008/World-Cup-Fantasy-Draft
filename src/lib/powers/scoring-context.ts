import { prisma } from "@/lib/db/prisma";
import type { PlayerComputedStats } from "@/lib/scoring/compute-player-stats";
import { loadAllPlayerStats } from "@/lib/scoring/load-all-player-stats";

export interface PowerScoringContext {
  statsMap: Map<string, PlayerComputedStats>;
  fantasyTeams: Map<
    string,
    { captainId: string | null; playerIds: string[] }
  >;
  getPlayerMatchdayPoints: (playerId: string, matchday: number) => number;
}

export async function loadPowerScoringContext(): Promise<PowerScoringContext> {
  const [statsMap, teams] = await Promise.all([
    loadAllPlayerStats(),
    prisma.fantasyTeam.findMany({
      include: { players: { select: { playerId: true } } },
    }),
  ]);

  const fantasyTeams = new Map(
    teams.map((t) => [
      t.userId,
      {
        captainId: t.captainId,
        playerIds: t.players.map((p) => p.playerId),
      },
    ])
  );

  return {
    statsMap,
    fantasyTeams,
    getPlayerMatchdayPoints: (playerId, matchday) =>
      statsMap.get(playerId)?.matchdayPoints[matchday] ?? 0,
  };
}

export function computeBaseSquadMatchdayPoints(
  ctx: PowerScoringContext,
  userId: string,
  matchday: number
): number {
  const team = ctx.fantasyTeams.get(userId);
  if (!team) return 0;

  let total = 0;
  for (const playerId of team.playerIds) {
    let pts = ctx.getPlayerMatchdayPoints(playerId, matchday);
    if (team.captainId === playerId) {
      pts *= 2;
    }
    total += pts;
  }
  return total;
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
