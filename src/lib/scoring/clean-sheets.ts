import type { Match, NationalTeam, Player, PlayerPosition } from "@prisma/client";
import { SCORING_EVENT_TYPES } from "@/lib/scoring/constants";

type FinishedMatch = Match & {
  homeTeam: NationalTeam;
  awayTeam: NationalTeam;
};

const CLEAN_SHEET_POSITIONS: PlayerPosition[] = ["GK", "DEF"];

/** Players who kept a clean sheet in a finished match (GK/DEF only, team conceded 0). */
export function getCleanSheetPlayerIds(
  match: FinishedMatch,
  players: Pick<Player, "id" | "nationalTeamId" | "position">[]
): string[] {
  if (match.status !== "FINISHED" || match.homeScore == null || match.awayScore == null) {
    return [];
  }

  const cleanTeamIds: string[] = [];
  if (match.awayScore === 0) cleanTeamIds.push(match.homeTeamId);
  if (match.homeScore === 0) cleanTeamIds.push(match.awayTeamId);

  return players
    .filter(
      (p) =>
        p.nationalTeamId &&
        cleanTeamIds.includes(p.nationalTeamId) &&
        CLEAN_SHEET_POSITIONS.includes(p.position)
    )
    .map((p) => p.id);
}

export function cleanSheetPointsForPlayer(
  playerId: string,
  matchday: number | null,
  cleanSheetBonuses: Map<string, { matchday: number; points: number }[]>
): number {
  const entries = cleanSheetBonuses.get(playerId) ?? [];
  if (matchday == null) return entries.reduce((s, e) => s + e.points, 0);
  return entries.filter((e) => e.matchday === matchday).reduce((s, e) => s + e.points, 0);
}

export function buildCleanSheetBonuses(
  finishedMatches: FinishedMatch[],
  players: Pick<Player, "id" | "nationalTeamId" | "position">[],
  pointsPerCleanSheet: number
): Map<string, { matchday: number; points: number }[]> {
  const map = new Map<string, { matchday: number; points: number }[]>();

  for (const match of finishedMatches) {
    const ids = getCleanSheetPlayerIds(match, players);
    const md = match.matchday ?? 0;
    for (const id of ids) {
      const list = map.get(id) ?? [];
      list.push({ matchday: md, points: pointsPerCleanSheet });
      map.set(id, list);
    }
  }

  return map;
}

export const CLEAN_SHEET_RULE_KEY = SCORING_EVENT_TYPES.CLEAN_SHEET;
