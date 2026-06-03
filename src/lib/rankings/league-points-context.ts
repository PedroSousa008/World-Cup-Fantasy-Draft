import { prisma } from "@/lib/db/prisma";
import { loadPowerScoringContext } from "@/lib/powers/scoring-context";
import { MATCHDAY_COUNT } from "@/lib/scoring/constants";
import {
  buildPowerPointsIndex,
  type PowerPointsIndex,
} from "@/lib/rankings/power-points-index";
import type { PowerScoringContext } from "@/lib/powers/scoring-context";

export interface LeagueUserPointsRow {
  id: string;
  teamName: string;
  selectedNation: string;
  manualPointsAdjustment: number;
}

export interface LeaguePointsContext {
  matchdays: number[];
  scoringCtx: PowerScoringContext;
  powerIndex: PowerPointsIndex;
  users: LeagueUserPointsRow[];
}

export async function loadLeaguePointsContext(): Promise<LeaguePointsContext> {
  const matchdays = Array.from({ length: MATCHDAY_COUNT }, (_, i) => i + 1);

  const [scoringCtx, users, allPowers, allRivals] = await Promise.all([
    loadPowerScoringContext(),
    prisma.user.findMany({
      select: {
        id: true,
        teamName: true,
        selectedNation: true,
        manualPointsAdjustment: true,
      },
      orderBy: { teamName: "asc" },
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

  return {
    matchdays,
    scoringCtx,
    powerIndex,
    users: users.map((user) => ({
      id: user.id,
      teamName: user.teamName,
      selectedNation: user.selectedNation,
      manualPointsAdjustment: user.manualPointsAdjustment,
    })),
  };
}
