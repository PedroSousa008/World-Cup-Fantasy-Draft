import { MatchStage, MatchStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  KNOCKOUT_MATCHES,
  KNOCKOUT_SLOTS,
  isManualSlot,
  type KnockoutMatchDef,
} from "@/lib/tournament/knockout/topology";
import { syncProgressionFromBracket } from "@/lib/tournament/knockout/progression-sync";

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
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  winnerId: string | null;
}

export interface KnockoutBracketData {
  slots: BracketSlotState[];
  matches: BracketMatchState[];
  nations: BracketNation[];
}

const KNOCKOUT_SCHEDULE_BASE = new Date("2026-07-01T16:00:00.000Z");

function scheduleForMatchday(matchday: number, order: number): Date {
  const d = new Date(KNOCKOUT_SCHEDULE_BASE);
  d.setDate(d.getDate() + (matchday - 4) * 2 + Math.floor(order / 4));
  d.setHours(16 + (order % 4) * 2);
  return d;
}

export async function ensureKnockoutSlotsInitialized(): Promise<void> {
  const count = await prisma.knockoutSlot.count();
  if (count >= KNOCKOUT_SLOTS.length) return;

  for (const def of KNOCKOUT_SLOTS) {
    await prisma.knockoutSlot.upsert({
      where: { slotKey: def.key },
      create: {
        slotKey: def.key,
        round: def.round,
        side: def.side,
      },
      update: {},
    });
  }
}

export async function getKnockoutBracketData(): Promise<KnockoutBracketData> {
  await ensureKnockoutSlotsInitialized();

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
    prisma.nationalTeam.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, flagEmoji: true, code: true },
    }),
  ]);

  const matchByKey = new Map(matchRows.map((m) => [m.knockoutMatchKey!, m]));

  const slots: BracketSlotState[] = slotRows.map((row) => ({
    slotKey: row.slotKey,
    round: row.round,
    side: row.side,
    nationalTeamId: row.nationalTeamId,
    nation: row.nationalTeam
      ? {
          id: row.nationalTeam.id,
          name: row.nationalTeam.name,
          flagEmoji: row.nationalTeam.flagEmoji,
          code: row.nationalTeam.code,
        }
      : null,
    eliminated: row.eliminated,
  }));

  const matches: BracketMatchState[] = KNOCKOUT_MATCHES.map((def) => {
    const m = matchByKey.get(def.key);
    const homeId = slots.find((s) => s.slotKey === def.homeSlot)?.nationalTeamId ?? null;
    const awayId = slots.find((s) => s.slotKey === def.awaySlot)?.nationalTeamId ?? null;
    let winnerId: string | null = null;
    if (m?.knockoutWinnerId) winnerId = m.knockoutWinnerId;
    else if (m?.status === "FINISHED" && m.homeScore != null && m.awayScore != null) {
      if (m.homeScore > m.awayScore) winnerId = m.homeTeamId;
      else if (m.awayScore > m.homeScore) winnerId = m.awayTeamId;
    }

    return {
      matchKey: def.key,
      round: def.round,
      matchday: def.matchday,
      side: def.side,
      homeSlot: def.homeSlot,
      awaySlot: def.awaySlot,
      winnerSlot: def.winnerSlot,
      matchId: m?.id ?? null,
      homeTeamId: homeId,
      awayTeamId: awayId,
      homeScore: m?.homeScore ?? null,
      awayScore: m?.awayScore ?? null,
      status: m?.status ?? "SCHEDULED",
      winnerId,
    };
  });

  return { slots, matches, nations };
}

function resolveMatchWinner(
  m: {
    knockoutWinnerId: string | null;
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number | null;
    awayScore: number | null;
    status: MatchStatus;
  } | undefined,
  homeId: string | null,
  awayId: string | null
): string | null {
  if (!m || !homeId || !awayId) return null;
  if (m.knockoutWinnerId) return m.knockoutWinnerId;
  if (m.status !== "FINISHED" || m.homeScore == null || m.awayScore == null) return null;
  if (m.homeScore > m.awayScore) return homeId;
  if (m.awayScore > m.homeScore) return awayId;
  return null;
}

/**
 * Full idempotent recompute: clear auto slots, propagate winners in order, sync progression.
 */
export async function recomputeKnockoutBracket(): Promise<void> {
  await ensureKnockoutSlotsInitialized();

  const [slotRows, matchRows] = await Promise.all([
    prisma.knockoutSlot.findMany(),
    prisma.match.findMany({ where: { knockoutMatchKey: { not: null } } }),
  ]);

  const slotMap = new Map(slotRows.map((s) => [s.slotKey, { ...s }]));
  const matchMap = new Map(matchRows.map((m) => [m.knockoutMatchKey!, m]));

  for (const def of KNOCKOUT_SLOTS) {
    if (!isManualSlot(def.key)) {
      const slot = slotMap.get(def.key);
      if (slot) {
        slot.nationalTeamId = null;
        slot.eliminated = false;
      }
    }
  }

  for (const matchDef of KNOCKOUT_MATCHES) {
    const homeSlot = slotMap.get(matchDef.homeSlot);
    const awaySlot = slotMap.get(matchDef.awaySlot);
    const homeId = homeSlot?.nationalTeamId ?? null;
    const awayId = awaySlot?.nationalTeamId ?? null;

    if (!homeId || !awayId) continue;

    await syncKnockoutMatchRecord(matchDef, homeId, awayId);

    let m = matchMap.get(matchDef.key);
    if (!m) {
      const found = await prisma.match.findUnique({ where: { knockoutMatchKey: matchDef.key } });
      if (found) {
        m = found;
        matchMap.set(matchDef.key, found);
      }
    }

    const winnerId = resolveMatchWinner(m ?? undefined, homeId, awayId);
    if (!winnerId) continue;

    const winnerSlot = slotMap.get(matchDef.winnerSlot);
    if (winnerSlot) {
      winnerSlot.nationalTeamId = winnerId;
      winnerSlot.eliminated = false;
    }

    const loserId = winnerId === homeId ? awayId : homeId;
    if (homeSlot) homeSlot.eliminated = loserId === homeId;
    if (awaySlot) awaySlot.eliminated = loserId === awayId;

    if (m && !m.knockoutWinnerId) {
      await prisma.match.update({
        where: { id: m.id },
        data: { knockoutWinnerId: winnerId },
      });
    }
  }

  for (const slot of slotMap.values()) {
    await prisma.knockoutSlot.update({
      where: { slotKey: slot.slotKey },
      data: {
        nationalTeamId: slot.nationalTeamId,
        eliminated: slot.eliminated,
      },
    });
  }

  await syncProgressionFromBracket();
}

async function syncKnockoutMatchRecord(
  def: KnockoutMatchDef,
  homeId: string,
  awayId: string
): Promise<void> {
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

  const homeSlot = await prisma.knockoutSlot.findUnique({ where: { slotKey: def.homeSlot } });
  const awaySlot = await prisma.knockoutSlot.findUnique({ where: { slotKey: def.awaySlot } });

  const homeId = homeSlot?.nationalTeamId;
  const awayId = awaySlot?.nationalTeamId;
  if (!homeId || !awayId) {
    return { ok: false, error: "Both teams must be set before selecting a winner." };
  }
  if (winnerNationalTeamId !== homeId && winnerNationalTeamId !== awayId) {
    return { ok: false, error: "Winner must be one of the match teams." };
  }

  await syncKnockoutMatchRecord(def, homeId, awayId);

  const match = await prisma.match.findUnique({ where: { knockoutMatchKey: matchKey } });
  if (!match) return { ok: false, error: "Match record missing." };

  const homeScore = winnerNationalTeamId === homeId ? 1 : 0;
  const awayScore = winnerNationalTeamId === awayId ? 1 : 0;

  await prisma.match.update({
    where: { id: match.id },
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
