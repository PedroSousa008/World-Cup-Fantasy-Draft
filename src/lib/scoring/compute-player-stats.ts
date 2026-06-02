import type {
  Match,
  MatchEvent,
  NationalTeam,
  Player,
  PlayerPosition,
  ScoringRule,
} from "@prisma/client";
import {
  DEFAULT_POSITION_SCORING,
  DEFAULT_SCORING_POINTS,
  SCORING_EVENT_TYPES,
} from "@/lib/scoring/constants";

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

export interface ScoringMaps {
  default: Map<string, number>;
  byPosition: Map<PlayerPosition, Map<string, number>>;
}

export function buildScoringMap(rules: ScoringRule[]): ScoringMaps {
  const defaultMap = new Map<string, number>(
    Object.entries(DEFAULT_SCORING_POINTS).map(([key, points]) => [key, points])
  );
  const byPosition = new Map<PlayerPosition, Map<string, number>>();

  for (const pos of ["GK", "DEF", "MID", "FWD"] as PlayerPosition[]) {
    const posMap = new Map(defaultMap);
    const overrides = DEFAULT_POSITION_SCORING[pos];
    if (overrides) {
      for (const [key, points] of Object.entries(overrides)) {
        posMap.set(key, points);
      }
    }
    byPosition.set(pos, posMap);
  }

  for (const rule of rules) {
    const key = rule.ruleKey.toUpperCase();
    if (rule.position) {
      const posMap = byPosition.get(rule.position) ?? new Map(defaultMap);
      posMap.set(key, rule.points);
      byPosition.set(rule.position, posMap);
    } else {
      defaultMap.set(key, rule.points);
      for (const [pos, posMap] of byPosition) {
        const posOverrides = DEFAULT_POSITION_SCORING[pos];
        if (!posOverrides || !(key in posOverrides)) {
          posMap.set(key, rule.points);
        }
        byPosition.set(pos, posMap);
      }
    }
  }

  return { default: defaultMap, byPosition };
}

export function pointsForRuleKey(
  scoring: ScoringMaps,
  ruleKey: string,
  position?: PlayerPosition
): number {
  const key = ruleKey.toUpperCase();
  if (position) {
    const posMap = scoring.byPosition.get(position);
    if (posMap?.has(key)) return posMap.get(key)!;
  }
  return scoring.default.get(key) ?? 0;
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
  scoring: ScoringMaps,
  position?: PlayerPosition
): number {
  const type = normalizeEventType(event.eventType);

  if (type === SCORING_EVENT_TYPES.MINUTES_PLAYED) {
    const minutes = event.minute ?? 0;
    const per90 = pointsForRuleKey(scoring, SCORING_EVENT_TYPES.APPEARANCE, position);
    if (minutes <= 0) return 0;
    return (minutes / 90) * per90;
  }

  return pointsForRuleKey(scoring, type, position);
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
    case SCORING_EVENT_TYPES.PENALTY_MISS:
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
  player: Pick<Player, "id" | "nationality" | "position">,
  events: MatchEventWithMatch[],
  motmMatches: { id: string; matchday: number | null }[],
  scoring: ScoringMaps,
  cleanSheetBonusByMatchday?: Map<number, number>
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
    const pts = pointsForEvent(event, scoring, player.position);
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

  if (cleanSheetBonusByMatchday) {
    for (const [matchday, pts] of cleanSheetBonusByMatchday) {
      stats.totalPoints += pts;
      stats.matchdayPoints[matchday] = (stats.matchdayPoints[matchday] ?? 0) + pts;
      pointsByMatchday.set(matchday, (pointsByMatchday.get(matchday) ?? 0) + pts);
    }
  }

  for (const motm of motmMatches) {
    stats.motmAwards += 1;
    const motmPts = pointsForRuleKey(scoring, SCORING_EVENT_TYPES.MOTM, player.position);
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
