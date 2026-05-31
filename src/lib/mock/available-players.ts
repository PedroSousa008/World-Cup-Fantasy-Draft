import type { FantasyPlayer } from "@/lib/squad/squad-utils";

/**
 * Players assigned to a user's team by the Owner after the draft.
 * Draft ownership ≠ squad assignment. Users only manage players here.
 */
export const MOCK_OWNER_ASSIGNED_BY_TEAM: Record<string, FantasyPlayer[]> = {
  // Empty by default — Owner assigns players after draft completes.
  "Pedro FC": [],
};

export function getOwnerAssignedPlayers(teamName: string): FantasyPlayer[] {
  return MOCK_OWNER_ASSIGNED_BY_TEAM[teamName] ?? [];
}

export function getEmptyAssignments(): Record<string, string | null> {
  const assignments: Record<string, string | null> = {};
  assignments["gk-0"] = null;

  for (let i = 0; i < 5; i++) assignments[`def-${i}`] = null;
  for (let i = 0; i < 5; i++) assignments[`mid-${i}`] = null;
  for (let i = 0; i < 3; i++) assignments[`fwd-${i}`] = null;
  for (let i = 0; i < 7; i++) assignments[`bench-${i}`] = null;

  return assignments;
}

export function buildPlayersMap(assignedPlayers: FantasyPlayer[]): Record<string, FantasyPlayer> {
  const map: Record<string, FantasyPlayer> = {};
  for (const p of assignedPlayers) {
    map[p.id] = p;
  }
  return map;
}
