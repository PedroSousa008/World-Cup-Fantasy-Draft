import type { PlayerPosition as PrismaPlayerPosition } from "@prisma/client";

/** Locked positions — GK/DEF/MID/FWD map to display labels everywhere. */
export type PlayerPosition = PrismaPlayerPosition;

export const PLAYER_POSITIONS = [
  { value: "GK" as const, label: "Goalkeeper" },
  { value: "DEF" as const, label: "Defender" },
  { value: "MID" as const, label: "Midfielder" },
  { value: "FWD" as const, label: "Attacker" },
] as const;

export const POSITION_LABEL: Record<PlayerPosition, string> = {
  GK: "Goalkeeper",
  DEF: "Defender",
  MID: "Midfielder",
  FWD: "Attacker",
};

export function getPositionLabel(position: PlayerPosition | string): string {
  return POSITION_LABEL[position as PlayerPosition] ?? String(position);
}

export function isValidPlayerPosition(value: string): value is PlayerPosition {
  return value === "GK" || value === "DEF" || value === "MID" || value === "FWD";
}
