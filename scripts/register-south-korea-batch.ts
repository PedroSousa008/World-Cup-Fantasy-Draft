import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "song.png", name: "Song", position: "Goalkeeper" },
  { file: "jo.png", name: "Jo", position: "Goalkeeper" },
  { file: "kim.png", name: "Kim Seung-gyu", position: "Goalkeeper" },
  { file: "jens.png", name: "Jens", position: "Defender" },
  { file: "lee.png", name: "Lee Hanbeom", position: "Defender" },
  { file: "park.png", name: "Park", position: "Defender" },
  { file: "leek.png", name: "Lee Kihyuk", position: "Defender" },
  { file: "minjae.png", name: "Kim Minjae", position: "Defender" },
  { file: "kimm.png", name: "Moon-hwan", position: "Defender" },
  { file: "kimt.png", name: "Kim Taehyeon", position: "Defender" },
  { file: "leeta.png", name: "Lee Taeseok", position: "Defender" },
  { file: "seol.png", name: "Seol", position: "Defender" },
  { file: "cho.png", name: "Cho Yumin", position: "Defender" },
  { file: "leed.png", name: "Lee Donggyeong", position: "Midfielder" },
  { file: "yang.png", name: "Yang", position: "Midfielder" },
  { file: "inbeom.png", name: "Hwang Inbeom", position: "Midfielder" },
  { file: "leej.png", name: "Lee Jaesung", position: "Midfielder" },
  { file: "kimji.png", name: "Kim Jingyu", position: "Midfielder" },
  { file: "eom.png", name: "Eom Jisung", position: "Midfielder" },
  { file: "bae.png", name: "Bae Junho", position: "Midfielder" },
  { file: "paik.png", name: "Paik Seungho", position: "Midfielder" },
  { file: "leeka.png", name: "Lee Kangin", position: "Attacker" },
  { file: "chog.png", name: "Cho Guesung", position: "Attacker" },
  { file: "son.png", name: "Son", position: "Attacker" },
  { file: "oh.png", name: "Oh Hyeongyu", position: "Attacker" },
  { file: "hwang.png", name: "Hwang", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "south-korea",
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
