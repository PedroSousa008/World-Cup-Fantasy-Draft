/**
 * Register a player from an image already in public/players/{nation-slug}/
 *
 * Usage:
 *   npm run player:add -- portugal diogocosta.png "Diogo Costa" Goalkeeper
 *   npm run player:add -- france mbappe.jpg "Kylian Mbappé" Attacker
 */
import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

async function main() {
  const [, , nationSlug, imageFilename, name, position] = process.argv;

  if (!nationSlug || !imageFilename || !name || !position) {
    console.error(`
Usage:
  npm run player:add -- <nation-slug> <image-file> "<player name>" <position>

Example:
  npm run player:add -- portugal diogocosta.png "Diogo Costa" Goalkeeper

Nation is detected from the folder: public/players/<nation-slug>/
`);
    process.exit(1);
  }

  const result = await registerPlayerFromFile({
    nationSlug,
    imageFilename,
    name,
    position,
  });

  console.log(
    result.created ? "✓ Player created" : "✓ Player updated",
    `\n  ID: ${result.playerId}`,
    `\n  Name: ${name}`,
    `\n  Nation: ${result.nationName} (from folder /${nationSlug}/)`,
    `\n  Position: ${result.position} (locked)`,
    `\n  Photo: ${result.photoUrl}`
  );
}

main()
  .catch((err) => {
    console.error("Error:", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("../src/lib/db/prisma");
    await prisma.$disconnect();
  });
