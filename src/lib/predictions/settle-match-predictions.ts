import { MatchStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { EXACT_SCORE_PREDICTION_POINTS } from "@/lib/predictions/matchday-deadlines";

/**
 * Recalculate exact-score points for all predictions on a match.
 * Idempotent — safe to call after every owner result save or reset.
 */
export async function settleMatchPredictions(matchId: string): Promise<void> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { status: true, homeScore: true, awayScore: true },
  });

  if (
    !match ||
    match.status !== MatchStatus.FINISHED ||
    match.homeScore == null ||
    match.awayScore == null
  ) {
    await prisma.userMatchPrediction.updateMany({
      where: { matchId },
      data: { pointsEarned: 0, isSettled: false },
    });
    return;
  }

  const predictions = await prisma.userMatchPrediction.findMany({
    where: { matchId },
    select: {
      id: true,
      predictedHomeGoals: true,
      predictedAwayGoals: true,
    },
  });

  await prisma.$transaction(
    predictions.map((prediction) => {
      const exact =
        prediction.predictedHomeGoals === match.homeScore &&
        prediction.predictedAwayGoals === match.awayScore;

      return prisma.userMatchPrediction.update({
        where: { id: prediction.id },
        data: {
          pointsEarned: exact ? EXACT_SCORE_PREDICTION_POINTS : 0,
          isSettled: true,
        },
      });
    })
  );
}

export async function getUserMatchPredictionPoints(userId: string): Promise<number> {
  const result = await prisma.userMatchPrediction.aggregate({
    where: { userId },
    _sum: { pointsEarned: true },
  });
  return result._sum.pointsEarned ?? 0;
}

export async function getMatchPredictionPointsByUser(): Promise<Map<string, number>> {
  const rows = await prisma.userMatchPrediction.groupBy({
    by: ["userId"],
    _sum: { pointsEarned: true },
  });

  return new Map(rows.map((row) => [row.userId, row._sum.pointsEarned ?? 0]));
}
