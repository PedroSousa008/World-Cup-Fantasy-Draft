"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { isMatchPredictionLocked } from "@/lib/predictions/matchday-deadlines";
import { getMatchPredictionFormData } from "@/lib/predictions/get-match-predictions-data";
import { settleMatchPredictions } from "@/lib/predictions/settle-match-predictions";
import type { PredictionActionResult } from "@/lib/actions/predictions/group-predictions";

const saveMatchPredictionSchema = z.object({
  matchId: z.string().min(1),
  predictedHomeGoals: z.number().int().min(0).max(20),
  predictedAwayGoals: z.number().int().min(0).max(20),
  firstGoalscorerId: z.string().nullable().optional(),
  mvpPlayerId: z.string().nullable().optional(),
});

function revalidateMatchPredictions() {
  revalidatePath("/predictions");
  revalidatePath("/predictions/matches");
  revalidatePath("/my-team");
  revalidatePath("/my-team/rankings");
  revalidatePath("/profile");
}

export async function getMatchPredictionFormAction(matchId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;
  return getMatchPredictionFormData(session.user.id, matchId);
}

export async function saveMatchPredictionAction(
  input: z.infer<typeof saveMatchPredictionSchema>
): Promise<PredictionActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in to save predictions." };

  const parsed = saveMatchPredictionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid prediction." };

  const { matchId, predictedHomeGoals, predictedAwayGoals, firstGoalscorerId, mvpPlayerId } =
    parsed.data;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      matchday: true,
      scheduledAt: true,
      homeTeamId: true,
      awayTeamId: true,
      status: true,
      homeScore: true,
      awayScore: true,
    },
  });

  if (!match || match.matchday == null) {
    return { ok: false, error: "Match not found." };
  }

  if (isMatchPredictionLocked(match.matchday, match.scheduledAt)) {
    return { ok: false, error: "Predictions for this matchday are locked." };
  }

  const teamIds = new Set([match.homeTeamId, match.awayTeamId]);

  if (firstGoalscorerId) {
    const player = await prisma.player.findUnique({
      where: { id: firstGoalscorerId },
      select: { nationalTeamId: true },
    });
    if (!player?.nationalTeamId || !teamIds.has(player.nationalTeamId)) {
      return { ok: false, error: "First goalscorer must play for one of the match teams." };
    }
  }

  if (mvpPlayerId) {
    const player = await prisma.player.findUnique({
      where: { id: mvpPlayerId },
      select: { nationalTeamId: true },
    });
    if (!player?.nationalTeamId || !teamIds.has(player.nationalTeamId)) {
      return { ok: false, error: "MVP must play for one of the match teams." };
    }
  }

  await prisma.userMatchPrediction.upsert({
    where: {
      userId_matchId: { userId: session.user.id, matchId },
    },
    create: {
      userId: session.user.id,
      matchId,
      matchday: match.matchday,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      predictedHomeGoals,
      predictedAwayGoals,
      firstGoalscorerId: firstGoalscorerId ?? null,
      mvpPlayerId: mvpPlayerId ?? null,
    },
    update: {
      predictedHomeGoals,
      predictedAwayGoals,
      firstGoalscorerId: firstGoalscorerId ?? null,
      mvpPlayerId: mvpPlayerId ?? null,
    },
  });

  if (
    match.status === "FINISHED" &&
    match.homeScore != null &&
    match.awayScore != null
  ) {
    await settleMatchPredictions(matchId);
  }

  revalidateMatchPredictions();
  return { ok: true };
}
