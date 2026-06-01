"use server";

import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { PlayerPosition } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { buildPlayerPhotoPath } from "@/lib/players/photo";
import { isValidPlayerPosition } from "@/lib/players/types";
import type { OwnerActionResult } from "@/lib/actions/owner/helpers";
import { requireOwnerSession } from "@/lib/actions/owner/helpers";
import { ensureNationSchema } from "@/lib/db/ensure-nation-schema";

function revalidatePlayerPaths() {
  revalidatePath("/my-team/draft");
  revalidatePath("/my-team/rankings");
  revalidatePath("/owner/players");
}

export async function createPlayerAction(input: {
  name: string;
  position: string;
  nationSlug: string;
  club?: string;
}): Promise<OwnerActionResult<{ playerId: string }>> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Owner access required." };

  const schema = await ensureNationSchema();
  if (!schema.ok) return { ok: false, error: schema.error };

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Player name is required." };
  if (!isValidPlayerPosition(input.position)) {
    return { ok: false, error: "Invalid position." };
  }

  const nation = await prisma.nationalTeam.findUnique({
    where: { slug: input.nationSlug },
  });
  if (!nation) return { ok: false, error: "Nation not found." };
  if (!nation.isActive) return { ok: false, error: "Nation is inactive." };

  const player = await prisma.player.create({
    data: {
      name,
      position: input.position as PlayerPosition,
      positionLocked: true,
      nationality: nation.name,
      nationalTeamId: nation.id,
      club: input.club?.trim() || null,
    },
  });

  revalidatePlayerPaths();
  revalidatePath(`/owner/players/${nation.slug}`);
  return { ok: true, data: { playerId: player.id } };
}

export async function updatePlayerAction(input: {
  playerId: string;
  name?: string;
  club?: string;
  /** Owner may change position; resets lock semantics for admin edit only */
  position?: string;
}): Promise<OwnerActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Owner access required." };

  const player = await prisma.player.findUnique({
    where: { id: input.playerId },
    include: { nationalTeam: true },
  });
  if (!player) return { ok: false, error: "Player not found." };

  if (input.position !== undefined) {
    if (!isValidPlayerPosition(input.position)) {
      return { ok: false, error: "Invalid position." };
    }
    if (player.positionLocked && input.position !== player.position) {
      // Owner override allowed
    }
  }

  await prisma.player.update({
    where: { id: input.playerId },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.club !== undefined ? { club: input.club.trim() || null } : {}),
      ...(input.position !== undefined
        ? { position: input.position as PlayerPosition, positionLocked: true }
        : {}),
    },
  });

  revalidatePlayerPaths();
  if (player.nationalTeam) {
    revalidatePath(`/owner/players/${player.nationalTeam.slug}`);
  }
  return { ok: true };
}

export async function deletePlayerAction(playerId: string): Promise<OwnerActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Owner access required." };

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: { nationalTeam: true, fantasySlots: true },
  });
  if (!player) return { ok: false, error: "Player not found." };
  if (player.fantasySlots.length > 0) {
    return { ok: false, error: "Unassign player from all teams before deleting." };
  }

  await prisma.player.delete({ where: { id: playerId } });
  revalidatePlayerPaths();
  if (player.nationalTeam) {
    revalidatePath(`/owner/players/${player.nationalTeam.slug}`);
  }
  return { ok: true };
}

export async function assignPlayerToUserAction(input: {
  playerId: string;
  userId: string;
}): Promise<OwnerActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Owner access required." };

  const [player, team] = await Promise.all([
    prisma.player.findUnique({
      where: { id: input.playerId },
      include: { fantasySlots: true, nationalTeam: true },
    }),
    prisma.fantasyTeam.findUnique({ where: { userId: input.userId } }),
  ]);

  if (!player) return { ok: false, error: "Player not found." };
  if (!team) return { ok: false, error: "User has no fantasy team." };
  if (player.fantasySlots.length > 0) {
    return { ok: false, error: "Player is already assigned to a team." };
  }

  await prisma.fantasyTeamPlayer.create({
    data: {
      fantasyTeamId: team.id,
      playerId: player.id,
      isStarter: false,
    },
  });

  revalidatePlayerPaths();
  revalidatePath("/my-team/team");
  return { ok: true };
}

export async function unassignPlayerAction(playerId: string): Promise<OwnerActionResult> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Owner access required." };

  await prisma.fantasyTeamPlayer.deleteMany({ where: { playerId } });
  revalidatePlayerPaths();
  return { ok: true };
}

export async function uploadPlayerPhotoAction(
  formData: FormData
): Promise<OwnerActionResult<{ photoUrl: string }>> {
  const owner = await requireOwnerSession();
  if (!owner) return { ok: false, error: "Owner access required." };

  const playerId = String(formData.get("playerId") ?? "");
  const file = formData.get("file");
  if (!playerId || !(file instanceof File)) {
    return { ok: false, error: "Player and image file are required." };
  }

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: { nationalTeam: true },
  });
  if (!player?.nationalTeam) {
    return { ok: false, error: "Player must belong to a nation." };
  }

  const slug = player.nationalTeam.slug;
  const ext = path.extname(file.name) || ".jpg";
  const safeName = `${player.id}${ext.toLowerCase()}`;
  const photoUrl = buildPlayerPhotoPath(slug, safeName);

  const dir = path.join(process.cwd(), "public", "players", slug);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, safeName), buffer);

  await prisma.player.update({
    where: { id: playerId },
    data: { photoUrl },
  });

  revalidatePlayerPaths();
  revalidatePath(`/owner/players/${slug}`);
  return { ok: true, data: { photoUrl } };
}
