import { PrismaClient } from "@prisma/client";
import { DEFAULT_SCORING_RULES, DEFAULT_POWERS } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  await prisma.platformSettings.upsert({
    where: { id: "platform" },
    create: { id: "platform", ownerCreated: false },
    update: {},
  });

  for (const rule of DEFAULT_SCORING_RULES) {
    await prisma.scoringRule.upsert({
      where: { key: rule.key },
      create: rule,
      update: { name: rule.name, points: rule.points },
    });
  }

  for (const power of DEFAULT_POWERS) {
    await prisma.power.upsert({
      where: { key: power.key },
      create: power,
      update: { name: power.name, description: power.description },
    });
  }

  console.log("Seed completed: platform settings, scoring rules, and powers.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
