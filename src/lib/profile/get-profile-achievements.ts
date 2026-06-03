import { prisma } from "@/lib/db/prisma";
import { POWER_CATALOG, getPowerDefinition } from "@/lib/powers/catalog";
import { loadMatchdayInfos } from "@/lib/powers/matchday";
import { syncPowerStatuses } from "@/lib/powers/settle-powers";
import { loadLeaguePointsContext } from "@/lib/rankings/league-points-context";
import { computeUserMatchdayHistory } from "@/lib/profile/profile-points";
import type {
  ProfileAchievementsPayload,
  ProfilePowerRow,
  ProfilePowerStatus,
} from "@/lib/profile/types";
import type { UserPower } from "@prisma/client";

function mapPowerStatus(
  usage: UserPower | null,
  matchdayOpen: boolean,
  matchdayStarted: boolean,
  matchdaySettled: boolean,
  awaitingRival: boolean
): ProfilePowerStatus {
  if (awaitingRival) return "pending";
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

function statusLabel(status: ProfilePowerStatus): string {
  switch (status) {
    case "available":
      return "Available";
    case "used":
      return "Used";
    case "active":
      return "Active";
    case "pending":
      return "Pending";
    case "expired":
      return "Expired";
    default:
      return "—";
  }
}

export async function getProfileAchievementsData(
  userId: string
): Promise<ProfileAchievementsPayload> {
  await syncPowerStatuses();

  const [ctx, matchdayInfos, usages, outgoingRivals] = await Promise.all([
    loadLeaguePointsContext(),
    loadMatchdayInfos(),
    prisma.userPower.findMany({ where: { userId } }),
    prisma.rivalChallenge.findMany({
      where: { challengerId: userId, status: "AWAITING_ACCEPTANCE" },
      select: { id: true },
    }),
  ]);

  const usageByType = new Map(usages.map((u) => [u.powerType, u]));
  const awaitingRival = outgoingRivals.length > 0;

  const powers: ProfilePowerRow[] = POWER_CATALOG.map((def) => {
    const usage = usageByType.get(def.type) ?? null;
    const mdInfo =
      usage?.matchday != null
        ? matchdayInfos.find((m) => m.matchday === usage.matchday)
        : null;

    const status = mapPowerStatus(
      usage,
      mdInfo?.isOpen ?? true,
      mdInfo?.hasStarted ?? false,
      mdInfo?.isSettled ?? false,
      def.type === "RIVAL_CHALLENGE" && awaitingRival && !usage
    );

    const catalog = getPowerDefinition(def.type);
    return {
      type: def.type,
      name: catalog.name,
      icon: catalog.icon,
      status,
      statusLabel: statusLabel(status),
    };
  });

  const matchdayHistory = computeUserMatchdayHistory(userId, ctx);

  return { powers, matchdayHistory };
}
