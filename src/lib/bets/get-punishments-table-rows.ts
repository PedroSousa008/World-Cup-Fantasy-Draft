import { prisma } from "@/lib/db/prisma";
import type { RankingOutcomeRowDto } from "@/lib/bets/types";

let defaultRowsEnsured = false;

/** One-time ensure default rows exist (in-memory guard avoids repeated counts). */
export async function ensureDefaultRowsOnce(): Promise<void> {
  if (defaultRowsEnsured) return;
  const count = await prisma.rankingOutcomeRow.count();
  if (count === 0) {
    await prisma.rankingOutcomeRow.createMany({
      data: Array.from({ length: 10 }, (_, i) => ({
        position: i + 1,
        text: "",
      })),
      skipDuplicates: true,
    });
  }
  defaultRowsEnsured = true;
}

/** Fast read — table rows only, no scoring scan. */
export async function getPunishmentsTableRows(): Promise<RankingOutcomeRowDto[]> {
  await ensureDefaultRowsOnce();
  const rows = await prisma.rankingOutcomeRow.findMany({
    orderBy: { position: "asc" },
    select: { position: true, text: true },
  });
  return rows;
}
