"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import type { FormationId } from "@/lib/squad/formations";
import { FORMATIONS } from "@/lib/squad/formations";
import {
  applySubstitution,
  getUserMatchdayAssignments,
  upsertUserMatchdaySquad,
  validateMatchdaySubstitution,
} from "@/lib/squad/matchday-squad";

const formationIds = FORMATIONS.map((f) => f.id) as [FormationId, ...FormationId[]];

export type SquadMdActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function matchdaySubstituteAction(
  matchday: number,
  formationId: FormationId,
  outSlotId: string,
  inSlotId: string
): Promise<SquadMdActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  if (!formationIds.includes(formationId)) {
    return { ok: false, error: "Invalid formation." };
  }

  const userId = session.user.id;
  const { assignments, promotedPlayerIds } = await getUserMatchdayAssignments(
    userId,
    matchday,
    formationId
  );

  const validation = await validateMatchdaySubstitution(
    userId,
    matchday,
    formationId,
    outSlotId,
    inSlotId,
    assignments,
    promotedPlayerIds
  );

  if (!validation.ok) return { ok: false, error: validation.error ?? "Invalid substitution." };

  const { assignments: nextAssignments, promotedPlayerIds: nextPromoted } = applySubstitution(
    assignments,
    outSlotId,
    inSlotId,
    promotedPlayerIds
  );

  const outPid = assignments[outSlotId]!;
  const inPid = assignments[inSlotId]!;

  await prisma.$transaction(async (tx) => {
    await tx.matchdaySubstitution.create({
      data: {
        userId,
        matchday,
        outPlayerId: outPid,
        inPlayerId: inPid,
        outSlotId,
        inSlotId,
      },
    });
    await tx.userMatchdaySquad.upsert({
      where: { userId_matchday: { userId, matchday } },
      create: {
        userId,
        matchday,
        assignments: nextAssignments,
        promotedPlayerIds: nextPromoted,
      },
      update: {
        assignments: nextAssignments,
        promotedPlayerIds: nextPromoted,
      },
    });
  });

  await syncFantasyTeamFromAssignments(userId, formationId, nextAssignments);

  revalidatePath("/my-team");
  revalidatePath("/my-team/team");
  return { ok: true };
}

async function syncFantasyTeamFromAssignments(
  userId: string,
  formationId: FormationId,
  assignments: Record<string, string | null>
) {
  const team = await prisma.fantasyTeam.findUnique({ where: { userId } });
  if (!team) return;

  const { buildLineupPayload } = await import("@/lib/squad/slot-keys");
  const lineup = buildLineupPayload(formationId, assignments);

  for (const row of lineup) {
    await prisma.fantasyTeamPlayer.updateMany({
      where: { fantasyTeamId: team.id, playerId: row.playerId },
      data: { isStarter: row.isStarter, slotOrder: row.slotOrder },
    });
  }
}
