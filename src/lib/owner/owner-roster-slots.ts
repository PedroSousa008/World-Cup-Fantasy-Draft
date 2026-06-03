import type { PlayerPosition } from "@/lib/players/types";
import { getPositionLabel } from "@/lib/players/types";

/** Dedicated slotOrder values for Owner roster assignment (18 slots). */
export const OWNER_ROSTER_SLOT_ORDER_MIN = 50;
export const OWNER_ROSTER_SLOT_ORDER_MAX = 67;

export interface OwnerRosterSlotDef {
  slotOrder: number;
  position: PlayerPosition;
  groupLabel: string;
}

const GROUPS: { position: PlayerPosition; count: number; label: string }[] = [
  { position: "GK", count: 2, label: "Goalkeepers" },
  { position: "DEF", count: 6, label: "Defenders" },
  { position: "MID", count: 5, label: "Midfielders" },
  { position: "FWD", count: 5, label: "Attackers" },
];

function buildSlots(): OwnerRosterSlotDef[] {
  const slots: OwnerRosterSlotDef[] = [];
  let order = OWNER_ROSTER_SLOT_ORDER_MIN;
  for (const group of GROUPS) {
    for (let i = 0; i < group.count; i++) {
      slots.push({
        slotOrder: order++,
        position: group.position,
        groupLabel: group.label,
      });
    }
  }
  return slots;
}

export const OWNER_ROSTER_SLOTS = buildSlots();

export const OWNER_ROSTER_SLOT_ORDERS = new Set(
  OWNER_ROSTER_SLOTS.map((s) => s.slotOrder)
);

export function isOwnerRosterSlotOrder(order: number): boolean {
  return OWNER_ROSTER_SLOT_ORDERS.has(order);
}

export function getOwnerRosterSlotByOrder(
  slotOrder: number
): OwnerRosterSlotDef | undefined {
  return OWNER_ROSTER_SLOTS.find((s) => s.slotOrder === slotOrder);
}

export function getOwnerRosterGroups(): {
  label: string;
  position: PlayerPosition;
  slots: OwnerRosterSlotDef[];
}[] {
  const groups: {
    label: string;
    position: PlayerPosition;
    slots: OwnerRosterSlotDef[];
  }[] = [];
  for (const group of GROUPS) {
    groups.push({
      label: group.label,
      position: group.position,
      slots: OWNER_ROSTER_SLOTS.filter((s) => s.position === group.position),
    });
  }
  return groups;
}

export function positionMatchesOwnerSlot(
  playerPosition: PlayerPosition,
  slotOrder: number
): boolean {
  const slot = getOwnerRosterSlotByOrder(slotOrder);
  return slot?.position === playerPosition;
}

export function getOwnerRosterPositionLabel(position: PlayerPosition): string {
  return getPositionLabel(position);
}
