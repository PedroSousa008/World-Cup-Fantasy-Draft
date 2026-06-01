import type { Match, MatchEvent, NationalTeam, Player, ScoringRule } from "@prisma/client";
import { DEFAULT_SCORING_POINTS, SCORING_EVENT_TYPES } from "@/lib/scoring/constants";

export type MatchWithTeams = Match & {
  homeTeam: NationalTeam;
  awayTeam: NationalTeam;
};

export type MatchEventWithMatch = MatchEvent & {
  match: MatchWithTeams;
};

export interface PlayerComputedStats {
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  ownGoals: number;
  motmAwards: number;
  minutesPlayed: number;
  totalPoints: number;
  matchdayPoints: Record<number, number>;
  matchHistory: { matchday: number; opponent: string; points: number }[];
}

export function buildScoringMap(rules: ScoringRule[]): Map<string, number> {
  const map = new Map<string, number>(
    Object.entries(DEFAULT_SCORING_POINTS).map(([key, points]) => [key, points])
  );
  for (const rule of rules) {
    map.set(rule.ruleKey.toUpperCase(), rule.points);
  }
  return map;
}

function normalizeEventType(eventType: string): string {
  return eventType.trim().toUpperCase().replace(/\s+/g, "_");
}

function opponentForPlayer(
  match: MatchWithTeams,
  playerNationality: string
): string {
  if (match.homeTeam.name === playerNationality || match.homeTeam.code === playerNationality) {
    return match.awayTeam.name;
  }
  if (match.awayTeam.name === playerNationality || match.awayTeam.code === playerNationality) {
    return match.homeTeam.name;
  }
  return `${match.homeTeam.name} vs ${match.awayTeam.name}`;
}

function pointsForEvent(
  event: MatchEventWithMatch,
  scoring: Map<string, number>
): number {
  const type = normalizeEventType(event.eventType);

  if (type === SCORING_EVENT_TYPES.MINUTES_PLAYED) {
    const minutes = event.minute ?? 0;
    const per90 = scoring.get(SCORING_EVENT_TYPES.APPEARANCE) ?? 0;
    if (minutes <= 0) return 0;
    return (minutes / 90) * per90;
  }

  return scoring.get(type) ?? 0;
}

function incrementStat(stats: PlayerComputedStats, eventType: string, minute?: number | null) {
  const type = normalizeEventType(eventType);
  switch (type) {
    case SCORING_EVENT_TYPES.GOAL:
      stats.goals += 1;
      break;
    case SCORING_EVENT_TYPES.ASSIST:
      stats.assists += 1;
      break;
    case SCORING_EVENT_TYPES.YELLOW_CARD:
      stats.yellowCards += 1;
      break;
    case SCORING_EVENT_TYPES.RED_CARD:
      stats.redCards += 1;
      break;
    case SCORING_EVENT_TYPES.OWN_GOAL:
      stats.ownGoals += 1;
      break;
    case SCORING_EVENT_TYPES.MOTM:
      stats.motmAwards += 1;
      break;
    case SCORING_EVENT_TYPES.MINUTES_PLAYED:
      stats.minutesPlayed += minute ?? 0;
      break;
    default:
      break;
  }
}

export function computePlayerStats(
  player: Pick<Player, "id" | "nationality">,
  events: MatchEventWithMatch[],
  motmMatches: { id: string; matchday: number | null }[],
  scoring: Map<string, number>
): PlayerComputedStats {
  const stats: PlayerComputedStats = {
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    ownGoals: 0,
    motmAwards: 0,
    minutesPlayed: 0,
    totalPoints: 0,
    matchdayPoints: {},
    matchHistory: [],
  };

  const pointsByMatchday = new Map<number, number>();
  const opponentByMatchday = new Map<number, string>();
  const motmMatchIds = new Set(motmMatches.map((m) => m.id));

  for (const event of events) {
    if (event.playerId !== player.id) continue;

    const type = normalizeEventType(event.eventType);
    if (type === SCORING_EVENT_TYPES.MOTM && motmMatchIds.has(event.matchId)) continue;

    incrementStat(stats, event.eventType, event.minute);
    const pts = pointsForEvent(event, scoring);
    stats.totalPoints += pts;

    const matchday = event.match.matchday;
    if (matchday != null) {
      stats.matchdayPoints[matchday] = (stats.matchdayPoints[matchday] ?? 0) + pts;
      pointsByMatchday.set(matchday, (pointsByMatchday.get(matchday) ?? 0) + pts);
      if (!opponentByMatchday.has(matchday)) {
        opponentByMatchday.set(matchday, opponentForPlayer(event.match, player.nationality));
      }
    }
  }

  for (const motm of motmMatches) {
    stats.motmAwards += 1;
    const motmPts = scoring.get(SCORING_EVENT_TYPES.MOTM) ?? 0;
    stats.totalPoints += motmPts;
    if (motm.matchday != null) {
      stats.matchdayPoints[motm.matchday] =
        (stats.matchdayPoints[motm.matchday] ?? 0) + motmPts;
      pointsByMatchday.set(
        motm.matchday,
        (pointsByMatchday.get(motm.matchday) ?? 0) + motmPts
      );
    }
  }

  stats.matchHistory = Array.from(pointsByMatchday.entries())
    .map(([matchday, points]) => ({
      matchday,
      opponent: opponentByMatchday.get(matchday) ?? "—",
      points,
    }))
    .sort((a, b) => a.matchday - b.matchday);

  return stats;
}

export function getMatchdayPoints(stats: PlayerComputedStats, matchday: number): number {
  return stats.matchdayPoints[matchday] ?? 0;
}
