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
  homeSlot: string;
  awaySlot: string;
  winnerSlot: string;
  order: number;
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

/** Slots fed only by match winners (not manually assigned). */
export function isManualSlot(slotKey: string): boolean {
  return slotKey.startsWith("r32-");
}

export function getMatchForSlot(slotKey: string): KnockoutMatchDef | undefined {
  return KNOCKOUT_MATCHES.find((m) => m.homeSlot === slotKey || m.awaySlot === slotKey);
}
