"use server";

import { revalidatePath } from "next/cache";
import { MatchBetPick, PromotedMatchBetStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireOwnerSession } from "@/lib/actions/owner/helpers";
import { ensureRankingOutcomeRows } from "@/lib/bets/ensure-ranking-outcome-rows";
import { invalidateLeagueRankIndex } from "@/lib/rankings/league-rank-index";
import type { OwnerActionResult } from "@/lib/actions/owner/helpers";
import { auth } from "@/lib/auth";

export type BetActionResult<T = void> = OwnerActionResult<T>;

function revalidateBetsPaths() {
  invalidateLeagueRankIndex();
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

function parseMatchBetPick(value: string): MatchBetPick | null {
  if (value === "HOME" || value === "DRAW" || value === "AWAY") {
    return value as MatchBetPick;
  }
  return null;
}

export async function upsertRankingOutcomeRowAction(input: {
  position: number;
  text: string;
}): Promise<BetActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Forbidden: platform Owner only." };

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
  if (!owner) return { ok: false, error: "Forbidden: platform Owner only." };

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
  if (!owner) return { ok: false, error: "Forbidden: platform Owner only." };

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
}): Promise<BetActionResult<{ betId: string }>> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Forbidden: platform Owner only." };

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

  if (existing?.isActive) {
    return { ok: false, error: "This match is already in Bets." };
  }

  if (existing && !existing.isActive) {
    const bet = await prisma.ownerPromotedMatchBet.update({
      where: { id: existing.id },
      data: {
        isActive: true,
        status: PromotedMatchBetStatus.VOTING_OPEN,
        homeOdd: null,
        drawOdd: null,
        awayOdd: null,
        createdById: owner.id,
      },
    });
    revalidateBetsPaths();
    return { ok: true, data: { betId: bet.id } };
  }

  const bet = await prisma.ownerPromotedMatchBet.create({
    data: {
      matchId: input.matchId,
      createdById: owner.id,
      status: PromotedMatchBetStatus.VOTING_OPEN,
    },
  });

  revalidateBetsPaths();
  return { ok: true, data: { betId: bet.id } };
}

export async function publishPromotedMatchBetOddsAction(input: {
  betId: string;
  homeOdd: string;
  drawOdd: string;
  awayOdd: string;
}): Promise<BetActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Forbidden: platform Owner only." };

  const homeOdd = normalizeOdd(input.homeOdd);
  const drawOdd = normalizeOdd(input.drawOdd);
  const awayOdd = normalizeOdd(input.awayOdd);
  if (!homeOdd || !drawOdd || !awayOdd) {
    return { ok: false, error: "Home, Draw, and Away odds are all required to publish." };
  }

  const bet = await prisma.ownerPromotedMatchBet.findUnique({
    where: { id: input.betId, isActive: true },
  });
  if (!bet) return { ok: false, error: "Bet not found." };

  await prisma.ownerPromotedMatchBet.update({
    where: { id: input.betId },
    data: {
      homeOdd,
      drawOdd,
      awayOdd,
      status: PromotedMatchBetStatus.ODDS_PUBLISHED,
    },
  });

  revalidateBetsPaths();
  return { ok: true };
}

export async function updatePromotedMatchBetOddsAction(input: {
  betId: string;
  homeOdd: string;
  drawOdd: string;
  awayOdd: string;
}): Promise<BetActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Forbidden: platform Owner only." };

  const homeOdd = normalizeOdd(input.homeOdd);
  const drawOdd = normalizeOdd(input.drawOdd);
  const awayOdd = normalizeOdd(input.awayOdd);
  if (!homeOdd || !drawOdd || !awayOdd) {
    return { ok: false, error: "Home, Draw, and Away odds are all required." };
  }

  const bet = await prisma.ownerPromotedMatchBet.findUnique({
    where: { id: input.betId, isActive: true },
  });
  if (!bet) return { ok: false, error: "Bet not found." };
  if (bet.status !== PromotedMatchBetStatus.ODDS_PUBLISHED) {
    return { ok: false, error: "Publish odds first before saving changes." };
  }

  await prisma.ownerPromotedMatchBet.update({
    where: { id: input.betId },
    data: { homeOdd, drawOdd, awayOdd },
  });

  revalidateBetsPaths();
  return { ok: true };
}

export async function removePromotedMatchBetAction(betId: string): Promise<BetActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Forbidden: platform Owner only." };

  await prisma.ownerPromotedMatchBet.update({
    where: { id: betId },
    data: { isActive: false },
  });

  revalidateBetsPaths();
  return { ok: true };
}

export async function submitMatchBetVoteAction(input: {
  promotedBetId: string;
  pick: string;
}): Promise<BetActionResult> {
  const userId = await requireSignedInUserId();
  if (!userId) return { ok: false, error: "Not signed in." };

  const pick = parseMatchBetPick(input.pick);
  if (!pick) return { ok: false, error: "Invalid vote." };

  const bet = await prisma.ownerPromotedMatchBet.findUnique({
    where: { id: input.promotedBetId, isActive: true },
  });
  if (!bet) return { ok: false, error: "Bet not found." };
  if (bet.status !== PromotedMatchBetStatus.VOTING_OPEN) {
    return { ok: false, error: "Voting is closed for this match." };
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
    return { ok: false, error: "You have already submitted a vote for this match." };
  }

  await prisma.matchBetVote.create({
    data: {
      promotedBetId: input.promotedBetId,
      userId,
      pick,
    },
  });

  revalidateBetsPaths();
  return { ok: true };
}
