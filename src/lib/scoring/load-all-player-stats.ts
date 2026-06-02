import { prisma } from "@/lib/db/prisma";
import { buildCleanSheetBonuses } from "@/lib/scoring/clean-sheets";
import {
  buildScoringMap,
  computePlayerStats,
  pointsForRuleKey,
  type MatchEventWithMatch,
  type PlayerComputedStats,
} from "@/lib/scoring/compute-player-stats";
import { SCORING_EVENT_TYPES } from "@/lib/scoring/constants";

export async function loadAllPlayerStats(): Promise<Map<string, PlayerComputedStats>> {
  const [players, events, scoringRules, motmMatches, finishedMatches] = await Promise.all([
    prisma.player.findMany({
      select: { id: true, nationality: true, position: true, nationalTeamId: true },
    }),
    prisma.matchEvent.findMany({
      where: { playerId: { not: null } },
      include: { match: { include: { homeTeam: true, awayTeam: true } } },
    }),
    prisma.scoringRule.findMany({ where: { isActive: true } }),
    prisma.match.findMany({
      where: { manOfTheMatchId: { not: null } },
      select: { id: true, matchday: true, manOfTheMatchId: true },
    }),
    prisma.match.findMany({
      where: { status: "FINISHED", homeScore: { not: null }, awayScore: { not: null } },
      include: { homeTeam: true, awayTeam: true },
    }),
  ]);

  const scoring = buildScoringMap(scoringRules);
  const csPoints = pointsForRuleKey(scoring, SCORING_EVENT_TYPES.CLEAN_SHEET, "GK");
  const cleanSheetBonuses = buildCleanSheetBonuses(finishedMatches, players, csPoints);

  const eventsByPlayer = new Map<string, MatchEventWithMatch[]>();
  for (const event of events) {
    if (!event.playerId) continue;
    const list = eventsByPlayer.get(event.playerId) ?? [];
    list.push(event as MatchEventWithMatch);
    eventsByPlayer.set(event.playerId, list);
  }

  const motmByPlayer = new Map<string, { id: string; matchday: number | null }[]>();
  for (const match of motmMatches) {
    if (!match.manOfTheMatchId) continue;
    const list = motmByPlayer.get(match.manOfTheMatchId) ?? [];
    list.push({ id: match.id, matchday: match.matchday });
    motmByPlayer.set(match.manOfTheMatchId, list);
  }

  const statsMap = new Map<string, PlayerComputedStats>();
  for (const player of players) {
    const csByMd = new Map<number, number>();
    for (const entry of cleanSheetBonuses.get(player.id) ?? []) {
      csByMd.set(entry.matchday, (csByMd.get(entry.matchday) ?? 0) + entry.points);
    }
    statsMap.set(
      player.id,
      computePlayerStats(
        player,
        eventsByPlayer.get(player.id) ?? [],
        motmByPlayer.get(player.id) ?? [],
        scoring,
        csByMd
      )
    );
  }

  return statsMap;
}
