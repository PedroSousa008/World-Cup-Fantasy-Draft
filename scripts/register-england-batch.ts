import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "dean.png", name: "Dean Henderson", position: "Goalkeeper" },
  { file: "Pickford.png", name: "Pickford", position: "Goalkeeper" },
  { file: "trafford.png", name: "James Trafford", position: "Goalkeeper" },
  { file: "Dan.png", name: "Dan Burn", position: "Defender" },
  { file: "Guéhi.png", name: "Guéhi", position: "Defender" },
  { file: "Reece.png", name: "Reece James", position: "Defender" },
  { file: "Konsa.png", name: "Konsa", position: "Defender" },
  { file: "Livramento.png", name: "Livramento", position: "Defender" },
  { file: "nico.png", name: "Nico O'Reilly", position: "Defender" },
  { file: "Quansah.png", name: "Quansah", position: "Defender" },
  { file: "Spence.png", name: "Spence", position: "Defender" },
  { file: "stones.png", name: "John Stones", position: "Defender" },
  { file: "Anderson.png", name: "Anderson", position: "Midfielder" },
  { file: "Bellingham.png", name: "Bellingham", position: "Midfielder" },
  { file: "Eze.png", name: "Eze", position: "Midfielder" },
  { file: "Henderson.png", name: "Henderson", position: "Midfielder" },
  { file: "Mainoo.png", name: "Mainoo", position: "Midfielder" },
  { file: "Rice.png", name: "Declan Rice", position: "Midfielder" },
  { file: "Rogers.png", name: "Morgan Rogers", position: "Midfielder" },
  { file: "gordon.png", name: "Anthony Gordon", position: "Attacker" },
  { file: "Kane.png", name: "Harry Kane", position: "Attacker" },
  { file: "Madueke.png", name: "Madueke", position: "Attacker" },
  { file: "Rashford.png", name: "Rashford", position: "Attacker" },
  { file: "Saka.png", name: "Saka", position: "Attacker" },
  { file: "Ivan.png", name: "Ivan Toney", position: "Attacker" },
  { file: "Watkins.png", name: "Watkins", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "england",
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
