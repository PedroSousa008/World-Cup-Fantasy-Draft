import { seedTournamentSchedule } from "../src/lib/tournament/seed-tournament";

async function main() {
  console.log("Seeding tournament schedule…");
  const result = await seedTournamentSchedule();
  console.log(
    `Done: ${result.matchesCreated} created, ${result.matchesUpdated} updated, ${result.groupsAssigned} group assignments.`
  );
  if (result.errors.length) {
    console.warn("Warnings:");
    for (const e of result.errors) console.warn(" -", e);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
