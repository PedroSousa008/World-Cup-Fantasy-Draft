import { prisma } from "@/lib/db/prisma";

const DEFAULT_POSITION_COUNT = 10;

export async function ensureRankingOutcomeRows(): Promise<void> {
  const count = await prisma.rankingOutcomeRow.count();
  if (count > 0) return;

  await prisma.rankingOutcomeRow.createMany({
    data: Array.from({ length: DEFAULT_POSITION_COUNT }, (_, i) => ({
      position: i + 1,
      text: "",
    })),
    skipDuplicates: true,
  });
}
