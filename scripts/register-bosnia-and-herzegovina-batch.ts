import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "Vasilj.png", name: "Nikola Vasilj", position: "Goalkeeper" },
  { file: "Zlomislic.png", name: "Martin Zlomislic", position: "Goalkeeper" },
  { file: "Hadzikic.png", name: "Osman Hadzikic", position: "Goalkeeper" },
  { file: "Kolasinac.png", name: "Kolasinac", position: "Defender" },
  { file: "dedic.png", name: "Dedic", position: "Defender" },
  { file: "Mujakic.png", name: "Nihad Mujakic", position: "Defender" },
  { file: "Katic.png", name: "Nikola Katic", position: "Defender" },
  { file: "Muharemovic.png", name: "Tarik Muharemovic", position: "Defender" },
  { file: "Radeljic.png", name: "Stjepan Radeljic", position: "Defender" },
  { file: "Hadzikadunic.png", name: "Dennis Hadzikadunic", position: "Midfielder" },
  { file: "Celik.png", name: "Nidal Celik", position: "Midfielder" },
  { file: "Hadziahmetovic.png", name: "Amir Hadziahmetovic", position: "Midfielder" },
  { file: "Sunjic.png", name: "Ivan Sunjic", position: "Midfielder" },
  { file: "Basic.png", name: "Ivan Basic", position: "Midfielder" },
  { file: "Burnic.png", name: "Dzenis Burnic", position: "Midfielder" },
  { file: "Tahirovic.png", name: "Benjamin Tahirovic", position: "Midfielder" },
  { file: "Memic.png", name: "Amar Memic", position: "Midfielder" },
  { file: "Gigovic.png", name: "Armin Gigovic", position: "Midfielder" },
  { file: "Alajbegovic.png", name: "Kerim Alajbegovic", position: "Midfielder" },
  { file: "Bajraktarevic.png", name: "Esmir Bajraktarevic", position: "Midfielder" },
  { file: "Mahmic.png", name: "Ermin Mahmic", position: "Attacker" },
  { file: "Demirovic.png", name: "Ermedin Demirovic", position: "Attacker" },
  { file: "Lukic.png", name: "Jovo Lukic", position: "Attacker" },
  { file: "Bazdar.png", name: "Samed Bazdar", position: "Attacker" },
  { file: "Tabakovic.png", name: "Haris Tabakovic", position: "Attacker" },
  { file: "Dzeko.png", name: "Dzeko", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "bosnia-and-herzegovina",
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
