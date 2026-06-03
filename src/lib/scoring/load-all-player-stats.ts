import type { ProgressionStage } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { PlayerComputedStats } from "@/lib/scoring/compute-player-stats";
import {
  computePlayerPointsInMatch,
  opponentLabel,
  type FinishedMatchWithEvents,
} from "@/lib/scoring/compute-match-points";
import { matchNeedsParticipation } from "@/lib/scoring/match-participation";
import { totalProgressionPointsForStages } from "@/lib/scoring/progression";

function emptyStats(): PlayerComputedStats {
  return {
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    ownGoals: 0,
    motmAwards: 0,
    minutesPlayed: 0,
    totalPoints: 0,
    matchdayPoints: {},
    progressionPoints: 0,
    matchHistory: [],
  };
}

function addMatchdayPoints(
  stats: PlayerComputedStats,
  matchday: number,
  points: number,
  opponent: string
) {
  stats.totalPoints += points;
  stats.matchdayPoints[matchday] = (stats.matchdayPoints[matchday] ?? 0) + points;

  const existing = stats.matchHistory.find((h) => h.matchday === matchday);
  if (existing) {
    existing.points += points;
  } else {
    stats.matchHistory.push({ matchday, opponent, points });
  }
}

function applyEventCounts(stats: PlayerComputedStats, events: { eventType: string }[]) {
  for (const e of events) {
    const t = e.eventType.toUpperCase();
    if (t === "GOAL") stats.goals += 1;
    if (t === "ASSIST") stats.assists += 1;
    if (t === "YELLOW_CARD") stats.yellowCards += 1;
    if (t === "RED_CARD") stats.redCards += 1;
    if (t === "OWN_GOAL") stats.ownGoals += 1;
  }
}

/**
 * Recomputes all player stats from source data (matches, events, participation, progression).
 * Idempotent — safe to run after every Owner save.
 */
export async function loadAllPlayerStats(): Promise<Map<string, PlayerComputedStats>> {
  const [players, finishedMatches, progressions, allParticipants] = await Promise.all([
    prisma.player.findMany({
      select: {
        id: true,
        nationality: true,
        position: true,
        nationalTeamId: true,
      },
    }),
    prisma.match.findMany({
      where: {
        status: "FINISHED",
        homeScore: { not: null },
        awayScore: { not: null },
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        events: true,
      },
    }),
    prisma.nationProgression.findMany({
      select: { nationalTeamId: true, stage: true },
    }),
    prisma.matchParticipant.findMany({
      select: { matchId: true, playerId: true },
    }),
  ]);

  const participantsByMatch = new Map<string, Set<string>>();
  for (const row of allParticipants) {
    const set = participantsByMatch.get(row.matchId) ?? new Set<string>();
    set.add(row.playerId);
    participantsByMatch.set(row.matchId, set);
  }

  const progressionByNation = new Map<string, ProgressionStage[]>();
  for (const row of progressions) {
    const list = progressionByNation.get(row.nationalTeamId) ?? [];
    list.push(row.stage);
    progressionByNation.set(row.nationalTeamId, list);
  }

  const playersById = new Map(players.map((p) => [p.id, p]));
  const playersByNation = new Map<string, typeof players>();
  for (const p of players) {
    if (!p.nationalTeamId) continue;
    const list = playersByNation.get(p.nationalTeamId) ?? [];
    list.push(p);
    playersByNation.set(p.nationalTeamId, list);
  }

  const statsMap = new Map<string, PlayerComputedStats>();
  for (const p of players) {
    statsMap.set(p.id, emptyStats());
  }

  for (const match of finishedMatches as FinishedMatchWithEvents[]) {
    const md = match.matchday ?? 0;
    if (md <= 0) continue;

    const needsParticipation = matchNeedsParticipation(
      match.status,
      match.homeScore,
      match.awayScore
    );
    const participantSet = participantsByMatch.get(match.id) ?? new Set<string>();
    const playedPlayerIds = needsParticipation ? participantSet : null;

    const playerIdsToScore = new Set<string>();
    for (const nationId of [match.homeTeamId, match.awayTeamId]) {
      for (const p of playersByNation.get(nationId) ?? []) {
        playerIdsToScore.add(p.id);
      }
    }
    for (const e of match.events) {
      if (e.playerId) playerIdsToScore.add(e.playerId);
    }
    if (match.manOfTheMatchId) playerIdsToScore.add(match.manOfTheMatchId);

    for (const playerId of playerIdsToScore) {
      const player = playersById.get(playerId);
      if (!player?.nationalTeamId) continue;

      const pts = computePlayerPointsInMatch(
        player,
        match,
        match.manOfTheMatchId,
        playedPlayerIds
      );

      const playerEvents = match.events.filter((e) => e.playerId === playerId);
      const hasActivity =
        pts > 0 || playerEvents.length > 0 || match.manOfTheMatchId === playerId;
      if (!hasActivity) continue;

      const stats = statsMap.get(playerId)!;
      if (pts > 0) {
        addMatchdayPoints(stats, md, pts, opponentLabel(match, player.nationalTeamId));
      }
      applyEventCounts(stats, playerEvents);
      if (match.manOfTheMatchId === playerId) stats.motmAwards += 1;
    }
  }

  for (const player of players) {
    if (!player.nationalTeamId) continue;
    const stages = progressionByNation.get(player.nationalTeamId) ?? [];
    const bonus = totalProgressionPointsForStages(stages);
    if (bonus <= 0) continue;

    const stats = statsMap.get(player.id)!;
    stats.progressionPoints = bonus;
    stats.totalPoints += bonus;
  }

  for (const stats of statsMap.values()) {
    stats.matchHistory.sort((a, b) => a.matchday - b.matchday);
  }

  return statsMap;
}
