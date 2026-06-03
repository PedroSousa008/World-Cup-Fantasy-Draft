import { prisma } from "@/lib/db/prisma";
import { getMatchesByMatchday } from "@/lib/tournament/get-tournament-data";
import type { TournamentMatchCard } from "@/lib/tournament/types";
import {
  formatMatchdayDeadline,
  isMatchPredictionLocked,
  isMatchdayPredictionsLocked,
} from "@/lib/predictions/matchday-deadlines";

export interface MatchPredictionSummary {
  predictedHomeGoals: number;
  predictedAwayGoals: number;
  firstGoalscorerId: string | null;
  firstGoalscorerName: string | null;
  mvpPlayerId: string | null;
  mvpPlayerName: string | null;
  pointsEarned: number;
  isSettled: boolean;
}

export interface MatchWithPrediction extends TournamentMatchCard {
  prediction: MatchPredictionSummary | null;
  predictionLocked: boolean;
}

export interface PredictionMatchdayGroup {
  matchday: number;
  kickoffAt: string | null;
  isLocked: boolean;
  predictionsLocked: boolean;
  deadlineLabel: string | null;
  matches: MatchWithPrediction[];
}

export interface MatchPredictionsPageData {
  matchdayGroups: PredictionMatchdayGroup[];
}

export async function getMatchPredictionsPageData(
  userId: string
): Promise<MatchPredictionsPageData> {
  const [matchdayGroups, predictions] = await Promise.all([
    getMatchesByMatchday(),
    prisma.userMatchPrediction.findMany({
      where: { userId },
      include: {
        match: {
          select: {
            id: true,
            homeTeamId: true,
            awayTeamId: true,
          },
        },
      },
    }),
  ]);

  const playerIds = new Set<string>();
  for (const p of predictions) {
    if (p.firstGoalscorerId) playerIds.add(p.firstGoalscorerId);
    if (p.mvpPlayerId) playerIds.add(p.mvpPlayerId);
  }

  const players =
    playerIds.size > 0
      ? await prisma.player.findMany({
          where: { id: { in: [...playerIds] } },
          select: { id: true, name: true },
        })
      : [];
  const playerNames = new Map(players.map((p) => [p.id, p.name]));

  const predictionByMatch = new Map(
    predictions.map((p) => [
      p.matchId,
      {
        predictedHomeGoals: p.predictedHomeGoals,
        predictedAwayGoals: p.predictedAwayGoals,
        firstGoalscorerId: p.firstGoalscorerId,
        firstGoalscorerName: p.firstGoalscorerId
          ? (playerNames.get(p.firstGoalscorerId) ?? null)
          : null,
        mvpPlayerId: p.mvpPlayerId,
        mvpPlayerName: p.mvpPlayerId ? (playerNames.get(p.mvpPlayerId) ?? null) : null,
        pointsEarned: p.pointsEarned,
        isSettled: p.isSettled,
      } satisfies MatchPredictionSummary,
    ])
  );

  const enrichedGroups: PredictionMatchdayGroup[] = matchdayGroups.map((group) => {
    const predictionsLocked = isMatchdayPredictionsLocked(group.matchday);
    const deadlineLabel = formatMatchdayDeadline(group.matchday);

    return {
      matchday: group.matchday,
      kickoffAt: group.kickoffAt,
      isLocked: group.isLocked,
      predictionsLocked,
      deadlineLabel,
      matches: group.matches.map((match) => ({
        ...match,
        prediction: predictionByMatch.get(match.id) ?? null,
        predictionLocked:
          predictionsLocked || isMatchPredictionLocked(group.matchday, match.scheduledAt),
      })),
    };
  });

  return { matchdayGroups: enrichedGroups };
}

export interface MatchPredictionPlayer {
  id: string;
  name: string;
  position: string;
  nationName: string;
  flagEmoji: string | null;
}

export interface MatchPredictionFormData {
  match: TournamentMatchCard;
  deadlineLabel: string | null;
  locked: boolean;
  existing: MatchPredictionSummary | null;
  homePlayers: MatchPredictionPlayer[];
  awayPlayers: MatchPredictionPlayer[];
}

export async function getMatchPredictionFormData(
  userId: string,
  matchId: string
): Promise<MatchPredictionFormData | null> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { homeTeam: true, awayTeam: true },
  });
  if (!match || match.matchday == null) return null;

  const matchCard: TournamentMatchCard = {
    id: match.id,
    matchday: match.matchday,
    groupName: match.groupName,
    scheduledAt: match.scheduledAt.toISOString(),
    status: match.status,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    bettingOpen: match.bettingOpen,
    manOfTheMatchId: match.manOfTheMatchId,
    homeTeam: {
      id: match.homeTeam.id,
      name: match.homeTeam.name,
      slug: match.homeTeam.slug,
      flagEmoji: match.homeTeam.flagEmoji,
      groupName: match.homeTeam.groupName,
    },
    awayTeam: {
      id: match.awayTeam.id,
      name: match.awayTeam.name,
      slug: match.awayTeam.slug,
      flagEmoji: match.awayTeam.flagEmoji,
      groupName: match.awayTeam.groupName,
    },
  };

  const [players, existing] = await Promise.all([
    prisma.player.findMany({
      where: {
        nationalTeamId: { in: [match.homeTeamId, match.awayTeamId] },
      },
      include: { nationalTeam: { select: { name: true, flagEmoji: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.userMatchPrediction.findUnique({
      where: { userId_matchId: { userId, matchId } },
    }),
  ]);

  const mapPlayer = (p: (typeof players)[number]): MatchPredictionPlayer => ({
    id: p.id,
    name: p.name,
    position: p.position,
    nationName: p.nationalTeam?.name ?? p.nationality,
    flagEmoji: p.nationalTeam?.flagEmoji ?? null,
  });

  const playerNameById = new Map(players.map((p) => [p.id, p.name]));

  const locked = isMatchPredictionLocked(match.matchday, match.scheduledAt);

  return {
    match: matchCard,
    deadlineLabel: formatMatchdayDeadline(match.matchday),
    locked,
    existing: existing
      ? {
          predictedHomeGoals: existing.predictedHomeGoals,
          predictedAwayGoals: existing.predictedAwayGoals,
          firstGoalscorerId: existing.firstGoalscorerId,
          firstGoalscorerName: existing.firstGoalscorerId
            ? (playerNameById.get(existing.firstGoalscorerId) ?? null)
            : null,
          mvpPlayerId: existing.mvpPlayerId,
          mvpPlayerName: existing.mvpPlayerId
            ? (playerNameById.get(existing.mvpPlayerId) ?? null)
            : null,
          pointsEarned: existing.pointsEarned,
          isSettled: existing.isSettled,
        }
      : null,
    homePlayers: players
      .filter((p) => p.nationalTeamId === match.homeTeamId)
      .map(mapPlayer),
    awayPlayers: players
      .filter((p) => p.nationalTeamId === match.awayTeamId)
      .map(mapPlayer),
  };
}
