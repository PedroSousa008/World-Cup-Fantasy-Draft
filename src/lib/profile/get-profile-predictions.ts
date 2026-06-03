import { prisma } from "@/lib/db/prisma";
import type { ProfilePredictionsPayload } from "@/lib/profile/types";

export async function getProfilePredictionsData(
  userId: string
): Promise<ProfilePredictionsPayload> {
  const [settled, correct, betsPlaced] = await Promise.all([
    prisma.userMatchPrediction.count({
      where: { userId, isSettled: true },
    }),
    prisma.userMatchPrediction.count({
      where: { userId, isSettled: true, pointsEarned: { gt: 0 } },
    }),
    prisma.matchBetVote.count({ where: { userId } }),
  ]);

  const predictionAccuracyPercent =
    settled > 0 ? Math.round((correct / settled) * 100) : null;

  return {
    correctPredictions: correct,
    settledPredictions: settled,
    predictionAccuracyPercent,
    betsPlaced,
  };
}
