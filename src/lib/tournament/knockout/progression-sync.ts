import type { KnockoutRound, ProgressionStage } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { PROGRESSION_STAGE_ORDER } from "@/lib/scoring/progression";
import { isR32Match } from "@/lib/tournament/knockout/topology";
import type { DerivedMatchState } from "@/lib/tournament/knockout/derive-bracket-state";

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

function bumpMax(nationMaxRound: Map<string, number>, nationId: string, rank: number) {
  const prev = nationMaxRound.get(nationId) ?? -1;
  if (rank > prev) nationMaxRound.set(nationId, rank);
}

/**
 * Rebuild NationProgression from match-centric derived bracket (idempotent).
 */
export async function syncProgressionFromDerived(derived: DerivedMatchState[]): Promise<void> {
  const nationMaxRound = new Map<string, number>();

  for (const d of derived) {
    const rank = ROUND_RANK[d.def.round];

    if (isR32Match(d.def)) {
      if (d.home.nationalTeamId) bumpMax(nationMaxRound, d.home.nationalTeamId, rank);
      if (d.away.nationalTeamId) bumpMax(nationMaxRound, d.away.nationalTeamId, rank);
    } else {
      if (d.home.nationalTeamId && !d.home.waiting) {
        bumpMax(nationMaxRound, d.home.nationalTeamId, rank);
      }
      if (d.away.nationalTeamId && !d.away.waiting) {
        bumpMax(nationMaxRound, d.away.nationalTeamId, rank);
      }
    }

    if (d.def.round === "FINAL" && d.winnerId) {
      bumpMax(nationMaxRound, d.winnerId, ROUND_RANK.CHAMPION);
    }
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

  const rows: { nationalTeamId: string; stage: ProgressionStage }[] = [];
  for (const [nationalTeamId, stages] of nationStages) {
    for (const stage of stages) {
      rows.push({ nationalTeamId, stage });
    }
  }

  const existing = await prisma.nationProgression.findMany({
    select: { nationalTeamId: true, stage: true },
  });

  const existingSet = new Set(existing.map((e) => `${e.nationalTeamId}:${e.stage}`));
  const nextSet = new Set(rows.map((r) => `${r.nationalTeamId}:${r.stage}`));

  if (
    existingSet.size === nextSet.size &&
    [...existingSet].every((k) => nextSet.has(k))
  ) {
    return;
  }

  await prisma.nationProgression.deleteMany({});

  if (rows.length > 0) {
    await prisma.nationProgression.createMany({ data: rows, skipDuplicates: true });
  }
}

/** @deprecated Use syncProgressionFromDerived after derive. */
export async function syncProgressionFromBracket(): Promise<void> {
  const { deriveBracketMatches, buildMatchResultsFromDb } = await import(
    "@/lib/tournament/knockout/derive-bracket-state"
  );
  const { isManualSlot } = await import("@/lib/tournament/knockout/topology");

  const [slotRows, matchRows] = await Promise.all([
    prisma.knockoutSlot.findMany({ include: { nationalTeam: true } }),
    prisma.match.findMany({
      where: { knockoutMatchKey: { not: null } },
      select: {
        id: true,
        knockoutMatchKey: true,
        knockoutWinnerId: true,
        homeScore: true,
        awayScore: true,
        status: true,
      },
    }),
  ]);

  const r32Inputs = slotRows
    .filter((s) => isManualSlot(s.slotKey))
    .map((s) => ({
      slotKey: s.slotKey,
      nationalTeamId: s.nationalTeamId,
      nation: s.nationalTeam
        ? {
            id: s.nationalTeam.id,
            name: s.nationalTeam.name,
            flagEmoji: s.nationalTeam.flagEmoji,
            code: s.nationalTeam.code,
          }
        : null,
    }));

  const derived = deriveBracketMatches(r32Inputs, buildMatchResultsFromDb(r32Inputs, matchRows));
  await syncProgressionFromDerived(derived);
}
