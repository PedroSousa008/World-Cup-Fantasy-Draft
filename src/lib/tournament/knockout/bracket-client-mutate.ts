import type {
  BracketMatchState,
  BracketNation,
  BracketSlotState,
  KnockoutBracketData,
} from "@/lib/tournament/knockout/bracket-service";
import {
  buildMatchResultsFromClient,
  deriveBracketMatches,
  derivedToBracketMatches,
} from "@/lib/tournament/knockout/derive-bracket-state";
import { KNOCKOUT_MATCHES, isManualSlot, isR32Match } from "@/lib/tournament/knockout/topology";

function r32InputsFromSlots(slots: BracketSlotState[]) {
  return slots
    .filter((s) => isManualSlot(s.slotKey))
    .map((s) => ({
      slotKey: s.slotKey,
      nationalTeamId: s.nationalTeamId,
      nation: s.nation,
    }));
}

/** Clear winners on matches downstream of a feeder match (tree propagation). */
function clearWinnersDownstreamOfMatch(
  matches: BracketMatchState[],
  sourceMatchKey: string
): BracketMatchState[] {
  const toClear = new Set<string>([sourceMatchKey]);
  let grew = true;

  while (grew) {
    grew = false;
    for (const def of KNOCKOUT_MATCHES) {
      if (toClear.has(def.key)) continue;
      if (
        (def.feederHomeMatchKey && toClear.has(def.feederHomeMatchKey)) ||
        (def.feederAwayMatchKey && toClear.has(def.feederAwayMatchKey))
      ) {
        toClear.add(def.key);
        grew = true;
      }
    }
  }

  return matches.map((m) =>
    toClear.has(m.matchKey)
      ? {
          ...m,
          winnerId: null,
          status: "SCHEDULED",
          homeScore: null,
          awayScore: null,
        }
      : m
  );
}

function clearWinnersDownstreamOfSlot(
  matches: BracketMatchState[],
  slotKey: string
): BracketMatchState[] {
  const def = KNOCKOUT_MATCHES.find((m) => m.homeSlot === slotKey || m.awaySlot === slotKey);
  if (!def) return matches;
  return clearWinnersDownstreamOfMatch(matches, def.key);
}

/**
 * Pure client-side bracket derivation (mirrors server match-centric logic).
 */
export function recomputeBracketDataState(data: KnockoutBracketData): KnockoutBracketData {
  const r32Inputs = r32InputsFromSlots(data.slots);
  const matchInputs = buildMatchResultsFromClient(r32Inputs, data.matches);
  const derived = deriveBracketMatches(r32Inputs, matchInputs, data.nations);
  const matches = derivedToBracketMatches(derived);

  const eliminatedBySlot = new Map<string, boolean>();
  for (const s of data.slots) {
    if (isManualSlot(s.slotKey)) eliminatedBySlot.set(s.slotKey, false);
  }
  for (const d of derived) {
    if (!isR32Match(d.def) || !d.winnerId) continue;
    const homeId = d.home.nationalTeamId;
    const awayId = d.away.nationalTeamId;
    if (!homeId || !awayId) continue;
    const loserId = d.winnerId === homeId ? awayId : homeId;
    if (loserId === homeId) eliminatedBySlot.set(d.def.homeSlot, true);
    if (loserId === awayId) eliminatedBySlot.set(d.def.awaySlot, true);
  }

  const slots = data.slots.map((s) => ({
    ...s,
    nationalTeamId: isManualSlot(s.slotKey) ? s.nationalTeamId : null,
    nation: isManualSlot(s.slotKey) ? s.nation : null,
    eliminated: eliminatedBySlot.get(s.slotKey) ?? false,
  }));

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
