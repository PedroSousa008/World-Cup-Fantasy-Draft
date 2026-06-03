import { loadLeaguePointsContext } from "@/lib/rankings/league-points-context";
import {
  buildTeamLeaders,
  computeLongestTop3Streak,
  computeUserMatchdayHistory,
  loadUserSquadPlayerStats,
  pickBestWorstMatchday,
} from "@/lib/profile/profile-points";
import type { ProfileRecordsPayload } from "@/lib/profile/types";

export async function getProfileRecordsData(
  userId: string
): Promise<ProfileRecordsPayload> {
  const [ctx, squad] = await Promise.all([
    loadLeaguePointsContext(),
    loadUserSquadPlayerStats(userId),
  ]);

  const history = computeUserMatchdayHistory(userId, ctx);
  const { best, worst } = pickBestWorstMatchday(history);
  const leaders = buildTeamLeaders(squad.players, squad.statsByPlayerId);

  return {
    bestMatchday: best,
    worstMatchday: worst,
    longestTop3Streak: computeLongestTop3Streak(userId, ctx),
    ...leaders,
  };
}
