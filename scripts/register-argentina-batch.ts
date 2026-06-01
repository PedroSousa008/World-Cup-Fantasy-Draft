import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "emiliano.png", name: "Emiliano Martínez", position: "Goalkeeper" },
  { file: "Rulli.png", name: "Gerónimo Rulli", position: "Goalkeeper" },
  { file: "Musso.png", name: "Juan Musso", position: "Goalkeeper" },
  { file: "Molina.png", name: "Molina", position: "Defender" },
  { file: "Montiel.png", name: "Montiel", position: "Defender" },
  { file: "Romero.png", name: "Romero", position: "Defender" },
  { file: "Balerdi.png", name: "Balerdi", position: "Defender" },
  { file: "Otamendi.png", name: "Otamendi", position: "Defender" },
  { file: "Martínez.png", name: "Lisandro Martínez", position: "Defender" },
  { file: "Tagliafico.png", name: "Tagliafico", position: "Defender" },
  { file: "Medina.png", name: "Medina", position: "Defender" },
  { file: "Paredes.png", name: "Paredes", position: "Midfielder" },
  { file: "Mac.png", name: "Mac Allister", position: "Midfielder" },
  { file: "Rodrigo.png", name: "Rodrigo De Paul", position: "Midfielder" },
  { file: "celso.png", name: "Lo Celso", position: "Midfielder" },
  { file: "Palacios.png", name: "Exequiel Palacios", position: "Midfielder" },
  { file: "Enzo.png", name: "Enzo Fernández", position: "Midfielder" },
  { file: "Barco.png", name: "Barco", position: "Midfielder" },
  { file: "Messi.png", name: "Messi", position: "Attacker" },
  { file: "Álvarez.png", name: "Julián Álvarez", position: "Attacker" },
  { file: "lMartínez.png", name: "Lautaro Martínez", position: "Attacker" },
  { file: "Almada.png", name: "Thiago Almada", position: "Attacker" },
  { file: "Paz.png", name: "Nico Paz", position: "Attacker" },
  { file: "Nico.png", name: "Nico González", position: "Attacker" },
  { file: "Simeone.png", name: "Giuliano Simeone", position: "Attacker" },
  { file: "López.png", name: "José Manuel López", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "argentina",
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
