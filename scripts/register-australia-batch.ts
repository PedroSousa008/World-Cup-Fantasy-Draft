import { registerPlayerFromFile } from "../src/lib/players/register-from-file";

const PLAYERS = [
  { file: "Ryan.png", name: "Mathew Ryan", position: "Goalkeeper" },
  { file: "Izzo.png", name: "Paul Izzo", position: "Goalkeeper" },
  { file: "Beach.png", name: "Patrick Beach", position: "Goalkeeper" },
  { file: "Trewin.png", name: "Kai Trewin", position: "Defender" },
  { file: "Behich.png", name: "Aziz Behich", position: "Defender" },
  { file: "Souttar.png", name: "Harry Souttar", position: "Defender" },
  { file: "Degenek.png", name: "Milos Degenek", position: "Defender" },
  { file: "Burgess.png", name: "Cameron Burgess", position: "Defender" },
  { file: "Herrington.png", name: "Lucas Herrington", position: "Defender" },
  { file: "Circati.png", name: "Alessandro Circati", position: "Defender" },
  { file: "Italiano.png", name: "Jacob Italiano", position: "Defender" },
  { file: "Bos.png", name: "Jordan Bos", position: "Defender" },
  { file: "Geria.png", name: "Jason Geria", position: "Defender" },
  { file: "Hrustic.png", name: "Ajdin Hrustic", position: "Midfielder" },
  { file: "O\u2019Neill.png", name: "Aiden O'Neill", position: "Midfielder" },
  { file: "Devlin.png", name: "Cameron Devlin", position: "Midfielder" },
  { file: "Irvine.png", name: "Jackson Irvine", position: "Midfielder" },
  { file: "Okon.png", name: "Paul Okon", position: "Midfielder" },
  { file: "Metcalfe.png", name: "Connor Metcalfe", position: "Midfielder" },
  { file: "Mabil.png", name: "Awer Mabil", position: "Attacker" },
  { file: "Irankunda.png", name: "Nestory Irankunda", position: "Attacker" },
  { file: "Volpato.png", name: "Cristian Volpato", position: "Attacker" },
  { file: "Velupillay.png", name: "Nishan Velupillay", position: "Attacker" },
  { file: "Yengi.png", name: "Tete Yengi", position: "Attacker" },
  { file: "Leckie.png", name: "Mathew Leckie", position: "Attacker" },
  { file: "Touré.png", name: "Mohamed Touré", position: "Attacker" },
] as const;

async function main() {
  const results: { name: string; ok: boolean; error?: string; created?: boolean }[] = [];

  for (const p of PLAYERS) {
    try {
      const r = await registerPlayerFromFile({
        nationSlug: "australia",
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
