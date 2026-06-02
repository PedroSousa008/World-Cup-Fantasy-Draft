import type { MatchStatus } from "@prisma/client";
import type { BracketNation, BracketMatchState } from "@/lib/tournament/knockout/bracket-service";
import {
  KNOCKOUT_MATCHES,
  isR32Match,
  type KnockoutMatchDef,
} from "@/lib/tournament/knockout/topology";

export interface DerivedParticipant {
  nationalTeamId: string | null;
  nation: BracketNation | null;
  /** Feeder match not yet decided */
  waiting: boolean;
}

export interface DerivedMatchState {
  def: KnockoutMatchDef;
  home: DerivedParticipant;
  away: DerivedParticipant;
  winnerId: string | null;
  matchId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
}

export interface R32SlotInput {
  slotKey: string;
  nationalTeamId: string | null;
  nation: BracketNation | null;
}

export interface MatchResultInput {
  matchKey: string;
  winnerId: string | null;
  matchId?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  status?: string;
}

function emptyParticipant(waiting = false): DerivedParticipant {
  return { nationalTeamId: null, nation: null, waiting };
}

function participantFromWinnerId(
  winnerId: string | null,
  nationById: Map<string, BracketNation>
): DerivedParticipant {
  if (!winnerId) return emptyParticipant(true);
  return {
    nationalTeamId: winnerId,
    nation: nationById.get(winnerId) ?? null,
    waiting: false,
  };
}

/**
 * Match-centric bracket derivation.
 * R32 teams come from manual slots; all later rounds come only from feeder match winners.
 */
export function deriveBracketMatches(
  r32Slots: R32SlotInput[],
  matchResults: MatchResultInput[],
  allNations: BracketNation[] = []
): DerivedMatchState[] {
  const r32BySlot = new Map(r32Slots.map((s) => [s.slotKey, s]));
  const resultByKey = new Map(matchResults.map((r) => [r.matchKey, r]));

  const nationById = new Map<string, BracketNation>();
  for (const n of allNations) nationById.set(n.id, n);
  for (const s of r32Slots) {
    if (s.nationalTeamId && s.nation) nationById.set(s.nationalTeamId, s.nation);
  }

  const winnersByMatchKey = new Map<string, string | null>();

  const derived: DerivedMatchState[] = [];

  for (const def of KNOCKOUT_MATCHES) {
    const stored = resultByKey.get(def.key);

    let home: DerivedParticipant;
    let away: DerivedParticipant;

    if (isR32Match(def)) {
      const h = r32BySlot.get(def.homeSlot);
      const a = r32BySlot.get(def.awaySlot);
      home = h?.nationalTeamId
        ? { nationalTeamId: h.nationalTeamId, nation: h.nation, waiting: false }
        : emptyParticipant(false);
      away = a?.nationalTeamId
        ? { nationalTeamId: a.nationalTeamId, nation: a.nation, waiting: false }
        : emptyParticipant(false);
    } else {
      const feedHome = def.feederHomeMatchKey
        ? winnersByMatchKey.get(def.feederHomeMatchKey) ?? null
        : null;
      const feedAway = def.feederAwayMatchKey
        ? winnersByMatchKey.get(def.feederAwayMatchKey) ?? null
        : null;
      home = participantFromWinnerId(feedHome, nationById);
      away = participantFromWinnerId(feedAway, nationById);
    }

    let winnerId = stored?.winnerId ?? null;
    if (winnerId && winnerId !== home.nationalTeamId && winnerId !== away.nationalTeamId) {
      winnerId = null;
    }
    if (!home.nationalTeamId || !away.nationalTeamId) {
      winnerId = null;
    }

    winnersByMatchKey.set(def.key, winnerId);

    if (winnerId && winnerId === home.nationalTeamId && home.nation) {
      nationById.set(winnerId, home.nation);
    }
    if (winnerId && winnerId === away.nationalTeamId && away.nation) {
      nationById.set(winnerId, away.nation);
    }

    derived.push({
      def,
      home,
      away,
      winnerId,
      matchId: stored?.matchId ?? null,
      homeScore: stored?.homeScore ?? null,
      awayScore: stored?.awayScore ?? null,
      status: stored?.status ?? "SCHEDULED",
    });
  }

  return derived;
}

export function derivedToBracketMatches(derived: DerivedMatchState[]): BracketMatchState[] {
  return derived.map((d) => ({
    matchKey: d.def.key,
    round: d.def.round,
    matchday: d.def.matchday,
    side: d.def.side,
    homeSlot: d.def.homeSlot,
    awaySlot: d.def.awaySlot,
    winnerSlot: d.def.winnerSlot,
    matchId: d.matchId,
    homeTeamId: d.home.nationalTeamId,
    awayTeamId: d.away.nationalTeamId,
    homeNation: d.home.nation,
    awayNation: d.away.nation,
    homeWaiting: d.home.waiting,
    awayWaiting: d.away.waiting,
    homeScore: d.homeScore,
    awayScore: d.awayScore,
    status: d.status,
    winnerId: d.winnerId,
    feederHomeMatchKey: d.def.feederHomeMatchKey,
    feederAwayMatchKey: d.def.feederAwayMatchKey,
  }));
}

export function buildMatchResultsFromDb(
  r32Slots: R32SlotInput[],
  matchRows: {
    knockoutMatchKey: string | null;
    knockoutWinnerId: string | null;
    homeScore: number | null;
    awayScore: number | null;
    status: MatchStatus;
    id?: string;
  }[]
): MatchResultInput[] {
  const matchByKey = new Map(
    matchRows.filter((m) => m.knockoutMatchKey).map((m) => [m.knockoutMatchKey!, m])
  );

  const preliminary = deriveBracketMatches(
    r32Slots,
    KNOCKOUT_MATCHES.map((def) => {
      const m = matchByKey.get(def.key);
      return {
        matchKey: def.key,
        winnerId: null,
        matchId: m?.id ?? null,
        homeScore: m?.homeScore ?? null,
        awayScore: m?.awayScore ?? null,
        status: m?.status ?? "SCHEDULED",
      };
    })
  );

  return preliminary.map((d) => {
    const m = matchByKey.get(d.def.key);
    const winnerId = m
      ? resolveWinnerFromDb(
          m.knockoutWinnerId,
          m.status,
          m.homeScore,
          m.awayScore,
          d.home.nationalTeamId,
          d.away.nationalTeamId
        )
      : null;
    return {
      matchKey: d.def.key,
      winnerId,
      matchId: m?.id ?? null,
      homeScore: m?.homeScore ?? null,
      awayScore: m?.awayScore ?? null,
      status: m?.status ?? "SCHEDULED",
    };
  });
}

export function buildMatchResultsFromClient(
  r32Slots: R32SlotInput[],
  matches: BracketMatchState[]
): MatchResultInput[] {
  const preliminary = deriveBracketMatches(
    r32Slots,
    KNOCKOUT_MATCHES.map((def) => {
      const m = matches.find((x) => x.matchKey === def.key);
      return {
        matchKey: def.key,
        winnerId: null,
        matchId: m?.matchId ?? null,
        homeScore: m?.homeScore ?? null,
        awayScore: m?.awayScore ?? null,
        status: m?.status ?? "SCHEDULED",
      };
    })
  );

  return preliminary.map((d) => {
    const m = matches.find((x) => x.matchKey === d.def.key);
    let winnerId = m?.winnerId ?? null;
    if (winnerId && winnerId !== d.home.nationalTeamId && winnerId !== d.away.nationalTeamId) {
      winnerId = null;
    }
    if (!d.home.nationalTeamId || !d.away.nationalTeamId) {
      winnerId = null;
    }
    return {
      matchKey: d.def.key,
      winnerId,
      matchId: m?.matchId ?? null,
      homeScore: m?.homeScore ?? null,
      awayScore: m?.awayScore ?? null,
      status: m?.status ?? "SCHEDULED",
    };
  });
}

export function resolveWinnerFromDb(
  knockoutWinnerId: string | null,
  status: MatchStatus,
  homeScore: number | null,
  awayScore: number | null,
  homeId: string | null,
  awayId: string | null
): string | null {
  if (!homeId || !awayId) return null;
  if (knockoutWinnerId) return knockoutWinnerId;
  if (status !== "FINISHED" || homeScore == null || awayScore == null) return null;
  if (homeScore > awayScore) return homeId;
  if (awayScore > homeScore) return awayId;
  return null;
}
