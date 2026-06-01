import { access } from "node:fs/promises";
import path from "node:path";
import { PlayerPosition } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { buildPlayerPhotoPath } from "@/lib/players/photo";
import { parsePositionInput } from "@/lib/players/position-parse";
import { ensureNationSchema } from "@/lib/db/ensure-nation-schema";

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

export interface RegisterPlayerInput {
  nationSlug: string;
  imageFilename: string;
  name: string;
  position: string;
}

export interface RegisterPlayerResult {
  playerId: string;
  photoUrl: string;
  nationName: string;
  position: PlayerPosition;
  created: boolean;
}

function publicImagePath(nationSlug: string, filename: string): string {
  const base = filename.replace(/^\/+/, "").split("/").pop() ?? filename;
  return path.join(process.cwd(), "public", "players", nationSlug, base);
}

export async function assertPlayerImageOnDisk(
  nationSlug: string,
  imageFilename: string
): Promise<void> {
  const filePath = publicImagePath(nationSlug, imageFilename);
  try {
    await access(filePath);
  } catch {
    throw new Error(
      `Image not found at public/players/${nationSlug}/${imageFilename}. Add the file first, then register.`
    );
  }

  const ext = path.extname(filePath).toLowerCase();
  if (!IMAGE_EXT.has(ext)) {
    throw new Error(`Unsupported image type "${ext}". Use png, jpg, jpeg, or webp.`);
  }
}

/**
 * Register (or update) a player from a file already saved under public/players/{nationSlug}/.
 * Nation is determined by folder slug — links player to NationalTeam for match scoring.
 */
export async function registerPlayerFromFile(
  input: RegisterPlayerInput
): Promise<RegisterPlayerResult> {
  const schema = await ensureNationSchema();
  if (!schema.ok) throw new Error(schema.error);

  const nationSlug = input.nationSlug.trim().toLowerCase();
  const imageFilename = input.imageFilename.trim();
  const name = input.name.trim();
  const position = parsePositionInput(input.position);

  if (!name) throw new Error("Player name is required.");
  if (!position) {
    throw new Error(
      'Invalid position. Use: Goalkeeper, Defender, Midfielder, or Attacker (or GK/DEF/MID/FWD).'
    );
  }

  await assertPlayerImageOnDisk(nationSlug, imageFilename);

  const nation = await prisma.nationalTeam.findUnique({
    where: { slug: nationSlug },
  });
  if (!nation) {
    throw new Error(`Nation folder "${nationSlug}" is not in the database. Run nations setup first.`);
  }

  const photoUrl = buildPlayerPhotoPath(nationSlug, imageFilename);

  const existing = await prisma.player.findFirst({
    where: {
      OR: [{ photoUrl }, { nationalTeamId: nation.id, name }],
    },
  });

  if (existing) {
    const updated = await prisma.player.update({
      where: { id: existing.id },
      data: {
        name,
        position,
        positionLocked: true,
        nationality: nation.name,
        nationalTeamId: nation.id,
        photoUrl,
      },
    });
    return {
      playerId: updated.id,
      photoUrl,
      nationName: nation.name,
      position,
      created: false,
    };
  }

  const created = await prisma.player.create({
    data: {
      name,
      position,
      positionLocked: true,
      nationality: nation.name,
      nationalTeamId: nation.id,
      photoUrl,
    },
  });

  return {
    playerId: created.id,
    photoUrl,
    nationName: nation.name,
    position,
    created: true,
  };
}

export interface PlayerMetaFile {
  name: string;
  position: string;
}

export async function readPlayerMetaFile(
  nationSlug: string,
  imageFilename: string
): Promise<PlayerMetaFile | null> {
  const base = path.basename(imageFilename, path.extname(imageFilename));
  const metaPath = path.join(process.cwd(), "public", "players", nationSlug, `${base}.meta.json`);
  try {
    await access(metaPath);
    const { readFile } = await import("node:fs/promises");
    const raw = await readFile(metaPath, "utf8");
    const json = JSON.parse(raw) as PlayerMetaFile;
    if (!json.name || !json.position) return null;
    return json;
  } catch {
    return null;
  }
}
