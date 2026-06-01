import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "Courtois.png", name: "Courtois", position: "Goalkeeper" },
  { file: "Lammens.png", name: "Lammens", position: "Goalkeeper" },
  { file: "Penders.png", name: "Penders", position: "Goalkeeper" },
  { file: "Castagne.png", name: "Timothy Castagne", position: "Defender" },
  { file: "Debast.png", name: "Debast", position: "Defender" },
  { file: "Cuyper.png", name: "Maxim De Cuyper", position: "Defender" },
  { file: "Winter.png", name: "Koni De Winter", position: "Defender" },
  { file: "Mechele.png", name: "Brandon Mechele", position: "Defender" },
  { file: "Meunier.png", name: "Meunier", position: "Defender" },
  { file: "Ngoy.png", name: "Nathan Ngoy", position: "Defender" },
  { file: "Seys.png", name: "Joaquin Seys", position: "Defender" },
  { file: "Theate.png", name: "Arthur Theate", position: "Defender" },
  { file: "Bruyne.png", name: "Kevin De Bruyne", position: "Midfielder" },
  { file: "Onana.png", name: "Onana", position: "Midfielder" },
  { file: "Raskin.png", name: "Nicolas Raskin", position: "Midfielder" },
  { file: "Tielemans.png", name: "Tielemans", position: "Midfielder" },
  { file: "Vanaken.png", name: "Hans Vanaken", position: "Midfielder" },
  { file: "Witsel.png", name: "Witsel", position: "Midfielder" },
  { file: "Ketelaere.png", name: "De Ketelaere", position: "Attacker" },
  { file: "Doku.png", name: "Doku", position: "Attacker" },
  { file: "Pardo.png", name: "Matías Fernández-Pardo", position: "Attacker" },
  { file: "Lukaku.png", name: "Lukaku", position: "Attacker" },
  { file: "Lukébakio.png", name: "Lukébakio", position: "Attacker" },
  { file: "Moreira.png", name: "Diego Moreira", position: "Attacker" },
  { file: "Saelemaekers.png", name: "Saelemaekers", position: "Attacker" },
  { file: "Trossard.png", name: "Trossard", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "belgium",
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
