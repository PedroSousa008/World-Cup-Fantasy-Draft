"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { seedWorldCupNations } from "@/lib/nations/seed-nations";
import { WORLD_CUP_NATION_BY_SLUG } from "@/lib/nations/world-cup-nations";
import type { OwnerActionResult } from "@/lib/actions/owner/helpers";
import { requireOwnerSession } from "@/lib/actions/owner/helpers";

export async function syncWorldCupNationsAction(): Promise<
  OwnerActionResult<{ created: number; updated: number }>
> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Owner access required." };

  const result = await seedWorldCupNations();
  revalidatePath("/owner/players");
  revalidatePath("/my-team/draft");
  return { ok: true, data: result };
}

export async function updateNationAction(input: {
  slug: string;
  isActive?: boolean;
  flagEmoji?: string;
}): Promise<OwnerActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Owner access required." };

  const catalog = WORLD_CUP_NATION_BY_SLUG.get(input.slug);
  if (!catalog) return { ok: false, error: "Unknown nation." };

  await prisma.nationalTeam.update({
    where: { slug: input.slug },
    data: {
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.flagEmoji !== undefined ? { flagEmoji: input.flagEmoji } : {}),
    },
  });

  revalidatePath("/owner/players");
  revalidatePath(`/owner/players/${input.slug}`);
  return { ok: true };
}
