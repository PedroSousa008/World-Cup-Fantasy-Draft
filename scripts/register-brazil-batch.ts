import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "Alisson.png", name: "Alisson", position: "Goalkeeper" },
  { file: "Ederson.png", name: "Ederson", position: "Goalkeeper" },
  { file: "Weverton.png", name: "Weverton", position: "Goalkeeper" },
  { file: "Sandro.png", name: "Alex Sandro", position: "Defender" },
  { file: "Bremer.png", name: "Bremer", position: "Defender" },
  { file: "Danilo.png", name: "Danilo", position: "Defender" },
  { file: "Santos.png", name: "Douglas Santos", position: "Defender" },
  { file: "Magalhães.png", name: "Gabriel Magalhães", position: "Defender" },
  { file: "Ibañez.png", name: "Ibañez", position: "Defender" },
  { file: "Pereira.png", name: "Léo Pereira", position: "Defender" },
  { file: "Wesley.png", name: "Wesley", position: "Defender" },
  { file: "Marquinhos.png", name: "Marquinhos", position: "Defender" },
  { file: "Guimarães.png", name: "Bruno Guimarães", position: "Midfielder" },
  { file: "Casemiro.png", name: "Casemiro", position: "Midfielder" },
  { file: "DSantos.png", name: "Danilo Santos", position: "Midfielder" },
  { file: "Fabinho.png", name: "Fabinho", position: "Midfielder" },
  { file: "Paquetá.png", name: "Paquetá", position: "Midfielder" },
  { file: "Endrick.png", name: "Endrick", position: "Attacker" },
  { file: "Martinelli.png", name: "Martinelli", position: "Attacker" },
  { file: "Thiago.png", name: "Igor Thiago", position: "Attacker" },
  { file: "Henrique.png", name: "Luiz Henrique", position: "Attacker" },
  { file: "Cunha.png", name: "Matheus Cunha", position: "Attacker" },
  { file: "Neymar.png", name: "Neymar", position: "Attacker" },
  { file: "Raphinha.png", name: "Raphinha", position: "Attacker" },
  { file: "Rayan.png", name: "Rayan", position: "Attacker" },
  { file: "Vinicius.png", name: "Vinicius", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "brazil",
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
