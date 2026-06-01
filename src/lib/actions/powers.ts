"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { getPowerDefinition } from "@/lib/powers/catalog";
import { loadMatchdayInfos, getMatchdayInfo } from "@/lib/powers/matchday";
import type { PowerType } from "@prisma/client";

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

async function assertPowerAvailable(userId: string, powerType: PowerType) {
  const existing = await prisma.userPower.findUnique({
    where: { userId_powerType: { userId, powerType } },
  });
  if (existing) return { ok: false as const, error: "This power has already been used." };
  return { ok: true as const };
}

async function assertMatchdayOpen(matchday: number) {
  const infos = await loadMatchdayInfos();
  const info = getMatchdayInfo(infos, matchday);
  if (!info) return { ok: false as const, error: "Invalid matchday." };
  if (!info.isOpen) return { ok: false as const, error: "This matchday has already started." };
  return { ok: true as const };
}

async function notify(
  userId: string,
  type: string,
  title: string,
  body: string
) {
  await prisma.powerNotification.create({
    data: { userId, type, title, body },
  });
}

function revalidatePowers() {
  revalidatePath("/my-team/powers");
  revalidatePath("/my-team/rankings");
  revalidatePath("/my-team/team");
}

export async function activateDoublePointsAction(
  matchday: number,
  playerId: string
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const check = await assertPowerAvailable(user.id, "DOUBLE_POINTS");
  if (!check.ok) return check;

  const md = await assertMatchdayOpen(matchday);
  if (!md.ok) return md;

  const team = await prisma.fantasyTeam.findUnique({
    where: { userId: user.id },
    include: { players: true },
  });
  if (!team?.players.some((p) => p.playerId === playerId)) {
    return { ok: false, error: "Player must be on your squad." };
  }

  const def = getPowerDefinition("DOUBLE_POINTS");
  await prisma.userPower.create({
    data: {
      userId: user.id,
      powerType: "DOUBLE_POINTS",
      status: "PENDING",
      matchday,
      targetPlayerId: playerId,
    },
  });

  await notify(
    user.id,
    "POWER_ACTIVATED",
    `${def.name} activated`,
    `Pending for Matchday ${matchday}.`
  );

  revalidatePowers();
  return { ok: true };
}

export async function activateTripleCaptainAction(
  matchday: number
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const check = await assertPowerAvailable(user.id, "TRIPLE_CAPTAIN");
  if (!check.ok) return check;

  const md = await assertMatchdayOpen(matchday);
  if (!md.ok) return md;

  const team = await prisma.fantasyTeam.findUnique({ where: { userId: user.id } });
  if (!team?.captainId) {
    return { ok: false, error: "Set a captain on your team first." };
  }

  const def = getPowerDefinition("TRIPLE_CAPTAIN");
  await prisma.userPower.create({
    data: {
      userId: user.id,
      powerType: "TRIPLE_CAPTAIN",
      status: "PENDING",
      matchday,
    },
  });

  await notify(
    user.id,
    "POWER_ACTIVATED",
    `${def.name} activated`,
    `Pending for Matchday ${matchday}.`
  );

  revalidatePowers();
  return { ok: true };
}

export async function sendRivalChallengeAction(
  opponentId: string,
  matchday: number
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Not signed in" };

  if (opponentId === user.id) {
    return { ok: false, error: "You cannot challenge yourself." };
  }

  const check = await assertPowerAvailable(user.id, "RIVAL_CHALLENGE");
  if (!check.ok) return check;

  const opponentCheck = await assertPowerAvailable(opponentId, "RIVAL_CHALLENGE");
  if (!opponentCheck.ok) {
    return { ok: false, error: "That manager has already used Rival Challenge." };
  }

  const md = await assertMatchdayOpen(matchday);
  if (!md.ok) return md;

  await prisma.rivalChallenge.create({
    data: {
      challengerId: user.id,
      opponentId,
      matchday,
      status: "AWAITING_ACCEPTANCE",
    },
  });

  const challenger = await prisma.user.findUnique({
    where: { id: user.id },
    select: { teamName: true },
  });

  await notify(
    opponentId,
    "RIVAL_CHALLENGE_RECEIVED",
    "Rival Challenge received",
    `${challenger?.teamName ?? "A rival"} challenged you for Matchday ${matchday}.`,
  );

  revalidatePowers();
  return { ok: true };
}

export async function acceptRivalChallengeAction(
  challengeId: string
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const challenge = await prisma.rivalChallenge.findUnique({
    where: { id: challengeId },
  });
  if (!challenge || challenge.opponentId !== user.id) {
    return { ok: false, error: "Challenge not found." };
  }
  if (challenge.status !== "AWAITING_ACCEPTANCE") {
    return { ok: false, error: "Challenge is no longer pending." };
  }

  const check = await assertPowerAvailable(user.id, "RIVAL_CHALLENGE");
  if (!check.ok) return check;

  const md = await assertMatchdayOpen(challenge.matchday);
  if (!md.ok) return md;

  await prisma.rivalChallenge.update({
    where: { id: challengeId },
    data: { status: "PENDING" },
  });

  await prisma.userPower.create({
    data: {
      userId: challenge.challengerId,
      powerType: "RIVAL_CHALLENGE",
      status: "PENDING",
      matchday: challenge.matchday,
      rivalChallengeId: challengeId,
    },
  });

  await prisma.userPower.create({
    data: {
      userId: challenge.opponentId,
      powerType: "RIVAL_CHALLENGE",
      status: "PENDING",
      matchday: challenge.matchday,
      targetUserId: challenge.challengerId,
      rivalChallengeId: challengeId,
    },
  });

  await notify(
    challenge.challengerId,
    "RIVAL_CHALLENGE_ACCEPTED",
    "Challenge accepted",
    `Your Rival Challenge for Matchday ${challenge.matchday} was accepted.`
  );

  revalidatePowers();
  return { ok: true };
}

export async function declineRivalChallengeAction(
  challengeId: string
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const challenge = await prisma.rivalChallenge.findUnique({
    where: { id: challengeId },
  });
  if (!challenge || challenge.opponentId !== user.id) {
    return { ok: false, error: "Challenge not found." };
  }

  await prisma.rivalChallenge.update({
    where: { id: challengeId },
    data: { status: "DECLINED" },
  });

  await notify(
    challenge.challengerId,
    "RIVAL_CHALLENGE_DECLINED",
    "Challenge declined",
    `Your Rival Challenge for Matchday ${challenge.matchday} was declined.`
  );

  revalidatePowers();
  return { ok: true };
}

export async function activateLuckyDipAction(): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const check = await assertPowerAvailable(user.id, "LUCKY_DIP");
  if (!check.ok) return check;

  const myTeam = await prisma.fantasyTeam.findUnique({
    where: { userId: user.id },
    include: { players: { include: { player: true } } },
  });
  if (!myTeam || myTeam.players.length === 0) {
    return { ok: false, error: "You need players on your squad." };
  }

  const otherTeams = await prisma.fantasyTeam.findMany({
    where: { userId: { not: user.id }, players: { some: {} } },
    include: { players: { include: { player: true } }, user: true },
  });

  if (otherTeams.length === 0) {
    return { ok: false, error: "No other managers with players to swap." };
  }

  const mySlot =
    myTeam.players[Math.floor(Math.random() * myTeam.players.length)];
  const otherTeam = otherTeams[Math.floor(Math.random() * otherTeams.length)];
  const otherSlot =
    otherTeam.players[Math.floor(Math.random() * otherTeam.players.length)];

  await prisma.$transaction([
    prisma.fantasyTeamPlayer.update({
      where: { id: mySlot.id },
      data: { fantasyTeamId: otherTeam.id },
    }),
    prisma.fantasyTeamPlayer.update({
      where: { id: otherSlot.id },
      data: { fantasyTeamId: myTeam.id },
    }),
  ]);

  const def = getPowerDefinition("LUCKY_DIP");
  await prisma.userPower.create({
    data: {
      userId: user.id,
      powerType: "LUCKY_DIP",
      status: "USED",
      targetPlayerId: otherSlot.playerId,
      resultSummary: `Swapped ${mySlot.player.name} for ${otherSlot.player.name} (${otherTeam.user.teamName})`,
      settledAt: new Date(),
    },
  });

  await notify(
    user.id,
    "POWER_USED",
    `${def.name} used`,
    `You received ${otherSlot.player.name} from ${otherTeam.user.teamName}.`
  );

  revalidatePowers();
  revalidatePath("/my-team/draft");
  return { ok: true };
}

export async function activateWildcardAction(matchday: number): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const check = await assertPowerAvailable(user.id, "WILDCARD");
  if (!check.ok) return check;

  const md = await assertMatchdayOpen(matchday);
  if (!md.ok) return md;

  const def = getPowerDefinition("WILDCARD");
  await prisma.userPower.create({
    data: {
      userId: user.id,
      powerType: "WILDCARD",
      status: "PENDING",
      matchday,
    },
  });

  await notify(
    user.id,
    "POWER_ACTIVATED",
    `${def.name} activated`,
    `Unlimited transfers until Matchday ${matchday} starts.`
  );

  revalidatePowers();
  return { ok: true };
}

export async function wildcardTransferAction(
  playerInId: string,
  playerOutId: string
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const power = await prisma.userPower.findUnique({
    where: { userId_powerType: { userId: user.id, powerType: "WILDCARD" } },
  });
  if (!power || power.status !== "PENDING" || power.matchday == null) {
    return { ok: false, error: "Wildcard is not active." };
  }

  const md = await assertMatchdayOpen(power.matchday);
  if (!md.ok) return md;

  const assigned = await prisma.fantasyTeamPlayer.findFirst({
    where: { playerId: playerInId },
  });
  if (assigned) {
    return { ok: false, error: "You can only add unassigned players." };
  }

  const team = await prisma.fantasyTeam.findUnique({
    where: { userId: user.id },
    include: { players: true },
  });
  if (!team) return { ok: false, error: "No fantasy team." };

  const outSlot = team.players.find((p) => p.playerId === playerOutId);
  if (!outSlot) return { ok: false, error: "Player to remove is not on your squad." };

  await prisma.$transaction([
    prisma.fantasyTeamPlayer.delete({ where: { id: outSlot.id } }),
    prisma.fantasyTeamPlayer.create({
      data: {
        fantasyTeamId: team.id,
        playerId: playerInId,
        isStarter: outSlot.isStarter,
        slotOrder: outSlot.slotOrder,
      },
    }),
    prisma.wildcardTransfer.create({
      data: {
        userPowerId: power.id,
        playerOutId,
        playerInId,
      },
    }),
  ]);

  revalidatePowers();
  revalidatePath("/my-team/team");
  revalidatePath("/my-team/draft");
  return { ok: true };
}

export async function activateCurseAction(
  matchday: number,
  targetUserId: string,
  targetPlayerId: string
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Not signed in" };

  if (targetUserId === user.id) {
    return { ok: false, error: "You cannot curse your own players." };
  }

  const check = await assertPowerAvailable(user.id, "CURSE");
  if (!check.ok) return check;

  const md = await assertMatchdayOpen(matchday);
  if (!md.ok) return md;

  const slot = await prisma.fantasyTeamPlayer.findFirst({
    where: {
      playerId: targetPlayerId,
      fantasyTeam: { userId: targetUserId },
    },
  });
  if (!slot) {
    return { ok: false, error: "That player is not on the selected team." };
  }

  const def = getPowerDefinition("CURSE");
  await prisma.userPower.create({
    data: {
      userId: user.id,
      powerType: "CURSE",
      status: "PENDING",
      matchday,
      targetPlayerId,
      targetUserId,
    },
  });

  await notify(
    user.id,
    "POWER_ACTIVATED",
    `${def.name} activated`,
    `Pending for Matchday ${matchday}. Target will be notified after the matchday.`
  );

  revalidatePowers();
  return { ok: true };
}

export async function markNotificationReadAction(
  notificationId: string
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Not signed in" };

  await prisma.powerNotification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { read: true },
  });

  revalidatePowers();
  return { ok: true };
}
