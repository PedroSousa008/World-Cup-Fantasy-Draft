import type { KnockoutRound, ProgressionStage } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { PROGRESSION_STAGE_ORDER } from "@/lib/scoring/progression";
import { KNOCKOUT_SLOTS } from "@/lib/tournament/knockout/topology";

const ROUND_TO_STAGE: Record<KnockoutRound, ProgressionStage> = {
  ROUND_OF_32: "LAST_32",
  ROUND_OF_16: "LAST_16",
  QUARTER_FINALS: "QUARTER_FINALS",
  SEMI_FINALS: "SEMI_FINALS",
  FINAL: "FINAL",
  CHAMPION: "WINNER",
};

const ROUND_RANK: Record<KnockoutRound, number> = {
  ROUND_OF_32: 0,
  ROUND_OF_16: 1,
  QUARTER_FINALS: 2,
  SEMI_FINALS: 3,
  FINAL: 4,
  CHAMPION: 5,
};

/**
 * Rebuild NationProgression from current bracket slots (idempotent).
 */
export async function syncProgressionFromBracket(): Promise<void> {
  const slots = await prisma.knockoutSlot.findMany({
    where: { nationalTeamId: { not: null } },
    select: { slotKey: true, nationalTeamId: true, round: true },
  });

  const slotRoundByKey = new Map(KNOCKOUT_SLOTS.map((s) => [s.key, s.round]));

  const nationMaxRound = new Map<string, number>();

  for (const row of slots) {
    if (!row.nationalTeamId) continue;
    const round = slotRoundByKey.get(row.slotKey) ?? row.round;
    const rank = ROUND_RANK[round];
    const prev = nationMaxRound.get(row.nationalTeamId) ?? -1;
    if (rank > prev) nationMaxRound.set(row.nationalTeamId, rank);
  }

  const nationStages = new Map<string, ProgressionStage[]>();
  for (const [nationId, maxRank] of nationMaxRound) {
    const stages: ProgressionStage[] = [];
    for (const stage of PROGRESSION_STAGE_ORDER) {
      const stageRound = Object.entries(ROUND_TO_STAGE).find(([, s]) => s === stage)?.[0] as
        | KnockoutRound
        | undefined;
      if (!stageRound) continue;
      if (ROUND_RANK[stageRound] <= maxRank) stages.push(stage);
    }
    nationStages.set(nationId, stages);
  }

  await prisma.nationProgression.deleteMany({});

  const rows: { nationalTeamId: string; stage: ProgressionStage }[] = [];
  for (const [nationalTeamId, stages] of nationStages) {
    for (const stage of stages) {
      rows.push({ nationalTeamId, stage });
    }
  }

  if (rows.length > 0) {
    await prisma.nationProgression.createMany({ data: rows, skipDuplicates: true });
  }
}
