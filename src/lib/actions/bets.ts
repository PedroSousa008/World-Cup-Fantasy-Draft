"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireOwnerSession } from "@/lib/actions/owner/helpers";
import { ensureRankingOutcomeRows } from "@/lib/bets/ensure-ranking-outcome-rows";
import type { OwnerActionResult } from "@/lib/actions/owner/helpers";
import { auth } from "@/lib/auth";

export type BetActionResult<T = void> = OwnerActionResult<T>;

function revalidateBetsPaths() {
  revalidatePath("/bets");
  revalidatePath("/bets/bets");
  revalidatePath("/bets/punishments");
  revalidatePath("/owner/bets");
  revalidatePath("/my-team/rankings");
}

async function requireSignedInUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

function normalizeOdd(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed;
}

export async function upsertRankingOutcomeRowAction(input: {
  position: number;
  text: string;
}): Promise<BetActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Owner access required." };

  if (!Number.isInteger(input.position) || input.position < 1) {
    return { ok: false, error: "Invalid position." };
  }

  await ensureRankingOutcomeRows();

  await prisma.rankingOutcomeRow.upsert({
    where: { position: input.position },
    create: { position: input.position, text: input.text.trim() },
    update: { text: input.text.trim() },
  });

  revalidateBetsPaths();
  return { ok: true };
}

export async function addRankingOutcomeRowAction(): Promise<
  BetActionResult<{ position: number }>
> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Owner access required." };

  await ensureRankingOutcomeRows();

  const max = await prisma.rankingOutcomeRow.aggregate({ _max: { position: true } });
  const nextPosition = (max._max.position ?? 0) + 1;

  await prisma.rankingOutcomeRow.create({
    data: { position: nextPosition, text: "" },
  });

  revalidateBetsPaths();
  return { ok: true, data: { position: nextPosition } };
}

export async function deleteRankingOutcomeRowAction(
  position: number
): Promise<BetActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Owner access required." };

  const count = await prisma.rankingOutcomeRow.count();
  if (count <= 1) {
    return { ok: false, error: "At least one position row must remain." };
  }

  await prisma.rankingOutcomeRow.delete({ where: { position } }).catch(() => null);

  revalidateBetsPaths();
  return { ok: true };
}

export async function createPromotedMatchBetAction(input: {
  matchId: string;
  homeOdd: string;
  awayOdd: string;
}): Promise<BetActionResult<{ betId: string }>> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Owner access required." };

  const homeOdd = normalizeOdd(input.homeOdd);
  const awayOdd = normalizeOdd(input.awayOdd);
  if (!homeOdd || !awayOdd) {
    return { ok: false, error: "Both odds are required." };
  }

  const match = await prisma.match.findUnique({
    where: { id: input.matchId },
    select: { id: true, matchday: true },
  });
  if (!match) return { ok: false, error: "Match not found." };
  if (match.matchday == null) {
    return { ok: false, error: "Only matchday matches can be used for bets." };
  }

  const existing = await prisma.ownerPromotedMatchBet.findUnique({
    where: { matchId: input.matchId },
  });
  if (existing) return { ok: false, error: "This match is already in Bets." };

  const bet = await prisma.ownerPromotedMatchBet.create({
    data: {
      matchId: input.matchId,
      homeOdd,
      awayOdd,
      createdById: owner.id,
    },
  });

  revalidateBetsPaths();
  return { ok: true, data: { betId: bet.id } };
}

export async function updatePromotedMatchBetOddsAction(input: {
  betId: string;
  homeOdd: string;
  awayOdd: string;
}): Promise<BetActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Owner access required." };

  const homeOdd = normalizeOdd(input.homeOdd);
  const awayOdd = normalizeOdd(input.awayOdd);
  if (!homeOdd || !awayOdd) {
    return { ok: false, error: "Both odds are required." };
  }

  await prisma.ownerPromotedMatchBet.update({
    where: { id: input.betId },
    data: { homeOdd, awayOdd },
  });

  revalidateBetsPaths();
  return { ok: true };
}

export async function removePromotedMatchBetAction(betId: string): Promise<BetActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Owner access required." };

  await prisma.ownerPromotedMatchBet.delete({ where: { id: betId } });

  revalidateBetsPaths();
  return { ok: true };
}

export async function submitMatchBetVoteAction(input: {
  promotedBetId: string;
  pickedTeamId: string;
}): Promise<BetActionResult> {
  const userId = await requireSignedInUserId();
  if (!userId) return { ok: false, error: "Not signed in." };

  const bet = await prisma.ownerPromotedMatchBet.findUnique({
    where: { id: input.promotedBetId, isActive: true },
    include: {
      match: { select: { homeTeamId: true, awayTeamId: true } },
    },
  });
  if (!bet) return { ok: false, error: "Bet not found." };

  const { homeTeamId, awayTeamId } = bet.match;
  if (
    input.pickedTeamId !== homeTeamId &&
    input.pickedTeamId !== awayTeamId
  ) {
    return { ok: false, error: "Invalid team selection." };
  }

  const existing = await prisma.matchBetVote.findUnique({
    where: {
      promotedBetId_userId: {
        promotedBetId: input.promotedBetId,
        userId,
      },
    },
  });
  if (existing) {
    return { ok: false, error: "You have already submitted a bet for this match." };
  }

  await prisma.matchBetVote.create({
    data: {
      promotedBetId: input.promotedBetId,
      userId,
      pickedTeamId: input.pickedTeamId,
    },
  });

  revalidateBetsPaths();
  return { ok: true };
}
