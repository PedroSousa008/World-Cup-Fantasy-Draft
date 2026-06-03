import { prisma } from "@/lib/db/prisma";
import { getKnockoutBracketData, type KnockoutBracketData } from "@/lib/tournament/knockout/bracket-service";
import { applyWinnerSelection } from "@/lib/tournament/knockout/bracket-client-mutate";
import { KNOCKOUT_MATCHES } from "@/lib/tournament/knockout/topology";
import { getKnockoutUnlockState } from "@/lib/predictions/tournament-status";

export interface KnockoutPredictionsData {
  bracket: KnockoutBracketData;
  locked: boolean;
  unlocked: boolean;
  predictedCount: number;
  totalMatches: number;
  isComplete: boolean;
}

function buildPredictionBracket(
  ownerData: KnockoutBracketData,
  userWinners: Map<string, string>
): KnockoutBracketData {
  let data = { ...ownerData, matches: [...ownerData.matches] };

  for (const def of KNOCKOUT_MATCHES) {
    const winnerId = userWinners.get(def.key);
    if (!winnerId) continue;
    data = applyWinnerSelection(data, def.key, winnerId);
  }

  return data;
}

export async function getKnockoutPredictionsData(
  userId: string
): Promise<KnockoutPredictionsData> {
  const [ownerData, predictions, unlock, user] = await Promise.all([
    getKnockoutBracketData(),
    prisma.userKnockoutPrediction.findMany({ where: { userId } }),
    getKnockoutUnlockState(),
    prisma.user.findUnique({
      where: { id: userId },
      select: { knockoutPredictionsLocked: true },
    }),
  ]);

  const userWinners = new Map(predictions.map((p) => [p.matchKey, p.winnerNationalTeamId]));
  const bracket = buildPredictionBracket(ownerData, userWinners);

  const totalMatches = KNOCKOUT_MATCHES.length;
  const predictedCount = predictions.length;
  const locked = user?.knockoutPredictionsLocked ?? false;

  return {
    bracket,
    locked,
    unlocked: unlock.unlocked,
    predictedCount,
    totalMatches,
    isComplete: predictedCount >= totalMatches && bracket.matches.every((m) => m.winnerId),
  };
}

export async function tryLockKnockoutPredictions(userId: string): Promise<boolean> {
  const predictions = await prisma.userKnockoutPrediction.findMany({
    where: { userId },
    select: { matchKey: true },
  });

  if (predictions.length < KNOCKOUT_MATCHES.length) return false;

  const ownerData = await getKnockoutBracketData();
  const userWinners = new Map(
    (
      await prisma.userKnockoutPrediction.findMany({
        where: { userId },
        select: { matchKey: true, winnerNationalTeamId: true },
      })
    ).map((p) => [p.matchKey, p.winnerNationalTeamId])
  );

  const bracket = buildPredictionBracket(ownerData, userWinners);
  const allComplete = bracket.matches.every((m) => m.winnerId);

  if (!allComplete) return false;

  await prisma.user.update({
    where: { id: userId },
    data: {
      knockoutPredictionsLocked: true,
      knockoutPredictionsLockedAt: new Date(),
    },
  });

  return true;
}

/** Validate winner is one of the two teams in the match (derived from owner R32 + prior picks). */
export async function validateKnockoutWinner(
  userId: string,
  matchKey: string,
  winnerNationalTeamId: string
): Promise<boolean> {
  const data = await getKnockoutPredictionsData(userId);
  const match = data.bracket.matches.find((m) => m.matchKey === matchKey);
  if (!match?.homeTeamId || !match?.awayTeamId) return false;
  return winnerNationalTeamId === match.homeTeamId || winnerNationalTeamId === match.awayTeamId;
}

export { KNOCKOUT_MATCHES };
