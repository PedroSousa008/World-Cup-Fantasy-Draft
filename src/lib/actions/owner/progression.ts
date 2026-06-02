"use server";

import { revalidatePath } from "next/cache";
import type { ProgressionStage } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireOwnerSession } from "@/lib/actions/owner/helpers";
import type { OwnerActionResult } from "@/lib/actions/owner/helpers";
import { PROGRESSION_STAGE_ORDER } from "@/lib/scoring/progression";

function revalidateAll() {
  revalidatePath("/owner/matches-events");
  revalidatePath("/calendar");
  revalidatePath("/my-team");
}

export async function confirmNationProgressionAction(
  nationalTeamId: string,
  stage: ProgressionStage
): Promise<OwnerActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Unauthorized." };

  const team = await prisma.nationalTeam.findUnique({ where: { id: nationalTeamId } });
  if (!team) return { ok: false, error: "Nation not found." };

  const existing = await prisma.nationProgression.findMany({
    where: { nationalTeamId },
    select: { stage: true },
  });
  const confirmed = new Set(existing.map((e) => e.stage));
  const stageIndex = PROGRESSION_STAGE_ORDER.indexOf(stage);

  for (let i = 0; i < stageIndex; i++) {
    const required = PROGRESSION_STAGE_ORDER[i];
    if (!confirmed.has(required)) {
      return {
        ok: false,
        error: `Confirm ${required.replace(/_/g, " ")} before this stage.`,
      };
    }
  }

  await prisma.nationProgression.upsert({
    where: {
      nationalTeamId_stage: { nationalTeamId, stage },
    },
    create: { nationalTeamId, stage },
    update: {},
  });

  revalidateAll();
  return { ok: true };
}

export async function removeNationProgressionAction(
  nationalTeamId: string,
  stage: ProgressionStage
): Promise<OwnerActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Unauthorized." };

  await prisma.nationProgression.deleteMany({
    where: { nationalTeamId, stage },
  });

  revalidateAll();
  return { ok: true };
}

export async function getProgressionData() {
  const [nations, progressions] = await Promise.all([
    prisma.nationalTeam.findMany({
      where: { groupName: { not: null } },
      orderBy: [{ groupName: "asc" }, { name: "asc" }],
    }),
    prisma.nationProgression.findMany(),
  ]);

  const byNation = new Map<string, ProgressionStage[]>();
  for (const p of progressions) {
    const list = byNation.get(p.nationalTeamId) ?? [];
    list.push(p.stage);
    byNation.set(p.nationalTeamId, list);
  }

  return nations.map((n) => ({
    id: n.id,
    name: n.name,
    flagEmoji: n.flagEmoji,
    groupName: n.groupName,
    stages: byNation.get(n.id) ?? [],
  }));
}
