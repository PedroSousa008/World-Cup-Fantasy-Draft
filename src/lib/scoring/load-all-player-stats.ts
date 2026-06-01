import { prisma } from "@/lib/db/prisma";
import {
  buildScoringMap,
  computePlayerStats,
  type MatchEventWithMatch,
  type PlayerComputedStats,
} from "@/lib/scoring/compute-player-stats";

export async function loadAllPlayerStats(): Promise<Map<string, PlayerComputedStats>> {
  const [players, events, scoringRules, motmMatches] = await Promise.all([
    prisma.player.findMany({ select: { id: true, nationality: true } }),
    prisma.matchEvent.findMany({
      where: { playerId: { not: null } },
      include: { match: { include: { homeTeam: true, awayTeam: true } } },
    }),
    prisma.scoringRule.findMany({ where: { isActive: true } }),
    prisma.match.findMany({
      where: { manOfTheMatchId: { not: null } },
      select: { id: true, matchday: true, manOfTheMatchId: true },
    }),
  ]);

  const scoring = buildScoringMap(scoringRules);

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
    statsMap.set(
      player.id,
      computePlayerStats(
        player,
        eventsByPlayer.get(player.id) ?? [],
        motmByPlayer.get(player.id) ?? [],
        scoring
      )
    );
  }

  return statsMap;
}
