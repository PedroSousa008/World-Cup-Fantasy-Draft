import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "Bounou.png", name: "Bounou", position: "Goalkeeper" },
  { file: "Kajoui.png", name: "Munir El Kajoui", position: "Goalkeeper" },
  { file: "Tagnaouti.png", name: "Reda Tagnaouti", position: "Goalkeeper" },
  { file: "Mazraoui.png", name: "Mazraoui", position: "Defender" },
  { file: "Eddine.png", name: "Anass Salah-Eddine", position: "Defender" },
  { file: "Belammari.png", name: "Belammari", position: "Defender" },
  { file: "Hakimi.png", name: "Hakimi", position: "Defender" },
  { file: "Ouahd.png", name: "Zakaria El Ouahd", position: "Defender" },
  { file: "Aguerd.png", name: "Aguerd", position: "Defender" },
  { file: "Riad.png", name: "Chadi Riad", position: "Defender" },
  { file: "Halhal.png", name: "Redouane Halhal", position: "Defender" },
  { file: "Diop.png", name: "Issa Diop", position: "Defender" },
  { file: "Mourabet.png", name: "Samir El Mourabet", position: "Midfielder" },
  { file: "Bouaddi.png", name: "Bouaddi", position: "Midfielder" },
  { file: "Aynaoui.png", name: "Aynaoui", position: "Midfielder" },
  { file: "Amrabat.png", name: "Amrabat", position: "Midfielder" },
  { file: "Ounahi.png", name: "Ounahi", position: "Midfielder" },
  { file: "Khannouss.png", name: "Khannouss", position: "Midfielder" },
  { file: "Saibari.png", name: "Saibari", position: "Midfielder" },
  { file: "Ezzalzouli.png", name: "Ezzalzouli", position: "Attacker" },
  { file: "Talbi.png", name: "Talbi", position: "Attacker" },
  { file: "Rahimi.png", name: "Rahimi", position: "Attacker" },
  { file: "Kaabi.png", name: "Kaabi", position: "Attacker" },
  { file: "Díaz.png", name: "Brahim Díaz", position: "Attacker" },
  { file: "Yassine.png", name: "Yassine", position: "Attacker" },
  { file: "Amaimouni.png", name: "Amaimouni", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "morocco",
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
