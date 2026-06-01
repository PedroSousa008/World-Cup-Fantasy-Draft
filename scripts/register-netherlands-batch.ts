import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "Flekken.png", name: "Mark Flekken", position: "Goalkeeper" },
  { file: "Roefs.png", name: "Robin Roefs", position: "Goalkeeper" },
  { file: "Verbruggen.png", name: "Bart Verbruggen", position: "Goalkeeper" },
  { file: "Aké.png", name: "Aké", position: "Defender" },
  { file: "Dumfries.png", name: "Dumfries", position: "Defender" },
  { file: "Hato.png", name: "Jorrel Hato", position: "Defender" },
  { file: "Timber.png", name: "Timber", position: "Defender" },
  { file: "Hecke.png", name: "Van Hecke", position: "Defender" },
  { file: "Dijk.png", name: "Virgil van Dijk", position: "Defender" },
  { file: "Ven.png", name: "Van de Ven", position: "Defender" },
  { file: "Jong.png", name: "Frenkie de Jong", position: "Midfielder" },
  { file: "Roon.png", name: "Marten de Roon", position: "Midfielder" },
  { file: "Gravenberch.png", name: "Gravenberch", position: "Midfielder" },
  { file: "Koopmeiners.png", name: "Koopmeiners", position: "Midfielder" },
  { file: "Reijnders.png", name: "Reijnders", position: "Midfielder" },
  { file: "Til.png", name: "Guus Til", position: "Midfielder" },
  { file: "QTimber.png", name: "Quinten Timber", position: "Midfielder" },
  { file: "Wieffer.png", name: "Mats Wieffer", position: "Midfielder" },
  { file: "Brobbey.png", name: "Brobbey", position: "Attacker" },
  { file: "Depay.png", name: "Depay", position: "Attacker" },
  { file: "Gakpo.png", name: "Gakpo", position: "Attacker" },
  { file: "Kluivert.png", name: "Kluivert", position: "Attacker" },
  { file: "Lang.png", name: "Noa Lang", position: "Attacker" },
  { file: "Malen.png", name: "Malen", position: "Attacker" },
  { file: "Summerville.png", name: "Summerville", position: "Attacker" },
  { file: "Weghorst.png", name: "Weghorst", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "netherlands",
        imageFilename: p.file,
        name: p.name,
        position: p.position,
      });
      results.push({ name: p.name, ok: true, created: r.created });
      console.log(`${r.created ? "+" : "~"} ${p.name} (${p.file}) → ${r.position}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ name: p.name, ok: false, error: msg });
      console.error(`✗ ${p.name}: ${msg}`);
    }
  }

  const ok = results.filter((r) => r.ok).length;
  console.log(`\n${ok}/${PLAYERS.length} players registered.`);
  if (results.some((r) => !r.ok)) process.exit(1);
}

main().finally(async () => {
  const { prisma } = await import("../src/lib/db/prisma");
  await prisma.$disconnect();
});
