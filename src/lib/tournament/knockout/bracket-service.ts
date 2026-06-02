import { MatchStage, MatchStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  KNOCKOUT_MATCHES,
  KNOCKOUT_SLOTS,
  isManualSlot,
  isR32Match,
  type KnockoutMatchDef,
} from "@/lib/tournament/knockout/topology";
import {
  buildMatchResultsFromDb,
  deriveBracketMatches,
  derivedToBracketMatches,
} from "@/lib/tournament/knockout/derive-bracket-state";
import { syncProgressionFromDerived } from "@/lib/tournament/knockout/progression-sync";

export interface BracketNation {
  id: string;
  name: string;
  flagEmoji: string | null;
  code: string;
}

export interface BracketSlotState {
  slotKey: string;
  round: string;
  side: string | null;
  nationalTeamId: string | null;
  nation: BracketNation | null;
  eliminated: boolean;
}

export interface BracketMatchState {
  matchKey: string;
  round: string;
  matchday: number;
  side: string;
  homeSlot: string;
  awaySlot: string;
  winnerSlot: string;
  matchId: string | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeNation: BracketNation | null;
  awayNation: BracketNation | null;
  homeWaiting: boolean;
  awayWaiting: boolean;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  winnerId: string | null;
  feederHomeMatchKey?: string;
  feederAwayMatchKey?: string;
}

export interface KnockoutBracketData {
  slots: BracketSlotState[];
  matches: BracketMatchState[];
  nations: BracketNation[];
}

export interface GetKnockoutBracketOptions {
  /** Nation list for Owner picker — skip on read-only Calendar view. */
  includeNations?: boolean;
}

const KNOCKOUT_SCHEDULE_BASE = new Date("2026-07-01T16:00:00.000Z");

let slotsInitPromise: Promise<void> | null = null;

function scheduleForMatchday(matchday: number, order: number): Date {
  const d = new Date(KNOCKOUT_SCHEDULE_BASE);
  d.setDate(d.getDate() + (matchday - 4) * 2 + Math.floor(order / 4));
  d.setHours(16 + (order % 4) * 2);
  return d;
}

/** One-time slot seed — batched, not 63 sequential upserts. */
export async function ensureKnockoutSlotsInitialized(): Promise<void> {
  if (slotsInitPromise) return slotsInitPromise;

  slotsInitPromise = (async () => {
    const existing = await prisma.knockoutSlot.findMany({ select: { slotKey: true } });
    if (existing.length >= KNOCKOUT_SLOTS.length) return;

    const have = new Set(existing.map((e) => e.slotKey));
    const missing = KNOCKOUT_SLOTS.filter((s) => !have.has(s.key));
    if (missing.length === 0) return;

    await prisma.knockoutSlot.createMany({
      data: missing.map((def) => ({
        slotKey: def.key,
        round: def.round,
        side: def.side,
      })),
      skipDuplicates: true,
    });
  })();

  return slotsInitPromise;
}

type SlotRowWithNation = Awaited<
  ReturnType<
    typeof prisma.knockoutSlot.findMany<{
      include: { nationalTeam: true };
    }>
  >
>[number];

function buildBracketPayload(
  slotRows: SlotRowWithNation[],
  matchRows: {
    id: string;
    knockoutMatchKey: string | null;
    knockoutWinnerId: string | null;
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number | null;
    awayScore: number | null;
    status: MatchStatus;
  }[],
  nations: BracketNation[]
): KnockoutBracketData {
  const slots: BracketSlotState[] = slotRows.map((row) => ({
    slotKey: row.slotKey,
    round: row.round,
    side: row.side,
    nationalTeamId: isManualSlot(row.slotKey) ? row.nationalTeamId : null,
    nation:
      isManualSlot(row.slotKey) && row.nationalTeam
        ? {
            id: row.nationalTeam.id,
            name: row.nationalTeam.name,
            flagEmoji: row.nationalTeam.flagEmoji,
            code: row.nationalTeam.code,
          }
        : null,
    eliminated: row.eliminated,
  }));

  const r32Inputs = slots
    .filter((s) => isManualSlot(s.slotKey))
    .map((s) => ({
      slotKey: s.slotKey,
      nationalTeamId: s.nationalTeamId,
      nation: s.nation,
    }));

  const matchInputs = buildMatchResultsFromDb(r32Inputs, matchRows);
  const derived = deriveBracketMatches(r32Inputs, matchInputs, nations);
  const matches = derivedToBracketMatches(derived);

  return { slots, matches, nations };
}

/** Fast read — no recompute, no progression sync. */
export async function getKnockoutBracketData(
  options: GetKnockoutBracketOptions = {}
): Promise<KnockoutBracketData> {
  const { includeNations = false } = options;

  await ensureKnockoutSlotsInitialized();

  const nationsPromise = includeNations
    ? prisma.nationalTeam.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, flagEmoji: true, code: true },
      })
    : Promise.resolve([] as BracketNation[]);

  const [slotRows, matchRows, nations] = await Promise.all([
    prisma.knockoutSlot.findMany({
      include: { nationalTeam: true },
      orderBy: { slotKey: "asc" },
    }),
    prisma.match.findMany({
      where: { knockoutMatchKey: { not: null } },
      select: {
        id: true,
        knockoutMatchKey: true,
        knockoutWinnerId: true,
        homeTeamId: true,
        awayTeamId: true,
        homeScore: true,
        awayScore: true,
        status: true,
      },
    }),
    nationsPromise,
  ]);

  return buildBracketPayload(slotRows, matchRows, nations);
}

/** Remove knockout match when bracket pairing is incomplete. */
async function removeKnockoutMatch(matchKey: string): Promise<void> {
  await prisma.match.deleteMany({ where: { knockoutMatchKey: matchKey } });
}

/**
 * Create or update match when both teams exist; delete when either slot is empty.
 * Uses stable knockoutMatchKey — never duplicates.
 */
async function syncKnockoutMatchRecord(
  def: KnockoutMatchDef,
  homeId: string | null,
  awayId: string | null
): Promise<void> {
  if (!homeId || !awayId) {
    await removeKnockoutMatch(def.key);
    return;
  }

  const scheduledAt = scheduleForMatchday(def.matchday, def.order);
  const existing = await prisma.match.findUnique({
    where: { knockoutMatchKey: def.key },
  });

  if (existing) {
    await prisma.match.update({
      where: { id: existing.id },
      data: {
        homeTeamId: homeId,
        awayTeamId: awayId,
        matchday: def.matchday,
        stage: MatchStage.KNOCKOUT,
        scheduledAt,
      },
    });
  } else {
    await prisma.match.create({
      data: {
        homeTeamId: homeId,
        awayTeamId: awayId,
        scheduledAt,
        matchday: def.matchday,
        stage: MatchStage.KNOCKOUT,
        status: MatchStatus.SCHEDULED,
        knockoutMatchKey: def.key,
      },
    });
  }
}

/**
 * Full idempotent recompute after Owner edits (not on page load).
 * Batched DB writes; progression sync only at end.
 */
export async function recomputeKnockoutBracket(): Promise<void> {
  await ensureKnockoutSlotsInitialized();

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

  const matchInputs = buildMatchResultsFromDb(r32Inputs, matchRows);
  const allNations = slotRows
    .filter((s) => s.nationalTeam)
    .map((s) => ({
      id: s.nationalTeam!.id,
      name: s.nationalTeam!.name,
      flagEmoji: s.nationalTeam!.flagEmoji,
      code: s.nationalTeam!.code,
    }));
  const derived = deriveBracketMatches(r32Inputs, matchInputs, allNations);
  const matchByKey = new Map(
    matchRows.filter((m) => m.knockoutMatchKey).map((m) => [m.knockoutMatchKey!, m])
  );

  const matchClears: string[] = [];
  const matchWinnerSets: { id: string; knockoutWinnerId: string }[] = [];

  for (const d of derived) {
    await syncKnockoutMatchRecord(
      d.def,
      d.home.nationalTeamId,
      d.away.nationalTeamId
    );

    const m = matchByKey.get(d.def.key);
    if (m?.knockoutWinnerId && !d.winnerId) {
      matchClears.push(m.id);
    } else if (m && d.winnerId && !m.knockoutWinnerId) {
      matchWinnerSets.push({ id: m.id, knockoutWinnerId: d.winnerId });
    }
  }

  const slotEliminated = new Map<string, boolean>();
  for (const s of slotRows) {
    if (isManualSlot(s.slotKey)) slotEliminated.set(s.slotKey, false);
  }
  for (const d of derived) {
    if (!isR32Match(d.def) || !d.winnerId) continue;
    const homeId = d.home.nationalTeamId;
    const awayId = d.away.nationalTeamId;
    if (!homeId || !awayId) continue;
    const loserId = d.winnerId === homeId ? awayId : homeId;
    if (loserId === homeId) slotEliminated.set(d.def.homeSlot, true);
    if (loserId === awayId) slotEliminated.set(d.def.awaySlot, true);
  }

  await prisma.$transaction(async (tx) => {
    for (const id of matchClears) {
      await tx.match.update({
        where: { id },
        data: {
          knockoutWinnerId: null,
          status: MatchStatus.SCHEDULED,
          homeScore: null,
          awayScore: null,
        },
      });
    }
    for (const u of matchWinnerSets) {
      await tx.match.update({
        where: { id: u.id },
        data: { knockoutWinnerId: u.knockoutWinnerId },
      });
    }
    for (const slot of slotRows) {
      if (isManualSlot(slot.slotKey)) {
        await tx.knockoutSlot.update({
          where: { slotKey: slot.slotKey },
          data: { eliminated: slotEliminated.get(slot.slotKey) ?? false },
        });
      } else {
        await tx.knockoutSlot.update({
          where: { slotKey: slot.slotKey },
          data: { nationalTeamId: null, eliminated: false },
        });
      }
    }
  });

  await syncProgressionFromDerived(derived);
}

export async function assignTeamToKnockoutSlot(
  slotKey: string,
  nationalTeamId: string | null
): Promise<{ ok: boolean; error?: string }> {
  if (!isManualSlot(slotKey)) {
    return { ok: false, error: "Only Round of 32 slots can be assigned manually." };
  }

  await ensureKnockoutSlotsInitialized();

  if (nationalTeamId) {
    const existing = await prisma.knockoutSlot.findFirst({
      where: {
        nationalTeamId,
        slotKey: { not: slotKey },
      },
    });
    if (existing) {
      return { ok: false, error: "This nation is already in the bracket." };
    }
  }

  await prisma.knockoutSlot.update({
    where: { slotKey },
    data: { nationalTeamId, eliminated: false },
  });

  await recomputeKnockoutBracket();
  return { ok: true };
}

export async function setKnockoutMatchWinner(
  matchKey: string,
  winnerNationalTeamId: string
): Promise<{ ok: boolean; error?: string }> {
  const def = KNOCKOUT_MATCHES.find((m) => m.key === matchKey);
  if (!def) return { ok: false, error: "Unknown match." };

  const bracket = await getKnockoutBracketData();
  const bracketMatch = bracket.matches.find((m) => m.matchKey === matchKey);
  const homeId = bracketMatch?.homeTeamId;
  const awayId = bracketMatch?.awayTeamId;
  if (!homeId || !awayId) {
    return { ok: false, error: "Both teams must be set before selecting a winner." };
  }
  if (winnerNationalTeamId !== homeId && winnerNationalTeamId !== awayId) {
    return { ok: false, error: "Winner must be one of the match teams." };
  }

  const existing = await prisma.match.findUnique({ where: { knockoutMatchKey: matchKey } });
  if (!existing) {
    await syncKnockoutMatchRecord(def, homeId, awayId);
  }

  const record = await prisma.match.findUnique({ where: { knockoutMatchKey: matchKey } });
  if (!record) return { ok: false, error: "Match record missing." };

  const homeScore = winnerNationalTeamId === homeId ? 1 : 0;
  const awayScore = winnerNationalTeamId === awayId ? 1 : 0;

  await prisma.match.update({
    where: { id: record.id },
    data: {
      status: MatchStatus.FINISHED,
      homeScore,
      awayScore,
      knockoutWinnerId: winnerNationalTeamId,
    },
  });

  await recomputeKnockoutBracket();
  return { ok: true };
}

export async function clearKnockoutMatchWinner(
  matchKey: string
): Promise<{ ok: boolean; error?: string }> {
  const match = await prisma.match.findUnique({ where: { knockoutMatchKey: matchKey } });
  if (!match) return { ok: false, error: "Match not found." };

  await prisma.match.update({
    where: { id: match.id },
    data: {
      status: MatchStatus.SCHEDULED,
      homeScore: null,
      awayScore: null,
      knockoutWinnerId: null,
    },
  });

  await recomputeKnockoutBracket();
  return { ok: true };
}

/** Called after Owner saves a knockout match in Matches editor. */
export async function onKnockoutMatchSaved(matchId: string): Promise<void> {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match?.knockoutMatchKey) return;

  if (
    match.status === "FINISHED" &&
    match.homeScore != null &&
    match.awayScore != null &&
    match.homeScore !== match.awayScore
  ) {
    const winnerId =
      match.homeScore > match.awayScore ? match.homeTeamId : match.awayTeamId;
    await prisma.match.update({
      where: { id: matchId },
      data: { knockoutWinnerId: winnerId },
    });
  } else if (match.status !== "FINISHED") {
    await prisma.match.update({
      where: { id: matchId },
      data: { knockoutWinnerId: null },
    });
  }

  await recomputeKnockoutBracket();
}
