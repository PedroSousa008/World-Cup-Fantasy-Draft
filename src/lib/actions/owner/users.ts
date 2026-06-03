"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { WORLD_CUP_NATIONS } from "@/lib/nations/world-cup-nations";
import type { OwnerActionResult } from "@/lib/actions/owner/helpers";
import { requireOwnerSession } from "@/lib/actions/owner/helpers";
import { getOwnerUserAutomaticPoints } from "@/lib/owner/get-users-data";

const NATION_NAMES = new Set(WORLD_CUP_NATIONS.map((n) => n.name));

const updateUserSchema = z.object({
  userId: z.string().min(1),
  username: z.string().trim().min(2).max(32),
  teamName: z.string().trim().min(2).max(64),
  selectedNation: z.string().trim().min(1),
  totalPoints: z.number().int(),
});

function revalidateUserPaths() {
  revalidatePath("/owner/users");
  revalidatePath("/owner");
  revalidatePath("/my-team");
  revalidatePath("/my-team/rankings");
  revalidatePath("/profile");
}

export async function updateOwnerUserAction(
  input: z.infer<typeof updateUserSchema>
): Promise<OwnerActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Unauthorized." };

  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid user data." };

  const { userId, username, teamName, selectedNation, totalPoints } = parsed.data;

  if (!NATION_NAMES.has(selectedNation)) {
    return { ok: false, error: "Selected nation is not valid." };
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true },
  });
  if (!existing) return { ok: false, error: "User not found." };

  const automaticPoints = await getOwnerUserAutomaticPoints(userId);
  if (automaticPoints == null) return { ok: false, error: "User not found." };

  const manualPointsAdjustment = totalPoints - automaticPoints;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        teamName,
        selectedNation,
        manualPointsAdjustment,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, error: "Username is already taken." };
    }
    throw error;
  }

  revalidateUserPaths();
  return { ok: true };
}

export async function deleteOwnerUserAction(userId: string): Promise<OwnerActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Unauthorized." };

  if (!userId) return { ok: false, error: "Invalid user." };
  if (userId === owner.id) return { ok: false, error: "You cannot delete your own account." };

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, username: true },
  });
  if (!target) return { ok: false, error: "User not found." };
  if (target.role === UserRole.OWNER) {
    return { ok: false, error: "Owner accounts cannot be deleted." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.bet.deleteMany({
        where: { OR: [{ creatorId: userId }, { opponentId: userId }] },
      });
      await tx.calendarEvent.updateMany({
        where: { createdById: userId },
        data: { createdById: null },
      });
      await tx.user.delete({ where: { id: userId } });
    });
  } catch {
    return { ok: false, error: "Could not delete user. Try again." };
  }

  revalidateUserPaths();
  return { ok: true };
}
