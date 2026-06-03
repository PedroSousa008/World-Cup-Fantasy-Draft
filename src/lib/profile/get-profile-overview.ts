import { loadLeaguePointsContext } from "@/lib/rankings/league-points-context";
import { computeUserMatchdayPointsFromIndex } from "@/lib/rankings/power-points-index";
import { getCurrentMatchday } from "@/lib/tournament/matchday-lock";
import {
  buildProfileHeader,
} from "@/lib/profile/profile-points";
import type { ProfileOverviewPayload } from "@/lib/profile/types";

export async function getProfileOverviewData(
  userId: string
): Promise<ProfileOverviewPayload> {
  const [ctx, currentMatchday] = await Promise.all([
    loadLeaguePointsContext(),
    getCurrentMatchday(),
  ]);

  const header = await buildProfileHeader(userId, ctx);
  const md = currentMatchday ?? ctx.matchdays[0] ?? 1;
  const currentMatchdayPoints = computeUserMatchdayPointsFromIndex(
    userId,
    md,
    ctx.scoringCtx,
    ctx.powerIndex
  );

  return {
    header,
    currentMatchday,
    currentMatchdayPoints,
    cards: {
      rank: header.rank,
      totalPoints: header.totalPoints,
      currentMatchdayPoints,
    },
  };
}
