import type { FormationId, FormationShape } from "@/lib/squad/formations";
import { buildAllSlots, getFormation } from "@/lib/squad/formations";

/** Players not placed on the pitch/bench yet. */
export const UNASSIGNED_SLOT_ORDER = -1;

export function slotIdToOrder(slotId: string): number {
  const [kind, idxStr] = slotId.split("-");
  const idx = parseInt(idxStr, 10);
  if (kind === "gk") return 0;
  if (kind === "def") return 10 + idx;
  if (kind === "mid") return 20 + idx;
  if (kind === "fwd") return 30 + idx;
  if (kind === "bench") return 40 + idx;
  return UNASSIGNED_SLOT_ORDER;
}

export function orderToSlotId(
  order: number,
  formationId: FormationId
): string | null {
  if (order === UNASSIGNED_SLOT_ORDER) return null;
  const formation = getFormation(formationId);
  const slots = buildAllSlots(formation);
  for (const slot of slots) {
    if (slotIdToOrder(slot.id) === order) return slot.id;
  }
  return null;
}

export function buildAssignmentsFromDb(
  formationId: FormationId,
  lineup: { playerId: string; slotOrder: number; isStarter: boolean }[]
): Record<string, string | null> {
  const formation = getFormation(formationId);
  const slots = buildAllSlots(formation);
  const assignments: Record<string, string | null> = {};
  for (const slot of slots) assignments[slot.id] = null;

  for (const row of lineup) {
    if (row.slotOrder === UNASSIGNED_SLOT_ORDER) continue;
    const slotId = orderToSlotId(row.slotOrder, formationId);
    if (slotId) assignments[slotId] = row.playerId;
  }

  return assignments;
}

export function buildLineupPayload(
  formationId: FormationId,
  assignments: Record<string, string | null>
): { playerId: string; slotOrder: number; isStarter: boolean }[] {
  const formation: FormationShape = getFormation(formationId);
  const slots = buildAllSlots(formation);
  const payload: { playerId: string; slotOrder: number; isStarter: boolean }[] = [];

  for (const slot of slots) {
    const playerId = assignments[slot.id];
    if (!playerId) continue;
    payload.push({
      playerId,
      slotOrder: slotIdToOrder(slot.id),
      isStarter: slot.zone === "starter",
    });
  }

  return payload;
}

export const FORMATION_STORAGE_KEY = "wc-fantasy-formation";
