import type { KnockoutRound } from "@prisma/client";

export type BracketSide = "left" | "right" | "center";

export interface KnockoutSlotDef {
  key: string;
  round: KnockoutRound;
  side: BracketSide;
  order: number;
}

export interface KnockoutMatchDef {
  key: string;
  round: KnockoutRound;
  matchday: number;
  side: BracketSide;
  /** Display / layout slot ids */
  homeSlot: string;
  awaySlot: string;
  /** Legacy — next-round slot key (derived from feeders in match-centric model) */
  winnerSlot: string;
  order: number;
  /** For R16+: previous match whose winner fills home */
  feederHomeMatchKey?: string;
  /** For R16+: previous match whose winner fills away */
  feederAwayMatchKey?: string;
}

const ROUND_LABELS: Record<KnockoutRound, string> = {
  ROUND_OF_32: "Round of 32",
  ROUND_OF_16: "Round of 16",
  QUARTER_FINALS: "Quarter Finals",
  SEMI_FINALS: "Semi Finals",
  FINAL: "Final",
  CHAMPION: "Champion",
};

export function getRoundLabel(round: KnockoutRound): string {
  return ROUND_LABELS[round];
}

function buildSideBracket(side: "left" | "right"): {
  slots: KnockoutSlotDef[];
  matches: KnockoutMatchDef[];
} {
  const slots: KnockoutSlotDef[] = [];
  const matches: KnockoutMatchDef[] = [];
  const p = side === "left" ? "l" : "r";

  for (let i = 0; i < 16; i++) {
    slots.push({
      key: `r32-${p}-${i}`,
      round: "ROUND_OF_32",
      side,
      order: i,
    });
  }

  for (let m = 0; m < 8; m++) {
    matches.push({
      key: `r32-m-${p}-${m}`,
      round: "ROUND_OF_32",
      matchday: 4,
      side,
      homeSlot: `r32-${p}-${m * 2}`,
      awaySlot: `r32-${p}-${m * 2 + 1}`,
      winnerSlot: `r16-${p}-${m}`,
      order: m,
    });
  }

  for (let i = 0; i < 8; i++) {
    slots.push({
      key: `r16-${p}-${i}`,
      round: "ROUND_OF_16",
      side,
      order: i,
    });
  }

  for (let m = 0; m < 4; m++) {
    matches.push({
      key: `r16-m-${p}-${m}`,
      round: "ROUND_OF_16",
      matchday: 5,
      side,
      homeSlot: `r16-${p}-${m * 2}`,
      awaySlot: `r16-${p}-${m * 2 + 1}`,
      winnerSlot: `qf-${p}-${m}`,
      feederHomeMatchKey: `r32-m-${p}-${m * 2}`,
      feederAwayMatchKey: `r32-m-${p}-${m * 2 + 1}`,
      order: m,
    });
  }

  for (let i = 0; i < 4; i++) {
    slots.push({
      key: `qf-${p}-${i}`,
      round: "QUARTER_FINALS",
      side,
      order: i,
    });
  }

  for (let m = 0; m < 2; m++) {
    matches.push({
      key: `qf-m-${p}-${m}`,
      round: "QUARTER_FINALS",
      matchday: 6,
      side,
      homeSlot: `qf-${p}-${m * 2}`,
      awaySlot: `qf-${p}-${m * 2 + 1}`,
      winnerSlot: `sf-${p}-${m}`,
      feederHomeMatchKey: `r16-m-${p}-${m * 2}`,
      feederAwayMatchKey: `r16-m-${p}-${m * 2 + 1}`,
      order: m,
    });
  }

  for (let i = 0; i < 2; i++) {
    slots.push({
      key: `sf-${p}-${i}`,
      round: "SEMI_FINALS",
      side,
      order: i,
    });
  }

  matches.push({
    key: `sf-m-${p}-0`,
    round: "SEMI_FINALS",
    matchday: 7,
    side,
    homeSlot: `sf-${p}-0`,
    awaySlot: `sf-${p}-1`,
    winnerSlot: `final-${side === "left" ? "0" : "1"}`,
    feederHomeMatchKey: `qf-m-${p}-0`,
    feederAwayMatchKey: `qf-m-${p}-1`,
    order: 0,
  });

  return { slots, matches };
}

const left = buildSideBracket("left");
const right = buildSideBracket("right");

const centerSlots: KnockoutSlotDef[] = [
  { key: "final-0", round: "FINAL", side: "center", order: 0 },
  { key: "final-1", round: "FINAL", side: "center", order: 1 },
  { key: "champion", round: "CHAMPION", side: "center", order: 0 },
];

const centerMatches: KnockoutMatchDef[] = [
  {
    key: "final-m-0",
    round: "FINAL",
    matchday: 8,
    side: "center",
    homeSlot: "final-0",
    awaySlot: "final-1",
    winnerSlot: "champion",
    feederHomeMatchKey: "sf-m-l-0",
    feederAwayMatchKey: "sf-m-r-0",
    order: 0,
  },
];

export const KNOCKOUT_SLOTS: KnockoutSlotDef[] = [
  ...left.slots,
  ...right.slots,
  ...centerSlots,
];

export const KNOCKOUT_MATCHES: KnockoutMatchDef[] = [
  ...left.matches,
  ...right.matches,
  ...centerMatches,
];

export const KNOCKOUT_SLOT_BY_KEY = new Map(KNOCKOUT_SLOTS.map((s) => [s.key, s]));
export const KNOCKOUT_MATCH_BY_KEY = new Map(KNOCKOUT_MATCHES.map((m) => [m.key, m]));

export const KNOCKOUT_MATCHDAYS = [4, 5, 6, 7, 8] as const;

/** Only Round of 32 slots accept manual team placement. */
export function isManualSlot(slotKey: string): boolean {
  return slotKey.startsWith("r32-");
}

export function isR32Match(def: KnockoutMatchDef): boolean {
  return def.round === "ROUND_OF_32";
}

export function getMatchForSlot(slotKey: string): KnockoutMatchDef | undefined {
  return KNOCKOUT_MATCHES.find((m) => m.homeSlot === slotKey || m.awaySlot === slotKey);
}

export interface BracketSideRoundColumn {
  round: KnockoutRound;
  label: string;
  matchKeys: string[];
  /** Single finalist slot key (left = final-0, right = final-1) */
  finalistSlotKey?: string;
}

/** One column per round — each match appears exactly once (no feeder duplication). */
export function getBracketSideColumns(side: "left" | "right"): BracketSideRoundColumn[] {
  const sideMatches = KNOCKOUT_MATCHES.filter((m) => m.side === side).sort(
    (a, b) => a.order - b.order
  );

  const byRound = (round: KnockoutRound) =>
    sideMatches.filter((m) => m.round === round).map((m) => m.key);

  return [
    { round: "ROUND_OF_32", label: "Round of 32", matchKeys: byRound("ROUND_OF_32") },
    { round: "ROUND_OF_16", label: "Round of 16", matchKeys: byRound("ROUND_OF_16") },
    { round: "QUARTER_FINALS", label: "Quarter Finals", matchKeys: byRound("QUARTER_FINALS") },
    { round: "SEMI_FINALS", label: "Semi Finals", matchKeys: byRound("SEMI_FINALS") },
    {
      round: "FINAL",
      label: "Finalist",
      matchKeys: [],
      finalistSlotKey: side === "left" ? "final-0" : "final-1",
    },
  ];
}
