import type { Match, MatchEvent, NationalTeam, Player } from "@prisma/client";
import { goalPointsForMatch, pointsForKey, SCORING_KEYS } from "@/lib/scoring/position-rules";

export type FinishedMatchWithEvents = Match & {
  homeTeam: NationalTeam;
  awayTeam: NationalTeam;
  events: MatchEvent[];
};

function normalizeType(eventType: string): string {
  return eventType.trim().toUpperCase().replace(/\s+/g, "_");
}

function countEvents(events: MatchEvent[], playerId: string, type: string): number {
  const t = normalizeType(type);
  return events.filter(
    (e) => e.playerId === playerId && normalizeType(e.eventType) === t
  ).length;
}

function playerHasEvents(events: MatchEvent[], playerId: string): boolean {
  return events.some((e) => e.playerId === playerId);
}

/**
 * Points for one player in one finished match.
 * Win + clean sheet require participation selection when `playedPlayerIds` is provided.
 * Event points and MOTM always apply.
 */
export function computePlayerPointsInMatch(
  player: Pick<Player, "id" | "position" | "nationalTeamId">,
  match: FinishedMatchWithEvents,
  motmPlayerId: string | null,
  playedPlayerIds: Set<string> | null = null
): number {
  if (match.status !== "FINISHED" || match.homeScore == null || match.awayScore == null) {
    return 0;
  }
  if (!player.nationalTeamId) return 0;

  const isHome = player.nationalTeamId === match.homeTeamId;
  const isAway = player.nationalTeamId === match.awayTeamId;
  if (!isHome && !isAway) return 0;

  const goalsFor = isHome ? match.homeScore : match.awayScore;
  const goalsAgainst = isHome ? match.awayScore : match.homeScore;
  const position = player.position;

  const hasEvents = playerHasEvents(match.events, player.id);
  const isMotm = motmPlayerId === player.id;
  if (playedPlayerIds !== null && !playedPlayerIds.has(player.id) && !hasEvents && !isMotm) {
    return 0;
  }

  let pts = 0;

  const played =
    playedPlayerIds === null ? false : playedPlayerIds.has(player.id);

  if (goalsFor > goalsAgainst && played) {
    pts += pointsForKey(position, SCORING_KEYS.WIN);
  }

  if (goalsAgainst === 0 && played && (position === "GK" || position === "DEF")) {
    pts += pointsForKey(position, SCORING_KEYS.CLEAN_SHEET);
  }

  const goals = countEvents(match.events, player.id, SCORING_KEYS.GOAL);
  pts += goalPointsForMatch(position, goals);

  const assists = countEvents(match.events, player.id, SCORING_KEYS.ASSIST);
  pts += assists * pointsForKey(position, SCORING_KEYS.ASSIST);

  pts +=
    countEvents(match.events, player.id, SCORING_KEYS.YELLOW_CARD) *
    pointsForKey(position, SCORING_KEYS.YELLOW_CARD);
  pts +=
    countEvents(match.events, player.id, SCORING_KEYS.RED_CARD) *
    pointsForKey(position, SCORING_KEYS.RED_CARD);
  pts +=
    countEvents(match.events, player.id, SCORING_KEYS.OWN_GOAL) *
    pointsForKey(position, SCORING_KEYS.OWN_GOAL);
  pts +=
    countEvents(match.events, player.id, SCORING_KEYS.PENALTY_MISS) *
    pointsForKey(position, SCORING_KEYS.PENALTY_MISS);
  pts +=
    countEvents(match.events, player.id, SCORING_KEYS.PENALTY_SAVE) *
    pointsForKey(position, SCORING_KEYS.PENALTY_SAVE);

  if (isMotm) {
    pts += pointsForKey(position, SCORING_KEYS.MOTM);
  }

  return pts;
}

export function opponentLabel(
  match: FinishedMatchWithEvents,
  nationalTeamId: string
): string {
  if (nationalTeamId === match.homeTeamId) return match.awayTeam.name;
  if (nationalTeamId === match.awayTeamId) return match.homeTeam.name;
  return `${match.homeTeam.name} vs ${match.awayTeam.name}`;
}
