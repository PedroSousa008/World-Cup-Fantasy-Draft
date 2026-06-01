import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "Simón.png", name: "Unai Simón", position: "Goalkeeper" },
  { file: "Raya.png", name: "David Raya", position: "Goalkeeper" },
  { file: "Garcia.png", name: "Joan Garcia", position: "Goalkeeper" },
  { file: "Porro.png", name: "Pedro Porro", position: "Defender" },
  { file: "Llorente.png", name: "Marcos Llorente", position: "Defender" },
  { file: "Laporte.png", name: "Laporte", position: "Defender" },
  { file: "Cubarsí.png", name: "Cubarsí", position: "Defender" },
  { file: "Pubill.png", name: "Marc Pubill", position: "Defender" },
  { file: "egarcia.png", name: "Eric Garcia", position: "Defender" },
  { file: "Cucurella.png", name: "Cucurella", position: "Defender" },
  { file: "Grimaldo.png", name: "Grimaldo", position: "Defender" },
  { file: "Rodri.png", name: "Rodri", position: "Midfielder" },
  { file: "Zubimendi.png", name: "Zubimendi", position: "Midfielder" },
  { file: "Pedri.png", name: "Pedri", position: "Midfielder" },
  { file: "Ruiz.png", name: "Fabián Ruiz", position: "Midfielder" },
  { file: "Merino.png", name: "Merino", position: "Midfielder" },
  { file: "Gavi.png", name: "Gavi", position: "Midfielder" },
  { file: "Baena.png", name: "Álex Baena", position: "Midfielder" },
  { file: "Oyarzabal.png", name: "Oyarzabal", position: "Attacker" },
  { file: "Yamal.png", name: "Lamine Yamal", position: "Attacker" },
  { file: "Torres.png", name: "Ferran Torres", position: "Attacker" },
  { file: "Iglesias.png", name: "Borja Iglesias", position: "Attacker" },
  { file: "Olmo.png", name: "Dani Olmo", position: "Attacker" },
  { file: "Muñoz.png", name: "Víctor Muñoz", position: "Attacker" },
  { file: "Williams.png", name: "Nico Williams", position: "Attacker" },
  { file: "Pino.png", name: "Yeremy Pino", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "spain",
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
