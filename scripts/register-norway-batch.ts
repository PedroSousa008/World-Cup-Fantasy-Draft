import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "Nyland.png", name: "Orjan Nyland", position: "Goalkeeper" },
  { file: "Selvik.png", name: "Egil Selvik", position: "Goalkeeper" },
  { file: "Tangvik.png", name: "Sander Tangvik", position: "Goalkeeper" },
  { file: "Ajer.png", name: "Kristoffer Ajer", position: "Defender" },
  { file: "Bjorkan.png", name: "Fredrik Bjorkan", position: "Defender" },
  { file: "Falchener.png", name: "Henrik Falchener", position: "Defender" },
  { file: "Langas.png", name: "Sondre Langas", position: "Defender" },
  { file: "Heggem.png", name: "Torbjorn Heggem", position: "Defender" },
  { file: "Pedersen.png", name: "Marcus Pedersen", position: "Defender" },
  { file: "Ryerson.png", name: "Julian Ryerson", position: "Defender" },
  { file: "Wolfe.png", name: "David Wolfe", position: "Defender" },
  { file: "Ostigard.png", name: "Leo Ostigard", position: "Defender" },
  { file: "Aasgaard.png", name: "Thelonious Aasgaard", position: "Midfielder" },
  { file: "Aursnes.png", name: "Fredrik Aursnes", position: "Midfielder" },
  { file: "Berg.png", name: "Patrick Berg", position: "Midfielder" },
  { file: "Berge.png", name: "Sander Berge", position: "Midfielder" },
  { file: "Hauge.png", name: "Jens Petter Hauge", position: "Midfielder" },
  { file: "Thorsby.png", name: "Morten Thorsby", position: "Midfielder" },
  { file: "Thorstvedt.png", name: "Kristian Thorstvedt", position: "Midfielder" },
  { file: "Odegaard.png", name: "Odegaard", position: "Midfielder" },
  { file: "Haaland.png", name: "Haaland", position: "Attacker" },
  { file: "Larsen.png", name: "Jorgen Larsen", position: "Attacker" },
  { file: "Sorloth.png", name: "Sorloth", position: "Attacker" },
  { file: "Bobb.png", name: "Oscar Bobb", position: "Attacker" },
  { file: "Nusa.png", name: "Antonio Nusa", position: "Attacker" },
  { file: "Schjelderup.png", name: "Andreas Schjelderup", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "norway",
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
