import { prisma } from "@/lib/db/prisma";
import { getPowerDefinition } from "@/lib/powers/catalog";
import { loadMatchdayInfos } from "@/lib/powers/matchday";
import {
  computeBaseSquadMatchdayPoints,
  loadPowerScoringContext,
} from "@/lib/powers/scoring-context";
import type { PowerType } from "@prisma/client";

function floorHalf(n: number): number {
  return Math.floor(n / 2);
}

async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  metadata?: Record<string, unknown>
) {
  await prisma.powerNotification.create({
    data: {
      userId,
      type,
      title,
      body,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

/** Transition PENDING → ACTIVE when matchday starts; USED when matchday fully settled */
export async function syncPowerStatuses(): Promise<void> {
  const matchdayInfos = await loadMatchdayInfos();

  const pendingPowers = await prisma.userPower.findMany({
    where: { status: "PENDING" },
  });

  for (const power of pendingPowers) {
    if (power.matchday == null) continue;
    const info = matchdayInfos.find((m) => m.matchday === power.matchday);
    if (!info) continue;

    if (info.isSettled) {
      await settlePowerUsage(power.id);
    } else if (info.hasStarted && !info.isSettled) {
      await prisma.userPower.update({
        where: { id: power.id },
        data: { status: "ACTIVE" },
      });
    } else if (!info.isOpen && !info.hasStarted) {
      await prisma.userPower.update({
        where: { id: power.id },
        data: { status: "EXPIRED", resultSummary: "Matchday deadline passed" },
      });
    }
  }

  for (const info of matchdayInfos) {
    if (!info.isSettled) continue;
    await settleMatchdayPowers(info.matchday);
  }
}

async function settlePowerUsage(powerId: string) {
  const power = await prisma.userPower.findUnique({ where: { id: powerId } });
  if (!power || power.status === "USED") return;

  if (power.matchday != null) {
    await settleSinglePower(power.userId, power.powerType, power.matchday, powerId);
  }
}

export async function settleMatchdayPowers(matchday: number): Promise<void> {
  const powers = await prisma.userPower.findMany({
    where: {
      matchday,
      status: { in: ["PENDING", "ACTIVE"] },
    },
  });

  for (const power of powers) {
    await settleSinglePower(power.userId, power.powerType, matchday, power.id);
  }

  const rivalChallenges = await prisma.rivalChallenge.findMany({
    where: { matchday, status: { in: ["PENDING", "ACTIVE"] } },
  });

  for (const challenge of rivalChallenges) {
    await settleRivalChallenge(challenge.id, matchday);
  }
}

async function settleSinglePower(
  userId: string,
  powerType: PowerType,
  matchday: number,
  powerId: string
) {
  const ctx = await loadPowerScoringContext();
  const def = getPowerDefinition(powerType);
  const power = await prisma.userPower.findUnique({ where: { id: powerId } });
  if (!power || power.status === "USED") return;

  let pointsEffect = 0;
  let resultSummary = "";

  switch (powerType) {
    case "DOUBLE_POINTS": {
      if (!power.targetPlayerId) break;
      const base = ctx.getPlayerMatchdayPoints(power.targetPlayerId, matchday);
      pointsEffect = base;
      const player = await prisma.player.findUnique({
        where: { id: power.targetPlayerId },
        select: { name: true },
      });
      resultSummary = `${player?.name ?? "Player"}: +${pointsEffect} bonus (doubled from ${base})`;
      break;
    }
    case "TRIPLE_CAPTAIN": {
      const team = ctx.fantasyTeams.get(userId);
      const captainId = team?.captainId;
      if (!captainId) {
        resultSummary = "No captain set";
        break;
      }
      const base = ctx.getPlayerMatchdayPoints(captainId, matchday);
      pointsEffect = base;
      const player = await prisma.player.findUnique({
        where: { id: captainId },
        select: { name: true },
      });
      resultSummary = `Captain ${player?.name ?? ""}: +${pointsEffect} bonus (triple vs double)`;
      break;
    }
    case "CURSE": {
      if (!power.targetPlayerId || !power.targetUserId) break;
      const base = ctx.getPlayerMatchdayPoints(power.targetPlayerId, matchday);
      const lost = base - floorHalf(base);
      pointsEffect = -lost;
      const player = await prisma.player.findUnique({
        where: { id: power.targetPlayerId },
        select: { name: true },
      });
      const curser = await prisma.user.findUnique({
        where: { id: userId },
        select: { teamName: true },
      });
      resultSummary = `Curse on ${player?.name ?? "player"}: -${lost} for target`;
      await createNotification(
        power.targetUserId,
        "CURSE_REVEALED",
        "Curse revealed",
        `Curse was applied to ${player?.name ?? "your player"} by ${curser?.teamName ?? "a rival"}. Points reduced from ${base} to ${floorHalf(base)}.`,
        { matchday, powerId, playerId: power.targetPlayerId }
      );
      break;
    }
    case "WILDCARD": {
      const transfers = await prisma.wildcardTransfer.count({
        where: { userPowerId: powerId },
      });
      resultSummary = `Wildcard used — ${transfers} transfer${transfers !== 1 ? "s" : ""} made`;
      pointsEffect = 0;
      break;
    }
    default:
      break;
  }

  await prisma.userPower.update({
    where: { id: powerId },
    data: {
      status: "USED",
      pointsEffect,
      resultSummary,
      settledAt: new Date(),
    },
  });

  await createNotification(
    userId,
    "POWER_CALCULATED",
    `${def.name} completed`,
    resultSummary || `${def.name} has been settled for Matchday ${matchday}.`,
    { matchday, powerType, pointsEffect }
  );
}

async function settleRivalChallenge(challengeId: string, matchday: number) {
  const challenge = await prisma.rivalChallenge.findUnique({
    where: { id: challengeId },
    include: { userPowers: true },
  });
  if (!challenge || challenge.status === "USED") return;

  const ctx = await loadPowerScoringContext();
  const p1 = computeBaseSquadMatchdayPoints(
    ctx,
    challenge.challengerId,
    matchday
  );
  const p2 = computeBaseSquadMatchdayPoints(ctx, challenge.opponentId, matchday);

  let winnerId: string;
  let cFinal: number;
  let oFinal: number;
  let cBonus = 0;
  let oBonus = 0;

  if (p1 > p2) {
    winnerId = challenge.challengerId;
    cFinal = p1 + floorHalf(p2);
    oFinal = floorHalf(p2);
    cBonus = floorHalf(p2);
    oBonus = -(p2 - floorHalf(p2));
  } else if (p2 > p1) {
    winnerId = challenge.opponentId;
    cFinal = floorHalf(p1);
    oFinal = p2 + floorHalf(p1);
    cBonus = -(p1 - floorHalf(p1));
    oBonus = floorHalf(p1);
  } else {
    winnerId = challenge.challengerId;
    cFinal = p1;
    oFinal = p2;
  }

  await prisma.rivalChallenge.update({
    where: { id: challengeId },
    data: {
      status: "USED",
      challengerMdPoints: p1,
      opponentMdPoints: p2,
      challengerFinalPoints: challenge.challengerId === winnerId ? cFinal : cFinal,
      opponentFinalPoints: challenge.opponentId === winnerId ? oFinal : oFinal,
      winnerId,
    },
  });

  const challengerPower = challenge.userPowers.find(
    (p) => p.userId === challenge.challengerId
  );
  const opponentPower = challenge.userPowers.find(
    (p) => p.userId === challenge.opponentId
  );

  if (challengerPower) {
    await prisma.userPower.update({
      where: { id: challengerPower.id },
      data: {
        status: "USED",
        pointsEffect: challenge.challengerId === winnerId ? cBonus : cBonus,
        resultSummary: `Rival Challenge MD${matchday}: ${p1} → ${cFinal} pts`,
        settledAt: new Date(),
      },
    });
  }
  if (opponentPower) {
    await prisma.userPower.update({
      where: { id: opponentPower.id },
      data: {
        status: "USED",
        pointsEffect: oBonus,
        resultSummary: `Rival Challenge MD${matchday}: ${p2} → ${oFinal} pts`,
        settledAt: new Date(),
      },
    });
  }

  const winner = await prisma.user.findUnique({
    where: { id: winnerId },
    select: { teamName: true },
  });

  for (const uid of [challenge.challengerId, challenge.opponentId]) {
    await createNotification(
      uid,
      "RIVAL_CHALLENGE_SETTLED",
      "Rival Challenge settled",
      `Matchday ${matchday}: ${winner?.teamName ?? "Winner"} wins the Rival Challenge.`,
      { challengeId, matchday }
    );
  }
}
