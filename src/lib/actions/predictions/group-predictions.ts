"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { GROUP_LETTERS } from "@/lib/tournament/groups-data";
import { getTournamentPredictionsData } from "@/lib/predictions/get-tournament-predictions-data";

export type PredictionActionResult =
  | { ok: true }
  | { ok: false; error: string };

const saveGroupSchema = z.object({
  groupName: z.string().min(1),
  firstPlaceId: z.string().min(1),
  secondPlaceId: z.string().min(1),
  thirdPlaceId: z.string().min(1),
  fourthPlaceId: z.string().min(1),
});

function revalidatePredictions() {
  revalidatePath("/predictions");
  revalidatePath("/predictions/tournament");
  revalidatePath("/predictions/tournament/knockout");
}

export async function saveGroupPredictionAction(
  input: z.infer<typeof saveGroupSchema>
): Promise<PredictionActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in to save predictions." };

  const parsed = saveGroupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid group prediction." };

  const { groupName, firstPlaceId, secondPlaceId, thirdPlaceId, fourthPlaceId } = parsed.data;

  if (!GROUP_LETTERS.includes(groupName as (typeof GROUP_LETTERS)[number])) {
    return { ok: false, error: "Invalid group." };
  }

  const ids = [firstPlaceId, secondPlaceId, thirdPlaceId, fourthPlaceId];
  if (new Set(ids).size !== 4) {
    return { ok: false, error: "Each team must have a unique position." };
  }

  const data = await getTournamentPredictionsData(session.user.id);
  const group = data.groups.find((g) => g.groupName === groupName);
  if (!group) return { ok: false, error: "Group not found." };

  const validIds = new Set(group.teams.map((t) => t.id));
  if (!ids.every((id) => validIds.has(id))) {
    return { ok: false, error: "Teams must belong to this group." };
  }

  await prisma.userGroupPrediction.upsert({
    where: {
      userId_groupName: { userId: session.user.id, groupName },
    },
    create: {
      userId: session.user.id,
      groupName,
      firstPlaceId,
      secondPlaceId,
      thirdPlaceId,
      fourthPlaceId,
    },
    update: {
      firstPlaceId,
      secondPlaceId,
      thirdPlaceId,
      fourthPlaceId,
    },
  });

  revalidatePredictions();
  return { ok: true };
}
