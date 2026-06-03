"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { invalidateLeagueRankIndex } from "@/lib/rankings/league-rank-index";
const updateProfileSchema = z.object({
  username: z.string().trim().min(2).max(32),
  teamName: z.string().trim().min(2).max(64),
});

export type ProfileActionResult =
  | { ok: true; username: string; teamName: string }
  | { ok: false; error: string };

function revalidateProfilePaths() {
  revalidatePath("/profile");
  revalidatePath("/profile/overview");
  revalidatePath("/profile/records");
  revalidatePath("/profile/squad");
  revalidatePath("/profile/predictions");
  revalidatePath("/profile/achievements");
  revalidatePath("/my-team");
  revalidatePath("/my-team/rankings");
  revalidatePath("/my-team/team");
  revalidatePath("/bets");
}

export async function updateProfileAction(
  input: z.infer<typeof updateProfileSchema>
): Promise<ProfileActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized." };

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid profile data." };

  const { username, teamName } = parsed.data;
  const userId = session.user.id;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { username, teamName },
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

  invalidateLeagueRankIndex();
  revalidateProfilePaths();

  return { ok: true, username, teamName };
}
