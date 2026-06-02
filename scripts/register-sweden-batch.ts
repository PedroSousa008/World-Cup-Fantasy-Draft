import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "Johansson.png", name: "Viktor Johansson", position: "Goalkeeper" },
  { file: "Nordfeldt.png", name: "Kristoffer Nordfeldt", position: "Goalkeeper" },
  { file: "Zetterström.png", name: "Jacob Zetterström", position: "Goalkeeper" },
  { file: "Lagerbielke.png", name: "Lagerbielke", position: "Defender" },
  { file: "Ekdal.png", name: "Hjalmar Ekdal", position: "Defender" },
  { file: "Gudmundsson.png", name: "Gabriel Gudmundsson", position: "Defender" },
  { file: "Hien.png", name: "Isak Hien", position: "Defender" },
  { file: "Lindelöf.png", name: "Lindelöf", position: "Defender" },
  { file: "Smith.png", name: "Eric Smith", position: "Defender" },
  { file: "Starfelt.png", name: "Carl Starfelt", position: "Defender" },
  { file: "Svensson.png", name: "Daniel Svensson", position: "Defender" },
  { file: "Ayari.png", name: "Yasin Ayari", position: "Midfielder" },
  { file: "Bergvall.png", name: "Bergvall", position: "Midfielder" },
  { file: "Karlström.png", name: "Jesper Karlström", position: "Midfielder" },
  { file: "Nygren.png", name: "Benjamin Nygren", position: "Midfielder" },
  { file: "Sema.png", name: "Ken Sema", position: "Midfielder" },
  { file: "Stroud.png", name: "Elliot Stroud", position: "Midfielder" },
  { file: "Zeneli.png", name: "Besfort Zeneli", position: "Midfielder" },
  { file: "Svanberg.png", name: "Mattias Svanberg", position: "Midfielder" },
  { file: "Ali.png", name: "Taha Ali", position: "Attacker" },
  { file: "Bernhardsson.png", name: "Alexander Bernhardsson", position: "Attacker" },
  { file: "Elanga.png", name: "Elanga", position: "Attacker" },
  { file: "Gyökeres.png", name: "Gyökeres", position: "Attacker" },
  { file: "Isak.png", name: "Isak", position: "Attacker" },
  { file: "Nilsson.png", name: "Gustaf Nilsson", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "sweden",
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
