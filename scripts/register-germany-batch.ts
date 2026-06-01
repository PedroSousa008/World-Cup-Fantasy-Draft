import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "Neuer.png", name: "Neuer", position: "Goalkeeper" },
  { file: "Baumann.png", name: "Baumann", position: "Goalkeeper" },
  { file: "Nübel.png", name: "Nübel", position: "Goalkeeper" },
  { file: "Anton.png", name: "Waldemar Anton", position: "Defender" },
  { file: "Brown.png", name: "Nathaniel Brown", position: "Defender" },
  { file: "Raum.png", name: "David Raum", position: "Defender" },
  { file: "Rüdiger.png", name: "Rüdiger", position: "Defender" },
  { file: "Schlotterbeck.png", name: "Schlotterbeck", position: "Defender" },
  { file: "Tah.png", name: "Tah", position: "Defender" },
  { file: "Thiaw.png", name: "Malick Thiaw", position: "Defender" },
  { file: "Kimmich.png", name: "Kimmich", position: "Midfielder" },
  { file: "Amiri.png", name: "Nadiem Amiri", position: "Midfielder" },
  { file: "Goretzka.png", name: "Goretzka", position: "Midfielder" },
  { file: "Gross.png", name: "Gross", position: "Midfielder" },
  { file: "Karl.png", name: "Lennart Karl", position: "Midfielder" },
  { file: "Leweling.png", name: "Jamie Leweling", position: "Midfielder" },
  { file: "Musiala.png", name: "Musiala", position: "Midfielder" },
  { file: "Nmecha.png", name: "Felix Nmecha", position: "Midfielder" },
  { file: "Pavlovic.png", name: "Pavlovic", position: "Midfielder" },
  { file: "Sané.png", name: "Sané", position: "Midfielder" },
  { file: "Stiller.png", name: "Angelo Stiller", position: "Midfielder" },
  { file: "Wirtz.png", name: "Wirtz", position: "Midfielder" },
  { file: "Beier.png", name: "Maximilian Beier", position: "Attacker" },
  { file: "Havertz.png", name: "Havertz", position: "Attacker" },
  { file: "Undav.png", name: "Undav", position: "Attacker" },
  { file: "Woltemade.png", name: "Woltemade", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "germany",
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
