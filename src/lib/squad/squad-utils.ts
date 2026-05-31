import type { PlayerPosition, MatchStatus } from "@/lib/mock/my-team-data";

export interface FantasyPlayer {
  id: string;
  name: string;
  position: PlayerPosition;
  nation: string;
  club: string;
  price: number;
  totalPoints: number;
  matchdayPoints: number;
  matchStatus: MatchStatus;
  upcomingFixture: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  isDrafted: boolean;
  matchHistory: { matchday: number; opponent: string; points: number }[];
}

export interface SquadValidation {
  isComplete: boolean;
  totalSelected: number;
  warnings: string[];
  counts: {
    GK: number;
    DEF: number;
    MID: number;
    FWD: number;
  };
}

export function validateSquad(
  assignments: Record<string, string | null>,
  players: Record<string, FantasyPlayer>
): SquadValidation {
  const playerIds = Object.values(assignments).filter(Boolean) as string[];
  const counts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };

  for (const id of playerIds) {
    const p = players[id];
    if (p) counts[p.position]++;
  }

  const warnings: string[] = [];
  const totalSelected = playerIds.length;

  if (totalSelected < 18) {
    warnings.push(`Squad incomplete — ${18 - totalSelected} slot${18 - totalSelected !== 1 ? "s" : ""} remaining.`);
  }

  const limits = { GK: 2, DEF: 6, MID: 5, FWD: 5 };
  for (const pos of ["GK", "DEF", "MID", "FWD"] as const) {
    const diff = limits[pos] - counts[pos];
    if (diff > 0) {
      warnings.push(`Select ${diff} more ${pos === "GK" ? "goalkeeper" : pos === "DEF" ? "defender" : pos === "MID" ? "midfielder" : "forward"}${diff > 1 ? "s" : ""}.`);
    }
    if (counts[pos] > limits[pos]) {
      warnings.push(`Too many ${pos} players selected.`);
    }
  }

  const startersFilled = Object.entries(assignments)
    .filter(([slotId]) => !slotId.startsWith("bench-"))
    .every(([, id]) => id !== null);

  if (!startersFilled && totalSelected > 0) {
    warnings.push("Fill all starting XI positions.");
  }

  return {
    isComplete: totalSelected === 18 && warnings.length === 0,
    totalSelected,
    warnings,
    counts,
  };
}

export function computeTeamStrength(players: Record<string, FantasyPlayer>, assignments: Record<string, string | null>) {
  const ids = Object.values(assignments).filter(Boolean) as string[];
  const squad = ids.map((id) => players[id]).filter(Boolean);
  const totalPoints = squad.reduce((s, p) => s + p.totalPoints, 0);
  const nations = new Set(squad.map((p) => p.nation));
  const diversity = Math.min(100, Math.round((nations.size / 8) * 100));
  const strength = Math.min(100, Math.round(totalPoints / 18));
  const projection = Math.round(totalPoints * 1.08);

  return { totalPoints, diversity, strength, projection };
}
