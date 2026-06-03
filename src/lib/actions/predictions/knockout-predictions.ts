"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  tryLockKnockoutPredictions,
  validateKnockoutWinner,
} from "@/lib/predictions/get-knockout-predictions-data";
import { getStrictDownstreamMatchKeys } from "@/lib/predictions/knockout-downstream";
import { getKnockoutUnlockState } from "@/lib/predictions/tournament-status";
import type { PredictionActionResult } from "@/lib/actions/predictions/group-predictions";

const saveWinnerSchema = z.object({
  matchKey: z.string().min(1),
  winnerNationalTeamId: z.string().min(1),
});

function revalidatePredictions() {
  revalidatePath("/predictions");
  revalidatePath("/predictions/tournament");
  revalidatePath("/predictions/tournament/knockout");
}

export async function saveKnockoutPredictionAction(
  input: z.infer<typeof saveWinnerSchema>
): Promise<PredictionActionResult & { locked?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in to save predictions." };

  const parsed = saveWinnerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid prediction." };

  const { matchKey, winnerNationalTeamId } = parsed.data;

  const [unlock, user] = await Promise.all([
    getKnockoutUnlockState(),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { knockoutPredictionsLocked: true },
    }),
  ]);

  if (!unlock.unlocked) {
    return { ok: false, error: "KO Stages unlock after the Group Stage is complete." };
  }

  if (user?.knockoutPredictionsLocked) {
    return { ok: false, error: "Your knockout prediction is locked." };
  }

  const valid = await validateKnockoutWinner(session.user.id, matchKey, winnerNationalTeamId);
  if (!valid) {
    return { ok: false, error: "Winner must be one of the teams in this match." };
  }

  const downstreamKeys = getStrictDownstreamMatchKeys(matchKey);

  await prisma.$transaction([
    ...downstreamKeys.map((key) =>
      prisma.userKnockoutPrediction.deleteMany({
        where: { userId: session.user.id, matchKey: key },
      })
    ),
    prisma.userKnockoutPrediction.upsert({
      where: {
        userId_matchKey: { userId: session.user.id, matchKey },
      },
      create: {
        userId: session.user.id,
        matchKey,
        winnerNationalTeamId,
      },
      update: { winnerNationalTeamId },
    }),
  ]);

  const locked = await tryLockKnockoutPredictions(session.user.id);
  revalidatePredictions();
  return { ok: true, locked };
}
