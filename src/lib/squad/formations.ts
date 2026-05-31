export type FormationId =
  | "3-4-3"
  | "3-5-2"
  | "4-3-3"
  | "4-4-2"
  | "4-5-1"
  | "5-3-2"
  | "5-4-1";

export interface FormationShape {
  id: FormationId;
  label: string;
  def: number;
  mid: number;
  fwd: number;
}

export const FORMATIONS: FormationShape[] = [
  { id: "3-4-3", label: "3-4-3", def: 3, mid: 4, fwd: 3 },
  { id: "3-5-2", label: "3-5-2", def: 3, mid: 5, fwd: 2 },
  { id: "4-3-3", label: "4-3-3", def: 4, mid: 3, fwd: 3 },
  { id: "4-4-2", label: "4-4-2", def: 4, mid: 4, fwd: 2 },
  { id: "4-5-1", label: "4-5-1", def: 4, mid: 5, fwd: 1 },
  { id: "5-3-2", label: "5-3-2", def: 5, mid: 3, fwd: 2 },
  { id: "5-4-1", label: "5-4-1", def: 5, mid: 4, fwd: 1 },
];

export const SQUAD_LIMITS = {
  total: 18,
  starters: 11,
  bench: 7,
  GK: 2,
  DEF: 6,
  MID: 5,
  FWD: 5,
} as const;

export function getFormation(id: FormationId): FormationShape {
  return FORMATIONS.find((f) => f.id === id) ?? FORMATIONS[2];
}

export type SlotZone = "starter" | "bench";

export interface SquadSlot {
  id: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  zone: SlotZone;
  index: number;
}

export function buildStarterSlots(formation: FormationShape): SquadSlot[] {
  const slots: SquadSlot[] = [
    { id: "gk-0", position: "GK", zone: "starter", index: 0 },
  ];
  for (let i = 0; i < formation.def; i++) {
    slots.push({ id: `def-${i}`, position: "DEF", zone: "starter", index: i });
  }
  for (let i = 0; i < formation.mid; i++) {
    slots.push({ id: `mid-${i}`, position: "MID", zone: "starter", index: i });
  }
  for (let i = 0; i < formation.fwd; i++) {
    slots.push({ id: `fwd-${i}`, position: "FWD", zone: "starter", index: i });
  }
  return slots;
}

export function buildBenchSlots(): SquadSlot[] {
  return Array.from({ length: SQUAD_LIMITS.bench }, (_, i) => ({
    id: `bench-${i}`,
    position: "GK" as const, // flexible bench — any position allowed
    zone: "bench" as const,
    index: i,
  }));
}

export function buildAllSlots(formation: FormationShape): SquadSlot[] {
  return [...buildStarterSlots(formation), ...buildBenchSlots()];
}

export function slotLabel(position: string, zone: SlotZone): string {
  if (zone === "bench") return "Add Player";
  const map: Record<string, string> = {
    GK: "Add Goalkeeper",
    DEF: "Add Defender",
    MID: "Add Midfielder",
    FWD: "Add Forward",
  };
  return map[position] ?? "Add Player";
}
