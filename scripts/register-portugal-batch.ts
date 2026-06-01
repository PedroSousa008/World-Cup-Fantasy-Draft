import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "bernardo.png", name: "Bernardo Silva", position: "Midfielder" },
  { file: "bruno.png", name: "Bruno Fernandes", position: "Midfielder" },
  { file: "cancelo.png", name: "João Cancelo", position: "Defender" },
  { file: "dalot.png", name: "Diogo Dalot", position: "Defender" },
  { file: "dias.png", name: "Rúben Dias", position: "Defender" },
  { file: "diogo.PNG", name: "Diogo Costa", position: "Goalkeeper" },
  { file: "inacio.png", name: "Gonçalo Inácio", position: "Defender" },
  { file: "joao.png", name: "João Neves", position: "Midfielder" },
  { file: "jose.PNG", name: "José Sá", position: "Goalkeeper" },
  { file: "matheus.png", name: "Matheus Nunes", position: "Midfielder" },
  { file: "neves.png", name: "Rúben Neves", position: "Midfielder" },
  { file: "nuno.png", name: "Nuno Mendes", position: "Defender" },
  { file: "rui.png", name: "Rui Silva", position: "Goalkeeper" },
  { file: "samu.png", name: "Samu Costa", position: "Midfielder" },
  { file: "semedo.png", name: "Nélson Semedo", position: "Defender" },
  { file: "tomas.png", name: "Tomás Araújo", position: "Defender" },
  { file: "veiga.png", name: "Gabri Veiga", position: "Midfielder" },
  { file: "velho.PNG", name: "Ricardo Velho", position: "Goalkeeper" },
  { file: "vitinha.png", name: "Vitinha", position: "Midfielder" },
  { file: "felix.png", name: "Felix", position: "Attacker" },
  { file: "trincao.png", name: "Trincão", position: "Attacker" },
  { file: "conceicao.png", name: "Conceição", position: "Attacker" },
  { file: "neto.png", name: "Neto", position: "Attacker" },
  { file: "leao.png", name: "Rafael Leão", position: "Attacker" },
  { file: "guedes.png", name: "Guedes", position: "Attacker" },
  { file: "ramos.png", name: "Gonçalo Ramos", position: "Attacker" },
  { file: "cristiano.png", name: "Cristiano Ronaldo", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "portugal",
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
