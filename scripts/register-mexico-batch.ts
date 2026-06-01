import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "ochoa.png", name: "Ochoa", position: "Goalkeeper" },
  { file: "raul.png", name: "Rangel", position: "Goalkeeper" },
  { file: "acevedo.png", name: "Acevedo", position: "Goalkeeper" },
  { file: "reyes.png", name: "Reyes", position: "Defender" },
  { file: "gallardo.png", name: "Gallardo", position: "Defender" },
  { file: "sanchez.png", name: "Sánchez", position: "Defender" },
  { file: "montes.png", name: "Montes", position: "Defender" },
  { file: "vasquez.png", name: "Vásquez", position: "Defender" },
  { file: "chavez.png", name: "Mateo Chávez", position: "Defender" },
  { file: "lira.png", name: "Erik Lira", position: "Midfielder" },
  { file: "romo.png", name: "Romo", position: "Midfielder" },
  { file: "vargas.png", name: "Vargas", position: "Midfielder" },
  { file: "brian.png", name: "Gutiérrez", position: "Midfielder" },
  { file: "pineda.png", name: "Pineda", position: "Midfielder" },
  { file: "alvarez.png", name: "Álvarez", position: "Midfielder" },
  { file: "mora.png", name: "Mora", position: "Midfielder" },
  { file: "huerta.png", name: "Huerta", position: "Midfielder" },
  { file: "fidalgo.png", name: "Fidalgo", position: "Midfielder" },
  { file: "luis.png", name: "Luis Chávez", position: "Midfielder" },
  { file: "alvarado.png", name: "Alvarado", position: "Attacker" },
  { file: "vega.png", name: "Vega", position: "Attacker" },
  { file: "julian.png", name: "Quinones", position: "Attacker" },
  { file: "gimenez.png", name: "Gimenez", position: "Attacker" },
  { file: "martinez.png", name: "Martínez", position: "Attacker" },
  { file: "gonzalez.png", name: "González", position: "Attacker" },
  { file: "jimenez.png", name: "Jiménez", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "mexico",
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
