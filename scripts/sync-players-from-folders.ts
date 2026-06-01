/**
 * Scan public/players/{nation}/ for images with matching {basename}.meta.json files.
 *
 * Meta file example — public/players/portugal/diogocosta.meta.json:
 * { "name": "Diogo Costa", "position": "Goalkeeper" }
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import {
  registerPlayerFromFile,
  readPlayerMetaFile,
} from "../src/lib/players/register-from-file";

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

async function main() {
  const playersRoot = path.join(process.cwd(), "public", "players");
  const nationDirs = await readdir(playersRoot, { withFileTypes: true });

  let registered = 0;
  let skipped = 0;

  for (const dirent of nationDirs) {
    if (!dirent.isDirectory() || dirent.name.startsWith(".")) continue;

    const nationSlug = dirent.name;
    const dir = path.join(playersRoot, nationSlug);
    const files = await readdir(dir);

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!IMAGE_EXT.has(ext)) continue;

      const meta = await readPlayerMetaFile(nationSlug, file);
      if (!meta) {
        skipped++;
        continue;
      }

      const result = await registerPlayerFromFile({
        nationSlug,
        imageFilename: file,
        name: meta.name,
        position: meta.position,
      });

      console.log(
        `${result.created ? "+" : "~"} ${meta.name} (${nationSlug}/${file}) → ${result.playerId}`
      );
      registered++;
    }
  }

  console.log(`\nDone. ${registered} player(s) synced, ${skipped} image(s) without .meta.json skipped.`);
  console.log(
    "Tip: use `npm run player:add --` for single players without meta files."
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("../src/lib/db/prisma");
    await prisma.$disconnect();
  });
