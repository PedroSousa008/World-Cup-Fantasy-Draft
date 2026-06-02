import { removeNationFromDatabase } from "../src/lib/nations/remove-nation";

const slug = process.argv[2]?.trim().toLowerCase();

if (!slug) {
  console.error("Usage: npm run nation:remove -- <slug>");
  console.error("Example: npm run nation:remove -- nigeria");
  process.exit(1);
}

async function main() {
  const result = await removeNationFromDatabase(slug);
  if (!result.found) {
    console.log(`Nation "${slug}" not found in database (already removed).`);
    return;
  }
  console.log(`Removed nation "${slug}":`);
  console.log(`  ${result.playersRemoved} player(s) deleted`);
  console.log(`  ${result.matchesRemoved} match(es) deleted`);
  console.log(`  ${result.usersUpdated} user(s) updated (selectedNation → Unassigned)`);
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
