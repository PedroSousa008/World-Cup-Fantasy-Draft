import { prisma } from "@/lib/db/prisma";
import { getPowerDefinition, POWER_CATALOG } from "@/lib/powers/catalog";
import { loadMatchdayInfos, openMatchdays } from "@/lib/powers/matchday";
import { syncPowerStatuses } from "@/lib/powers/settle-powers";
import type {
  PowerCardData,
  PowerDisplayStatus,
  PowerHistoryEntry,
  PowerNotificationItem,
  PowersPageData,
  RivalChallengeItem,
} from "@/lib/powers/types";
import type { UserPower } from "@prisma/client";

function mapDisplayStatus(
  usage: UserPower | null,
  matchdayOpen: boolean,
  matchdayStarted: boolean,
  matchdaySettled: boolean,
  awaitingRival?: boolean
): PowerDisplayStatus {
  if (awaitingRival) return "awaiting_acceptance";
  if (!usage) return "available";

  if (usage.status === "USED") return "used";
  if (usage.status === "EXPIRED") return "expired";

  if (usage.matchday != null) {
    if (matchdaySettled) return "used";
    if (matchdayStarted) return "active";
    if (!matchdayOpen) return "expired";
    return "pending";
  }

  if (usage.status === "ACTIVE") return "active";
  if (usage.status === "PENDING") return "pending";
  return "available";
}

async function resolveTargetLabel(
  usage: UserPower | null
): Promise<string | null> {
  if (!usage) return null;

  if (usage.targetPlayerId) {
    const p = await prisma.player.findUnique({
      where: { id: usage.targetPlayerId },
      select: { name: true },
    });
    return p?.name ?? null;
  }

  if (usage.targetUserId) {
    const u = await prisma.user.findUnique({
      where: { id: usage.targetUserId },
      select: { teamName: true },
    });
    return u?.teamName ?? null;
  }

  return null;
}

export async function getPowersData(userId: string): Promise<PowersPageData> {
  await syncPowerStatuses();

  const matchdayInfos = await loadMatchdayInfos();
  const openMd = openMatchdays(matchdayInfos);

  const [
    usages,
    notifications,
    incomingRivals,
    outgoingRivals,
    fantasyTeam,
    otherTeamsWithPlayers,
    allUsers,
    assignedPlayerIds,
    allPlayers,
  ] = await Promise.all([
    prisma.userPower.findMany({ where: { userId } }),
    prisma.powerNotification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.rivalChallenge.findMany({
      where: {
        opponentId: userId,
        status: "AWAITING_ACCEPTANCE",
      },
      include: {
        challenger: { select: { teamName: true } },
        opponent: { select: { teamName: true } },
      },
    }),
    prisma.rivalChallenge.findMany({
      where: {
        challengerId: userId,
        status: "AWAITING_ACCEPTANCE",
      },
      include: {
        challenger: { select: { teamName: true } },
        opponent: { select: { teamName: true } },
      },
    }),
    prisma.fantasyTeam.findUnique({
      where: { userId },
      include: {
        players: {
          include: { player: { select: { id: true, name: true, position: true } } },
        },
      },
    }),
    prisma.fantasyTeam.findMany({
      where: { userId: { not: userId }, players: { some: {} } },
      include: {
        user: { select: { id: true, teamName: true } },
        players: { include: { player: { select: { id: true, name: true } } } },
      },
    }),
    prisma.user.findMany({
      where: { id: { not: userId } },
      select: { id: true, teamName: true },
      orderBy: { teamName: "asc" },
    }),
    prisma.fantasyTeamPlayer.findMany({ select: { playerId: true } }),
    prisma.player.findMany({
      select: { id: true, name: true, position: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const usageByType = new Map(usages.map((u) => [u.powerType, u]));
  const assignedSet = new Set(assignedPlayerIds.map((a) => a.playerId));
  const unassignedPlayers = allPlayers
    .filter((p) => !assignedSet.has(p.id))
    .map((p) => ({ id: p.id, name: p.name, position: p.position }));

  const wildcardUsage = usageByType.get("WILDCARD");
  const wildcardActive =
    wildcardUsage != null &&
    ["PENDING", "ACTIVE"].includes(wildcardUsage.status) &&
    wildcardUsage.matchday != null;

  const powers: PowerCardData[] = await Promise.all(
    POWER_CATALOG.map(async (def) => {
      const usage = usageByType.get(def.type) ?? null;
      const mdInfo =
        usage?.matchday != null
          ? matchdayInfos.find((m) => m.matchday === usage.matchday)
          : null;

      const awaitingRival =
        def.type === "RIVAL_CHALLENGE" &&
        outgoingRivals.some((c) => c.status === "AWAITING_ACCEPTANCE") &&
        !usage;

      const displayStatus = mapDisplayStatus(
        usage,
        mdInfo?.isOpen ?? true,
        mdInfo?.hasStarted ?? false,
        mdInfo?.isSettled ?? false,
        awaitingRival
      );

      const targetLabel = await resolveTargetLabel(usage);

      return {
        type: def.type,
        name: def.name,
        icon: def.icon,
        description: def.description,
        displayStatus,
        matchday: usage?.matchday ?? null,
        targetLabel,
        pointsEffect: usage?.pointsEffect ?? null,
        resultSummary: usage?.resultSummary ?? null,
        canActivate: displayStatus === "available",
        rivalChallengeId: usage?.rivalChallengeId ?? null,
      };
    })
  );

  const history: PowerHistoryEntry[] = usages
    .filter((u) => u.status === "USED" || u.status === "EXPIRED")
    .map((u) => {
      const def = getPowerDefinition(u.powerType);
      return {
        powerType: u.powerType,
        name: def.name,
        icon: def.icon,
        matchday: u.matchday,
        targetLabel: null,
        resultLabel: u.resultSummary,
        pointsEffect: u.pointsEffect,
        status: u.status === "USED" ? "used" : "expired",
        settledAt: u.settledAt?.toISOString() ?? null,
      };
    });

  for (const entry of history) {
    const usage = usages.find((u) => u.powerType === entry.powerType);
    if (usage) entry.targetLabel = await resolveTargetLabel(usage);
  }

  const notifItems: PowerNotificationItem[] = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));

  const pendingRivalChallenges: RivalChallengeItem[] = [
    ...incomingRivals.map((c) => ({
      id: c.id,
      challengerTeamName: c.challenger.teamName,
      opponentTeamName: c.opponent.teamName,
      matchday: c.matchday,
      status: c.status,
      isIncoming: true,
    })),
    ...outgoingRivals.map((c) => ({
      id: c.id,
      challengerTeamName: c.challenger.teamName,
      opponentTeamName: c.opponent.teamName,
      matchday: c.matchday,
      status: c.status,
      isIncoming: false,
    })),
  ];

  const opponentSquads: Record<string, { id: string; name: string }[]> = {};
  for (const t of otherTeamsWithPlayers) {
    opponentSquads[t.userId] = t.players.map((p) => ({
      id: p.player.id,
      name: p.player.name,
    }));
  }

  return {
    powers,
    history,
    notifications: notifItems,
    pendingRivalChallenges,
    openMatchdays: openMd,
    squadPlayers:
      fantasyTeam?.players.map((p) => ({
        id: p.player.id,
        name: p.player.name,
        position: p.player.position,
      })) ?? [],
    otherUsers: allUsers,
    opponentSquads,
    wildcardActive,
    wildcardMatchday: wildcardUsage?.matchday ?? null,
    unassignedPlayers,
  };
}
