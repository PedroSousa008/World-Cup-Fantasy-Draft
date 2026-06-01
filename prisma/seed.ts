import { PrismaClient } from "@prisma/client";
import { WORLD_CUP_NATIONS } from "../src/lib/nations/world-cup-nations";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding World Cup nations…");

  for (const nation of WORLD_CUP_NATIONS) {
    await prisma.nationalTeam.upsert({
      where: { slug: nation.slug },
      create: {
        name: nation.name,
        slug: nation.slug,
        code: nation.code,
        flagEmoji: nation.flagEmoji,
        imageDir: nation.imageDir,
        isActive: true,
      },
      update: {
        name: nation.name,
        code: nation.code,
        flagEmoji: nation.flagEmoji,
        imageDir: nation.imageDir,
        isActive: true,
      },
    });
  }

  const count = await prisma.nationalTeam.count();
  console.log(`Done. ${count} nations in database.`);
  console.log("No players seeded — add players nation by nation via Owner tools.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
