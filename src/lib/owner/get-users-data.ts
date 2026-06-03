import { prisma } from "@/lib/db/prisma";
import { loadLeaguePointsContext } from "@/lib/rankings/league-points-context";
import {
  computeUserAutomaticPoints,
  computeUserTotalPoints,
} from "@/lib/rankings/user-total-points";
import type { UserRole } from "@prisma/client";

export interface OwnerUserRow {
  id: string;
  username: string;
  teamName: string;
  selectedNation: string;
  role: UserRole;
  automaticPoints: number;
  manualPointsAdjustment: number;
  totalPoints: number;
}

export async function getOwnerUsersData(): Promise<OwnerUserRow[]> {
  const [ctx, users] = await Promise.all([
    loadLeaguePointsContext(),
    prisma.user.findMany({
      select: {
        id: true,
        username: true,
        teamName: true,
        selectedNation: true,
        role: true,
        manualPointsAdjustment: true,
      },
      orderBy: { teamName: "asc" },
    }),
  ]);

  return users.map((user) => {
    const automaticPoints = computeUserAutomaticPoints(
      user.id,
      ctx.matchdays,
      ctx.scoringCtx,
      ctx.powerIndex
    );
    const manualPointsAdjustment = user.manualPointsAdjustment;
    return {
      id: user.id,
      username: user.username,
      teamName: user.teamName,
      selectedNation: user.selectedNation,
      role: user.role,
      automaticPoints,
      manualPointsAdjustment,
      totalPoints: computeUserTotalPoints(automaticPoints, manualPointsAdjustment),
    };
  });
}

export async function getOwnerUserAutomaticPoints(userId: string): Promise<number | null> {
  const ctx = await loadLeaguePointsContext();
  if (!ctx.users.some((user) => user.id === userId)) return null;
  return computeUserAutomaticPoints(userId, ctx.matchdays, ctx.scoringCtx, ctx.powerIndex);
}
