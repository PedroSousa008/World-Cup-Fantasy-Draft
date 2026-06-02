import { prisma } from "@/lib/db/prisma";
import type { FormationId } from "@/lib/squad/formations";
import { buildAllSlots, buildStarterSlots, getFormation } from "@/lib/squad/formations";
import { orderToSlotId, slotIdToOrder, UNASSIGNED_SLOT_ORDER } from "@/lib/squad/slot-keys";

export type SlotAssignments = Record<string, string | null>;

export async function getNationMatchStartMap(
  matchday: number
): Promise<Map<string, Date>> {
  const matches = await prisma.match.findMany({
    where: { matchday },
    select: { homeTeamId: true, awayTeamId: true, scheduledAt: true },
  });

  const map = new Map<string, Date>();
  for (const m of matches) {
    for (const teamId of [m.homeTeamId, m.awayTeamId]) {
      const prev = map.get(teamId);
      if (!prev || m.scheduledAt < prev) {
        map.set(teamId, m.scheduledAt);
      }
    }
  }
  return map;
}

/** True once the player's nation has kicked off this matchday. */
export async function hasPlayerNationMatchStarted(
  playerId: string,
  matchday: number,
  now = new Date()
): Promise<boolean> {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { nationalTeamId: true },
  });
  if (!player?.nationalTeamId) return false;

  const kickoffs = await getNationMatchStartMap(matchday);
  const kickoff = kickoffs.get(player.nationalTeamId);
  if (!kickoff) return false;
  return kickoff.getTime() <= now.getTime();
}

export async function getUserMatchdayAssignments(
  userId: string,
  matchday: number,
  formationId: FormationId
): Promise<{ assignments: SlotAssignments; promotedPlayerIds: string[] }> {
  const saved = await prisma.userMatchdaySquad.findUnique({
    where: { userId_matchday: { userId, matchday } },
  });

  if (saved?.assignments && typeof saved.assignments === "object") {
    return {
      assignments: saved.assignments as SlotAssignments,
      promotedPlayerIds: saved.promotedPlayerIds ?? [],
    };
  }

  const team = await prisma.fantasyTeam.findUnique({
    where: { userId },
    include: { players: true },
  });

  const slots = buildAllSlots(getFormation(formationId));
  const assignments: SlotAssignments = {};
  for (const slot of slots) assignments[slot.id] = null;

  if (team) {
    for (const row of team.players) {
      if (row.slotOrder === UNASSIGNED_SLOT_ORDER) continue;
      const slotId = orderToSlotId(row.slotOrder, formationId);
      if (slotId) assignments[slotId] = row.playerId;
    }
  }

  return { assignments, promotedPlayerIds: [] };
}

/** Active Starting XI player IDs for user matchday scoring. */
export async function getActiveStarterPlayerIds(
  userId: string,
  matchday: number,
  formationId: FormationId = "4-3-3"
): Promise<string[]> {
  const { assignments } = await getUserMatchdayAssignments(userId, matchday, formationId);
  const starterSlots = buildStarterSlots(getFormation(formationId));
  const ids: string[] = [];
  for (const slot of starterSlots) {
    const pid = assignments[slot.id];
    if (pid) ids.push(pid);
  }
  return ids;
}

export async function upsertUserMatchdaySquad(
  userId: string,
  matchday: number,
  assignments: SlotAssignments,
  promotedPlayerIds: string[]
): Promise<void> {
  await prisma.userMatchdaySquad.upsert({
    where: { userId_matchday: { userId, matchday } },
    create: {
      userId,
      matchday,
      assignments,
      promotedPlayerIds,
    },
    update: {
      assignments,
      promotedPlayerIds,
    },
  });
}

export interface SubstitutionValidation {
  ok: boolean;
  error?: string;
}

export async function validateMatchdaySubstitution(
  userId: string,
  matchday: number,
  formationId: FormationId,
  outSlotId: string,
  inSlotId: string,
  assignments: SlotAssignments,
  promotedPlayerIds: string[]
): Promise<SubstitutionValidation> {
  const formation = getFormation(formationId);
  const slots = buildAllSlots(formation);
  const outSlot = slots.find((s) => s.id === outSlotId);
  const inSlot = slots.find((s) => s.id === inSlotId);

  if (!outSlot || !inSlot) return { ok: false, error: "Invalid slot." };
  if (outSlot.zone !== "starter" || inSlot.zone !== "bench") {
    return { ok: false, error: "Swap must be Starting XI ↔ Bench." };
  }

  const outPlayerId = assignments[outSlotId];
  const inPlayerId = assignments[inSlotId];
  if (!outPlayerId || !inPlayerId) {
    return { ok: false, error: "Both slots must have players." };
  }

  const [outPlayer, inPlayer] = await Promise.all([
    prisma.player.findUnique({ where: { id: outPlayerId }, select: { position: true } }),
    prisma.player.findUnique({ where: { id: inPlayerId }, select: { position: true } }),
  ]);

  if (!outPlayer || !inPlayer) return { ok: false, error: "Player not found." };
  if (outPlayer.position !== inPlayer.position) {
    return { ok: false, error: "Substitutions must be same position only." };
  }

  if (promotedPlayerIds.includes(inPlayerId)) {
    return {
      ok: false,
      error: "This bench player already entered the Starting XI this matchday.",
    };
  }

  const inStarted = await hasPlayerNationMatchStarted(inPlayerId, matchday);
  if (inStarted) {
    return {
      ok: false,
      error: "Bench player's match has already started — cannot bring into Starting XI.",
    };
  }

  return { ok: true };
}

export function applySubstitution(
  assignments: SlotAssignments,
  outSlotId: string,
  inSlotId: string,
  promotedPlayerIds: string[]
): { assignments: SlotAssignments; promotedPlayerIds: string[] } {
  const next = { ...assignments };
  const outPid = next[outSlotId];
  const inPid = next[inSlotId];
  next[outSlotId] = inPid ?? null;
  next[inSlotId] = outPid ?? null;

  const promoted = new Set(promotedPlayerIds);
  if (inPid) promoted.add(inPid);

  return { assignments: next, promotedPlayerIds: [...promoted] };
}
