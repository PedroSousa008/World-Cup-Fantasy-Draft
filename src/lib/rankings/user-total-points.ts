import type { PowerScoringContext } from "@/lib/powers/scoring-context";
import {
  computeUserMatchdayPointsFromIndex,
  type PowerPointsIndex,
} from "@/lib/rankings/power-points-index";
import {
  loadLeaguePointsContext,
  type LeaguePointsContext,
} from "@/lib/rankings/league-points-context";

export function computeUserAutomaticPoints(
  userId: string,
  matchdays: number[],
  scoringCtx: PowerScoringContext,
  powerIndex: PowerPointsIndex
): number {
  let total = 0;
  for (const md of matchdays) {
    total += computeUserMatchdayPointsFromIndex(userId, md, scoringCtx, powerIndex);
  }
  return total;
}

export function computeUserTotalPoints(
  automaticPoints: number,
  manualPointsAdjustment: number
): number {
  return automaticPoints + manualPointsAdjustment;
}

export function computeUserLeaguePointsFromContext(
  userId: string,
  ctx: LeaguePointsContext
): { automaticPoints: number; manualPointsAdjustment: number; totalPoints: number } {
  const user = ctx.users.find((row) => row.id === userId);
  const manualPointsAdjustment = user?.manualPointsAdjustment ?? 0;
  const automaticPoints = computeUserAutomaticPoints(
    userId,
    ctx.matchdays,
    ctx.scoringCtx,
    ctx.powerIndex
  );
  return {
    automaticPoints,
    manualPointsAdjustment,
    totalPoints: computeUserTotalPoints(automaticPoints, manualPointsAdjustment),
  };
}

export async function getUserLeaguePoints(userId: string) {
  const ctx = await loadLeaguePointsContext();
  const { automaticPoints, manualPointsAdjustment, totalPoints } =
    computeUserLeaguePointsFromContext(userId, ctx);

  const ranked = ctx.users
    .map((user) => {
      const points = computeUserLeaguePointsFromContext(user.id, ctx);
      return { id: user.id, totalPoints: points.totalPoints, teamName: user.teamName };
    })
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return a.teamName.localeCompare(b.teamName);
    });

  const rankIndex = ranked.findIndex((row) => row.id === userId);
  const rank = rankIndex >= 0 ? rankIndex + 1 : null;

  return { automaticPoints, manualPointsAdjustment, totalPoints, rank };
}
