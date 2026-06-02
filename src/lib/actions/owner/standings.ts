"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireOwnerSession } from "@/lib/actions/owner/helpers";
import type { OwnerActionResult } from "@/lib/actions/owner/helpers";

const overrideSchema = z.object({
  nationalTeamId: z.string().min(1),
  played: z.number().int().min(0).nullable().optional(),
  won: z.number().int().min(0).nullable().optional(),
  drawn: z.number().int().min(0).nullable().optional(),
  lost: z.number().int().min(0).nullable().optional(),
  goalsFor: z.number().int().min(0).nullable().optional(),
  goalsAgainst: z.number().int().min(0).nullable().optional(),
  points: z.number().int().min(0).nullable().optional(),
});

function revalidate() {
  revalidatePath("/owner/matches-events");
  revalidatePath("/owner/matches-events/events/group-stage");
  revalidatePath("/calendar");
  revalidatePath("/calendar/table");
  revalidatePath("/calendar/table/group-stage");
}

export async function saveGroupStandingOverrideAction(
  input: z.infer<typeof overrideSchema>
): Promise<OwnerActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Unauthorized." };

  const parsed = overrideSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid standing data." };

  const { nationalTeamId, ...stats } = parsed.data;
  const hasAny = Object.values(stats).some((v) => v != null);
  if (!hasAny) {
    await prisma.groupStandingOverride.deleteMany({ where: { nationalTeamId } });
    revalidate();
    return { ok: true };
  }

  await prisma.groupStandingOverride.upsert({
    where: { nationalTeamId },
    create: { nationalTeamId, ...stats },
    update: stats,
  });

  revalidate();
  return { ok: true };
}

export async function clearGroupStandingOverrideAction(
  nationalTeamId: string
): Promise<OwnerActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Unauthorized." };

  await prisma.groupStandingOverride.deleteMany({ where: { nationalTeamId } });
  revalidate();
  return { ok: true };
}
