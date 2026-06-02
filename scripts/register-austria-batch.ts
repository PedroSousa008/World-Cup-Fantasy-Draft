import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "Pentz.png", name: "Patrick Pentz", position: "Goalkeeper" },
  { file: "Schlager.png", name: "Alexander Schlager", position: "Goalkeeper" },
  { file: "Wiegele.png", name: "Florian Wiegele", position: "Goalkeeper" },
  { file: "Affengruber.png", name: "David Affengruber", position: "Defender" },
  { file: "Alaba.png", name: "Alaba", position: "Defender" },
  { file: "Danso.png", name: "Danso", position: "Defender" },
  { file: "Friedl.png", name: "Marco Friedl", position: "Defender" },
  { file: "Lienhart.png", name: "Philipp Lienhart", position: "Defender" },
  { file: "Mwene.png", name: "Phillipp Mwene", position: "Defender" },
  { file: "Posch.png", name: "Stefan Posch", position: "Defender" },
  { file: "Prass.png", name: "Alexander Prass", position: "Defender" },
  { file: "Svoboda.png", name: "Michael Svoboda", position: "Defender" },
  { file: "Baumgartne.png", name: "Christoph Baumgartne", position: "Midfielder" },
  { file: "Chukwuemeka.png", name: "Chukwuemeka", position: "Midfielder" },
  { file: "Grillitsch.png", name: "Grillitsch", position: "Midfielder" },
  { file: "Laimer.png", name: "Laimer", position: "Midfielder" },
  { file: "Sabitzer.png", name: "Sabitzer", position: "Midfielder" },
  { file: "XSchlager.png", name: "Xaver Schlager", position: "Midfielder" },
  { file: "Schmid.png", name: "Romano Schmid", position: "Midfielder" },
  { file: "Schöpf.png", name: "Alessandro Schöpf", position: "Midfielder" },
  { file: "Seiwald.png", name: "Nicolas Seiwald", position: "Midfielder" },
  { file: "Wanner.png", name: "Paul Wanner", position: "Midfielder" },
  { file: "Wimmer.png", name: "Wimmer", position: "Midfielder" },
  { file: "Arnautovic.png", name: "Arnautovic", position: "Attacker" },
  { file: "Gregoritsch.png", name: "Michael Gregoritsch", position: "Attacker" },
  { file: "Kalajdzic.png", name: "Kalajdzic", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "austria",
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
