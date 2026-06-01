import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "mike.png", name: "Maignan", position: "Goalkeeper" },
  { file: "Risser.png", name: "Robin Risser", position: "Goalkeeper" },
  { file: "Samba.png", name: "Brice Samba", position: "Goalkeeper" },
  { file: "Digne.png", name: "Lucas Digne", position: "Defender" },
  { file: "Gusto.png", name: "Malo Gusto", position: "Defender" },
  { file: "Hernandez.png", name: "Lucas Hernandez", position: "Defender" },
  { file: "Theo.png", name: "Theo Hernandez", position: "Defender" },
  { file: "Konate.png", name: "Konate", position: "Defender" },
  { file: "Kounde.png", name: "Kounde", position: "Defender" },
  { file: "Lacroix.png", name: "Lacroix", position: "Defender" },
  { file: "Saliba.png", name: "Saliba", position: "Defender" },
  { file: "Upamecano.png", name: "Upamecano", position: "Defender" },
  { file: "kante.png", name: "N'Golo Kante", position: "Midfielder" },
  { file: "Kone.png", name: "Manu Kone", position: "Midfielder" },
  { file: "Rabiot.png", name: "Rabiot", position: "Midfielder" },
  { file: "Tchouameni.png", name: "Tchouameni", position: "Midfielder" },
  { file: "Emery.png", name: "Zaire-Emery", position: "Midfielder" },
  { file: "Cherki.png", name: "Rayan Cherki", position: "Midfielder" },
  { file: "Akliouche.png", name: "Akliouche", position: "Attacker" },
  { file: "Barcola.png", name: "Barcola", position: "Attacker" },
  { file: "Dembele.png", name: "Dembele", position: "Attacker" },
  { file: "Doue.png", name: "Desire Doue", position: "Attacker" },
  { file: "Mateta.png", name: "Mateta", position: "Attacker" },
  { file: "Mbappe.png", name: "Mbappe", position: "Attacker" },
  { file: "Olise.png", name: "Olise", position: "Attacker" },
  { file: "Thuram.png", name: "Thuram", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "france",
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
