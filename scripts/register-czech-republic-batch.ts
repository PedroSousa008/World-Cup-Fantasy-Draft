import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "lukas.png", name: "Hornicek", position: "Goalkeeper" },
  { file: "kovar.png", name: "Matej Kovar", position: "Goalkeeper" },
  { file: "stanrk.png", name: "Jindrich Stanrk", position: "Goalkeeper" },
  { file: "coufal.png", name: "Coufal", position: "Defender" },
  { file: "david.png", name: "David Doudera", position: "Defender" },
  { file: "tomas.png", name: "Tomas Holes", position: "Defender" },
  { file: "robin.png", name: "Robin Hranac", position: "Defender" },
  { file: "stepan.png", name: "Stepan Chaloupek", position: "Defender" },
  { file: "davidj.png", name: "Jurasek", position: "Defender" },
  { file: "krejci.png", name: "Ladislav Krejci", position: "Defender" },
  { file: "zeleny.png", name: "Jaroslav Zeleny", position: "Defender" },
  { file: "zima.png", name: "David Zima", position: "Defender" },
  { file: "pavel.png", name: "Pavel Bucha", position: "Midfielder" },
  { file: "cerv.png", name: "Lukas Cerv", position: "Midfielder" },
  { file: "darida.png", name: "Vladimir Darida", position: "Midfielder" },
  { file: "ladra.png", name: "Tomas Ladra", position: "Midfielder" },
  { file: "sadilek.png", name: "Michal Sadilek", position: "Midfielder" },
  { file: "hugo.png", name: "Hugo Sochurek", position: "Midfielder" },
  { file: "sojka.png", name: "Alexandr Sojka", position: "Midfielder" },
  { file: "soucek.png", name: "Tomas Soucek", position: "Midfielder" },
  { file: "sulc.png", name: "Pavel Sulc", position: "Midfielder" },
  { file: "denis.png", name: "Denis Visinsky", position: "Midfielder" },
  { file: "adam.png", name: "Adam Hlozek", position: "Attacker" },
  { file: "chory.png", name: "Tomas Chory", position: "Attacker" },
  { file: "mokmir.png", name: "Mojmir Chytil", position: "Attacker" },
  { file: "kabongo.png", name: "Christophe Kabongo", position: "Attacker" },
  { file: "jan.png", name: "Jan Kuchta", position: "Attacker" },
  { file: "patrik.png", name: "Patrik Schick", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "czech-republic",
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
