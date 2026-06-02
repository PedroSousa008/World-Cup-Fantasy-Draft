import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "Hayakawa.png", name: "Hayakawa", position: "Goalkeeper" },
  { file: "Osako.png", name: "Keisuke Osako", position: "Goalkeeper" },
  { file: "Suzuki.png", name: "Suzuki", position: "Goalkeeper" },
  { file: "Itakura.png", name: "Ko Itakura", position: "Defender" },
  { file: "Ito.png", name: "Hiroki Ito", position: "Defender" },
  { file: "Nagatomo.png", name: "Yuto Nagatomo", position: "Defender" },
  { file: "Seko.png", name: "Ayumu Seko", position: "Defender" },
  { file: "Sugawara.png", name: "Yukinari Sugawara", position: "Defender" },
  { file: "JSuzuki.png", name: "Junnosuke Suzuki", position: "Defender" },
  { file: "Taniguchi.png", name: "Shogo Taniguchi", position: "Defender" },
  { file: "Tomiyasu.png", name: "Takehiro Tomiyasu", position: "Defender" },
  { file: "Watanabe.png", name: "Tsuyoshi Watanabe", position: "Defender" },
  { file: "Doan.png", name: "Ritsu Doan", position: "Midfielder" },
  { file: "Endo.png", name: "Wataru Endo", position: "Midfielder" },
  { file: "JIto.png", name: "Junya Ito", position: "Midfielder" },
  { file: "Kamada.png", name: "Daichi Kamada", position: "Midfielder" },
  { file: "Kubo.png", name: "Takefusa Kubo", position: "Midfielder" },
  { file: "Sano.png", name: "Kaishu Sano", position: "Midfielder" },
  { file: "Nakamura.png", name: "Keito Nakamura", position: "Midfielder" },
  { file: "Tanaka.png", name: "Ao Tanaka", position: "Midfielder" },
  { file: "Goto.png", name: "Keisuke Goto", position: "Attacker" },
  { file: "Maeda.png", name: "Daizen Maeda", position: "Attacker" },
  { file: "Ogawa.png", name: "Koki Ogawa", position: "Attacker" },
  { file: "Shiogai.png", name: "Kento Shiogai", position: "Attacker" },
  { file: "YSuzuki.png", name: "Yuito Suzuki", position: "Attacker" },
  { file: "Ueda.png", name: "Ayase Ueda", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "japan",
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
