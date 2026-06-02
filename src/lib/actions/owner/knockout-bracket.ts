"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerSession } from "@/lib/actions/owner/helpers";
import type { OwnerActionResult } from "@/lib/actions/owner/helpers";
import type { KnockoutBracketData } from "@/lib/tournament/knockout/bracket-service";
import {
  assignTeamToKnockoutSlot,
  clearKnockoutMatchWinner,
  getKnockoutBracketData,
  setKnockoutMatchWinner,
} from "@/lib/tournament/knockout/bracket-service";

export type KnockoutBracketActionResult = OwnerActionResult<KnockoutBracketData>;

function revalidateKnockout() {
  revalidatePath("/owner/matches-events/events/knockout");
  revalidatePath("/calendar/table/knockout-stage");
  revalidatePath("/owner/matches-events/matches");
  revalidatePath("/calendar/games");
  revalidatePath("/calendar/calendar");
  revalidatePath("/my-team");
}

async function freshBracket(): Promise<KnockoutBracketData> {
  return getKnockoutBracketData({ includeNations: true });
}

export async function getOwnerKnockoutBracketData() {
  return freshBracket();
}

export async function assignKnockoutSlotAction(
  slotKey: string,
  nationalTeamId: string | null
): Promise<KnockoutBracketActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Unauthorized." };

  const result = await assignTeamToKnockoutSlot(slotKey, nationalTeamId);
  if (!result.ok) return { ok: false, error: result.error ?? "Failed." };

  revalidateKnockout();
  return { ok: true, data: await freshBracket() };
}

export async function setKnockoutWinnerAction(
  matchKey: string,
  winnerNationalTeamId: string
): Promise<KnockoutBracketActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Unauthorized." };

  const result = await setKnockoutMatchWinner(matchKey, winnerNationalTeamId);
  if (!result.ok) return { ok: false, error: result.error ?? "Failed." };

  revalidateKnockout();
  return { ok: true, data: await freshBracket() };
}

export async function clearKnockoutWinnerAction(
  matchKey: string
): Promise<KnockoutBracketActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Unauthorized." };

  const result = await clearKnockoutMatchWinner(matchKey);
  if (!result.ok) return { ok: false, error: result.error ?? "Failed." };

  revalidateKnockout();
  return { ok: true, data: await freshBracket() };
}
