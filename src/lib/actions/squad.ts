"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import {
  buildLineupPayload,
  UNASSIGNED_SLOT_ORDER,
} from "@/lib/squad/slot-keys";
import { FORMATIONS, type FormationId } from "@/lib/squad/formations";
import { isTeamManagementLocked } from "@/lib/tournament/matchday-lock";

const formationIds = FORMATIONS.map((f) => f.id) as [FormationId, ...FormationId[]];

const saveLineupSchema = z.object({
  formationId: z.enum(formationIds),
  assignments: z.record(z.string(), z.string().nullable()),
  captainId: z.string().nullable(),
  viceCaptainId: z.string().nullable(),
});

export type SquadActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function requireUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function saveSquadLineupAction(
  input: z.infer<typeof saveLineupSchema>
): Promise<SquadActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "Not signed in." };

  if (await isTeamManagementLocked()) {
    return { ok: false, error: "Team changes are locked for the current matchday." };
  }

  const parsed = saveLineupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid squad data." };

  const team = await prisma.fantasyTeam.findUnique({
    where: { userId },
    include: { players: true },
  });
  if (!team) return { ok: false, error: "No fantasy team." };

  const assignedIds = new Set(team.players.map((p) => p.playerId));
  const lineup = buildLineupPayload(parsed.data.formationId, parsed.data.assignments);

  for (const row of lineup) {
    if (!assignedIds.has(row.playerId)) {
      return { ok: false, error: "You can only place players assigned to your team." };
    }
  }

  const placedIds = new Set(lineup.map((r) => r.playerId));
  const captainId = parsed.data.captainId;
  const viceCaptainId = parsed.data.viceCaptainId;

  if (captainId && !placedIds.has(captainId) && !assignedIds.has(captainId)) {
    return { ok: false, error: "Invalid captain." };
  }
  if (viceCaptainId && !placedIds.has(viceCaptainId) && !assignedIds.has(viceCaptainId)) {
    return { ok: false, error: "Invalid vice-captain." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.fantasyTeam.update({
      where: { id: team.id },
      data: {
        captainId: captainId && assignedIds.has(captainId) ? captainId : null,
        viceCaptainId:
          viceCaptainId && assignedIds.has(viceCaptainId) ? viceCaptainId : null,
      },
    });

    for (const ftp of team.players) {
      const inLineup = lineup.find((r) => r.playerId === ftp.playerId);
      if (inLineup) {
        await tx.fantasyTeamPlayer.update({
          where: { id: ftp.id },
          data: {
            isStarter: inLineup.isStarter,
            slotOrder: inLineup.slotOrder,
          },
        });
      } else {
        await tx.fantasyTeamPlayer.update({
          where: { id: ftp.id },
          data: {
            isStarter: false,
            slotOrder: UNASSIGNED_SLOT_ORDER,
          },
        });
      }
    }
  });

  revalidatePath("/my-team");
  revalidatePath("/my-team/team");
  return { ok: true };
}
