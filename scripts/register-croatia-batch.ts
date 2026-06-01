import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "Livakovic.png", name: "Livakovic", position: "Goalkeeper" },
  { file: "Kotarski.png", name: "Kotarski", position: "Goalkeeper" },
  { file: "Pandur.png", name: "Pandur", position: "Goalkeeper" },
  { file: "Gvardiol.png", name: "Gvardiol", position: "Defender" },
  { file: "Car.png", name: "Duje Caleta-Car", position: "Defender" },
  { file: "Sutalo.png", name: "Sutalo", position: "Defender" },
  { file: "Stanisic.png", name: "Stanisic", position: "Defender" },
  { file: "Pongracic.png", name: "Pongracic", position: "Defender" },
  { file: "Erlic.png", name: "Martin Erlic", position: "Defender" },
  { file: "Vuskovic.png", name: "Luka Vuskovic", position: "Defender" },
  { file: "Modric.png", name: "Modric", position: "Midfielder" },
  { file: "Kovacic.png", name: "Kovacic", position: "Midfielder" },
  { file: "Pasalic.png", name: "Mario Pasalic", position: "Midfielder" },
  { file: "Sucic.png", name: "Sucic", position: "Midfielder" },
  { file: "Baturina.png", name: "Baturina", position: "Midfielder" },
  { file: "Moro.png", name: "Nikola Moro", position: "Midfielder" },
  { file: "PSucic.png", name: "Petar Sucic", position: "Midfielder" },
  { file: "Jakic.png", name: "Jakic", position: "Midfielder" },
  { file: "Fruk.png", name: "Toni Fruk", position: "Midfielder" },
  { file: "Vlasic.png", name: "Vlasic", position: "Midfielder" },
  { file: "Perisic.png", name: "Perisic", position: "Attacker" },
  { file: "Kramaric.png", name: "Kramaric", position: "Attacker" },
  { file: "Budimir.png", name: "Budimir", position: "Attacker" },
  { file: "MPasalic.png", name: "Marin Pasalic", position: "Attacker" },
  { file: "Musa.png", name: "Petar Musa", position: "Attacker" },
  { file: "Matanovic.png", name: "Matanovic", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "croatia",
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
