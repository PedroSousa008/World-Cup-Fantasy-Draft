import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "Ospina.png", name: "Ospina", position: "Goalkeeper" },
  { file: "Vargas.png", name: "Camilo Vargas", position: "Goalkeeper" },
  { file: "Montenro.png", name: "Álvaro Montenro", position: "Goalkeeper" },
  { file: "Sánchez.png", name: "Dávinson Sánchez", position: "Defender" },
  { file: "Muñoz.png", name: "Daniel Muñoz", position: "Defender" },
  { file: "SArias.png", name: "Santiago Arias", position: "Defender" },
  { file: "Lucumí.png", name: "Jhon Lucumí", position: "Defender" },
  { file: "Mina.png", name: "Yerry Mina", position: "Defender" },
  { file: "Ditta.png", name: "Willer Ditta", position: "Defender" },
  { file: "Machado.png", name: "Déiver Machado", position: "Defender" },
  { file: "Mojica.png", name: "Johan Mojica", position: "Defender" },
  { file: "Puerta.png", name: "Gustavo Puerta", position: "Midfielder" },
  { file: "Rodríguez.png", name: "James Rodríguez", position: "Midfielder" },
  { file: "Lerma.png", name: "Jefferson Lerma", position: "Midfielder" },
  { file: "Arias.png", name: "Jhon Arias", position: "Midfielder" },
  { file: "Carrascal.png", name: "Jorge Carrascal", position: "Midfielder" },
  { file: "Quintero.png", name: "Quintero", position: "Midfielder" },
  { file: "Ríos.png", name: "Richard Ríos", position: "Midfielder" },
  { file: "Castaño.png", name: "Kevin Castaño", position: "Midfielder" },
  { file: "Campaz.png", name: "Jaminton Campaz", position: "Midfielder" },
  { file: "Portilla.png", name: "Juan Portilla", position: "Midfielder" },
  { file: "Diaz.png", name: "Luis Diaz", position: "Attacker" },
  { file: "Suárez.png", name: "Luis Suárez", position: "Attacker" },
  { file: "Córdoba.png", name: "Jhon Córdoba", position: "Attacker" },
  { file: "Gómez.png", name: "Carlos Gómez", position: "Attacker" },
  { file: "Hernández.png", name: "Juan Camilo Hernández", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "colombia",
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
