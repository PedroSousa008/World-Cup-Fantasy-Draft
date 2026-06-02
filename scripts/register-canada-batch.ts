import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "Goodman.png", name: "Owen Goodman", position: "Goalkeeper" },
  { file: "Crepeau.png", name: "Maxime Crepeau", position: "Goalkeeper" },
  { file: "Clair.png", name: "Dayne St. Clair", position: "Goalkeeper" },
  { file: "Bombito.png", name: "Moise Bombito", position: "Defender" },
  { file: "Cornelius.png", name: "Derek Cornelius", position: "Defender" },
  { file: "Davies.png", name: "Alphonso Davies", position: "Defender" },
  { file: "Fougerolles.png", name: "Luc de Fougerolles", position: "Defender" },
  { file: "Johnston.png", name: "Alistair Johnston", position: "Defender" },
  { file: "Jones.png", name: "Alfie Jones", position: "Defender" },
  { file: "Laryea.png", name: "Richie Laryea", position: "Defender" },
  { file: "Sigur.png", name: "Niko Sigur", position: "Defender" },
  { file: "Waterman.png", name: "Joel Waterman", position: "Defender" },
  { file: "Ahmed.png", name: "Ali Ahmed", position: "Midfielder" },
  { file: "Buchanan.png", name: "Buchanan", position: "Midfielder" },
  { file: "Choiniere.png", name: "Mathieu Choiniere", position: "Midfielder" },
  { file: "Eustaquio.png", name: "Eustaquio", position: "Midfielder" },
  { file: "Kone.png", name: "Ismael Kone", position: "Midfielder" },
  { file: "Millar.png", name: "Liam Millar", position: "Midfielder" },
  { file: "Osorio.png", name: "Jonathan Osorio", position: "Midfielder" },
  { file: "Saliba.png", name: "Nathan-Dylan Saliba", position: "Midfielder" },
  { file: "Shaffelburg.png", name: "Jacob Shaffelburg", position: "Midfielder" },
  { file: "David.png", name: "Jonathan David", position: "Attacker" },
  { file: "PDavid.png", name: "Promise David", position: "Attacker" },
  { file: "Larin.png", name: "Cyle Larin", position: "Attacker" },
  { file: "Oluwaseyi.png", name: "Tani Oluwaseyi", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "canada",
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
