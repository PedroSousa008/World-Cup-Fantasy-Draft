import {
  buildSquadRows,
  loadUserSquadPlayerStats,
} from "@/lib/profile/profile-points";
import type { ProfileSquadPayload } from "@/lib/profile/types";

export async function getProfileSquadData(userId: string): Promise<ProfileSquadPayload> {
  const { players, statsByPlayerId } = await loadUserSquadPlayerStats(userId);
  return { rows: buildSquadRows(players, statsByPlayerId) };
}
