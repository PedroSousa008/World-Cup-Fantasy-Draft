import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "vozinha.png", name: "Vozinha", position: "Goalkeeper" },
  { file: "Rosa.png", name: "Márcio Rosa", position: "Goalkeeper" },
  { file: "Santos.png", name: "CJ dos Santos", position: "Goalkeeper" },
  { file: "Moreira.png", name: "Steven Moreira", position: "Defender" },
  { file: "Pina.png", name: "Wagner Pina", position: "Defender" },
  { file: "Fernandes.png", name: "João Paulo Fernandes", position: "Defender" },
  { file: "Cabral.png", name: "Sidny Cabral", position: "Defender" },
  { file: "Costa.png", name: "Logan Costa", position: "Defender" },
  { file: "Lopes.png", name: "Pico Lopes", position: "Defender" },
  { file: "Pires.png", name: "Kelvin Pires", position: "Defender" },
  { file: "Stopira.png", name: "Stopira", position: "Defender" },
  { file: "Diney.png", name: "Diney", position: "Defender" },
  { file: "Monteiro.png", name: "Jamiro Monteiro", position: "Midfielder" },
  { file: "Arcanjo.png", name: "Telmo Arcanjo", position: "Midfielder" },
  { file: "Semedo.png", name: "Yannick Semedo", position: "Midfielder" },
  { file: "Duarte.png", name: "Laros Duarte", position: "Midfielder" },
  { file: "DDuarte.png", name: "Deroy Duarte", position: "Midfielder" },
  { file: "KPina.png", name: "Kevin Pina", position: "Midfielder" },
  { file: "Mendes.png", name: "Ryan Mendes", position: "Attacker" },
  { file: "WSemedo.png", name: "Willy Semedo", position: "Attacker" },
  { file: "Rodrigues.png", name: "Garry Rodrigues", position: "Attacker" },
  { file: "JCabral.png", name: "Jovane Cabral", position: "Attacker" },
  { file: "NCosta.png", name: "Nuno da Costa", position: "Attacker" },
  { file: "Livramento.png", name: "Livramento", position: "Attacker" },
  { file: "Benchimol.png", name: "Gilson Benchimol", position: "Attacker" },
  { file: "Varela.png", name: "Hélio Varela", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "cape-verde",
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
