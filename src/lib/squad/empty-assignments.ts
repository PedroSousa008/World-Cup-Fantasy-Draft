import type { FormationId } from "@/lib/squad/formations";
import { buildAllSlots, getFormation } from "@/lib/squad/formations";

export function getEmptyAssignments(
  formationId: FormationId = "4-3-3"
): Record<string, string | null> {
  const formation = getFormation(formationId);
  const slots = buildAllSlots(formation);
  const assignments: Record<string, string | null> = {};
  for (const slot of slots) assignments[slot.id] = null;
  return assignments;
}
