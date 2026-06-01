"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function savePlayerAction(playerId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in" };

  const player = await prisma.player.findUnique({ where: { id: playerId } });
  if (!player) return { ok: false, error: "Player not found" };

  await prisma.savedPlayer.upsert({
    where: {
      userId_playerId: { userId: session.user.id, playerId },
    },
    create: { userId: session.user.id, playerId },
    update: {},
  });

  revalidatePath("/my-team/draft");
  revalidatePath(`/my-team/player/${playerId}`);
  return { ok: true };
}

export async function unsavePlayerAction(playerId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in" };

  await prisma.savedPlayer.deleteMany({
    where: { userId: session.user.id, playerId },
  });

  revalidatePath("/my-team/draft");
  revalidatePath(`/my-team/player/${playerId}`);
  return { ok: true };
}
