import { TeamStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { WORLD_CUP_NATIONS, WORLD_CUP_NATION_SLUGS } from "@/lib/nations/world-cup-nations";
import { removeNationFromDatabase } from "@/lib/nations/remove-nation";

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

  const orphans = await prisma.nationalTeam.findMany({
    where: { slug: { notIn: [...WORLD_CUP_NATION_SLUGS] } },
    select: { slug: true },
  });

  for (const orphan of orphans) {
    await removeNationFromDatabase(orphan.slug);
  }

  return { created, updated };
}
