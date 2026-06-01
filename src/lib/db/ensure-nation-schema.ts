import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { WORLD_CUP_NATION_BY_NAME } from "@/lib/nations/world-cup-nations";

function isMissingColumnError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2022" || error.code === "P2010";
  }
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("does not exist") ||
    message.includes("column") ||
    message.includes("Unknown column")
  );
}

/** Apply nation/player schema columns on PostgreSQL (safe if already applied). */
export async function applyNationSchemaMigration(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "NationalTeam" ADD COLUMN IF NOT EXISTS "slug" TEXT;
    ALTER TABLE "NationalTeam" ADD COLUMN IF NOT EXISTS "imageDir" TEXT;
    ALTER TABLE "NationalTeam" ADD COLUMN IF NOT EXISTS "flagEmoji" TEXT;
    ALTER TABLE "NationalTeam" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
    ALTER TABLE "Player" ADD COLUMN IF NOT EXISTS "positionLocked" BOOLEAN DEFAULT true;
  `);

  const teams = await prisma.$queryRawUnsafe<{ id: string; name: string; code: string }[]>(
    `SELECT id, name, code FROM "NationalTeam"`
  );

  for (const team of teams) {
    const catalog = WORLD_CUP_NATION_BY_NAME.get(team.name);
    const slug =
      catalog?.slug ??
      team.code?.toLowerCase().replace(/[^a-z0-9]+/g, "-") ??
      team.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const imageDir = catalog?.imageDir ?? `players/${slug}`;
    const flagEmoji = catalog?.flagEmoji ?? null;

    await prisma.$executeRaw`
      UPDATE "NationalTeam"
      SET
        slug = ${slug},
        "imageDir" = ${imageDir},
        "flagEmoji" = COALESCE("flagEmoji", ${flagEmoji}),
        "isActive" = COALESCE("isActive", true)
      WHERE id = ${team.id}
        AND (slug IS NULL OR "imageDir" IS NULL)
    `;
  }

  await prisma.$executeRawUnsafe(`
    UPDATE "NationalTeam" SET "isActive" = true WHERE "isActive" IS NULL;
    UPDATE "Player" SET "positionLocked" = true WHERE "positionLocked" IS NULL;
  `);

  try {
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "NationalTeam_slug_key" ON "NationalTeam"("slug");
    `);
  } catch {
    // Index may already exist under a different name from Prisma
  }
}

export async function ensureNationSchema(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await prisma.nationalTeam.findFirst({
      select: { id: true, slug: true, imageDir: true },
    });
    return { ok: true };
  } catch (error) {
    if (!isMissingColumnError(error)) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Database check failed",
      };
    }
  }

  try {
    await applyNationSchemaMigration();
    await prisma.nationalTeam.findFirst({
      select: { id: true, slug: true, imageDir: true },
    });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Schema migration failed",
    };
  }
}

export async function prepareOwnerPlayersDatabase(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const schema = await ensureNationSchema();
  if (!schema.ok) return schema;

  const { seedWorldCupNations } = await import("@/lib/nations/seed-nations");
  try {
    await seedWorldCupNations();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to seed nations",
    };
  }
}
