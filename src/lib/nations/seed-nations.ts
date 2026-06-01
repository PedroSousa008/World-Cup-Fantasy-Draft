import { TeamStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { WORLD_CUP_NATIONS } from "@/lib/nations/world-cup-nations";

/** Upsert all participating World Cup nations (no players). */
export async function seedWorldCupNations(): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;

  for (const nation of WORLD_CUP_NATIONS) {
    const existing = await prisma.nationalTeam.findUnique({
      where: { slug: nation.slug },
    });

    await prisma.nationalTeam.upsert({
      where: { slug: nation.slug },
      create: {
        name: nation.name,
        slug: nation.slug,
        code: nation.code,
        flagEmoji: nation.flagEmoji,
        imageDir: nation.imageDir,
        isActive: true,
        status: TeamStatus.ACTIVE,
      },
      update: {
        name: nation.name,
        code: nation.code,
        flagEmoji: nation.flagEmoji,
        imageDir: nation.imageDir,
        isActive: true,
        status: TeamStatus.ACTIVE,
      },
    });

    if (existing) updated++;
    else created++;
  }

  return { created, updated };
}
