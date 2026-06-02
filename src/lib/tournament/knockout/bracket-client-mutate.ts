import type {
  BracketMatchState,
  BracketNation,
  BracketSlotState,
  KnockoutBracketData,
} from "@/lib/tournament/knockout/bracket-service";
import { KNOCKOUT_MATCHES, isManualSlot } from "@/lib/tournament/knockout/topology";

/** Clear winner flags on matches downstream of a changed slot. */
function clearWinnersDownstreamOfSlot(
  matches: BracketMatchState[],
  slotKey: string
): BracketMatchState[] {
  const slotsToInvalidate = new Set<string>([slotKey]);
  const matchesToClear = new Set<string>();
  let grew = true;

  while (grew) {
    grew = false;
    for (const def of KNOCKOUT_MATCHES) {
      if (matchesToClear.has(def.key)) continue;
      if (slotsToInvalidate.has(def.homeSlot) || slotsToInvalidate.has(def.awaySlot)) {
        matchesToClear.add(def.key);
        slotsToInvalidate.add(def.winnerSlot);
        grew = true;
      }
    }
  }

  return matches.map((m) =>
    matchesToClear.has(m.matchKey) ? { ...m, winnerId: null, status: "SCHEDULED" } : m
  );
}

function nationForTeam(
  slots: BracketSlotState[],
  teamId: string
): BracketNation | null {
  const row = slots.find((s) => s.nationalTeamId === teamId);
  return row?.nation ?? null;
}

/**
 * Pure client-side bracket propagation (mirrors server recompute for UI).
 */
export function recomputeBracketDataState(data: KnockoutBracketData): KnockoutBracketData {
  const slots: BracketSlotState[] = data.slots.map((s) => ({
    ...s,
    nation: s.nation ? { ...s.nation } : null,
  }));
  const slotByKey = new Map(slots.map((s) => [s.slotKey, s]));
  const matches: BracketMatchState[] = data.matches.map((m) => ({ ...m }));

  for (const slot of slots) {
    if (!isManualSlot(slot.slotKey)) {
      slot.nationalTeamId = null;
      slot.nation = null;
      slot.eliminated = false;
    }
  }

  for (const def of KNOCKOUT_MATCHES) {
    const home = slotByKey.get(def.homeSlot);
    const away = slotByKey.get(def.awaySlot);
    const match = matches.find((m) => m.matchKey === def.key);
    if (!match || !home || !away) continue;

    const homeId = home.nationalTeamId;
    const awayId = away.nationalTeamId;
    match.homeTeamId = homeId;
    match.awayTeamId = awayId;

    if (!homeId || !awayId) {
      match.winnerId = null;
      home.eliminated = false;
      away.eliminated = false;
      continue;
    }

    let winnerId = match.winnerId;
    if (winnerId && winnerId !== homeId && winnerId !== awayId) {
      winnerId = null;
      match.winnerId = null;
    }

    if (!winnerId) {
      home.eliminated = false;
      away.eliminated = false;
      continue;
    }

    const winnerSlot = slotByKey.get(def.winnerSlot);
    if (winnerSlot) {
      winnerSlot.nationalTeamId = winnerId;
      winnerSlot.nation = nationForTeam(slots, winnerId);
      winnerSlot.eliminated = false;
    }

    const loserId = winnerId === homeId ? awayId : homeId;
    home.eliminated = home.nationalTeamId === loserId;
    away.eliminated = away.nationalTeamId === loserId;
  }

  return { slots, matches, nations: data.nations };
}

export function applySlotAssignment(
  data: KnockoutBracketData,
  slotKey: string,
  nationalTeamId: string | null,
  nation: BracketNation | null
): KnockoutBracketData {
  const slots = data.slots.map((s) => {
    if (s.slotKey === slotKey) {
      return {
        ...s,
        nationalTeamId,
        nation,
        eliminated: false,
      };
    }
    if (nationalTeamId && s.nationalTeamId === nationalTeamId) {
      return { ...s, nationalTeamId: null, nation: null, eliminated: false };
    }
    return { ...s };
  });

  const matches = clearWinnersDownstreamOfSlot(data.matches, slotKey);
  return recomputeBracketDataState({ ...data, slots, matches });
}

export function applyWinnerSelection(
  data: KnockoutBracketData,
  matchKey: string,
  winnerNationalTeamId: string
): KnockoutBracketData {
  const matches = data.matches.map((m) => {
    if (m.matchKey !== matchKey) return m;
    const homeScore = winnerNationalTeamId === m.homeTeamId ? 1 : 0;
    const awayScore = winnerNationalTeamId === m.awayTeamId ? 1 : 0;
    return {
      ...m,
      winnerId: winnerNationalTeamId,
      status: "FINISHED",
      homeScore,
      awayScore,
    };
  });

  return recomputeBracketDataState({ ...data, matches });
}
