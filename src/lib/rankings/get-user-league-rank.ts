import { loadLeaguePointsContext } from "@/lib/rankings/league-points-context";
import {
  computeUserAutomaticPoints,
  computeUserTotalPoints,
} from "@/lib/rankings/user-total-points";

/** Current overall fantasy league rank (1 = first place). */
export async function getUserLeagueRank(userId: string): Promise<number | null> {
  const ctx = await loadLeaguePointsContext();
  if (!ctx.users.some((u) => u.id === userId)) return null;

  const entries = ctx.users.map((user) => {
    const automaticPoints = computeUserAutomaticPoints(
      user.id,
      ctx.matchdays,
      ctx.scoringCtx,
      ctx.powerIndex
    );
    return {
      userId: user.id,
      teamName: user.teamName,
      points: computeUserTotalPoints(
        automaticPoints,
        user.manualPointsAdjustment,
        user.predictionPoints
      ),
    };
  });

  entries.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return a.teamName.localeCompare(b.teamName);
  });

  const index = entries.findIndex((e) => e.userId === userId);
  return index >= 0 ? index + 1 : null;
}
