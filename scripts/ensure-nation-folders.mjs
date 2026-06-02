import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicPlayers = path.join(root, "public", "players");

/** Keep in sync with src/lib/nations/world-cup-nations.ts */
const SLUGS = [
  "argentina",
  "australia",
  "austria",
  "belgium",
  "bosnia-and-herzegovina",
  "brazil",
  "canada",
  "cape-verde",
  "colombia",
  "croatia",
  "curacao",
  "czech-republic",
  "dr-congo",
  "ecuador",
  "egypt",
  "england",
  "france",
  "germany",
  "ghana",
  "haiti",
  "iran",
  "iraq",
  "ivory-coast",
  "japan",
  "jordan",
  "mexico",
  "morocco",
  "netherlands",
  "new-zealand",
  "norway",
  "paraguay",
  "portugal",
  "qatar",
  "saudi-arabia",
  "scotland",
  "senegal",
  "south-africa",
  "south-korea",
  "spain",
  "sweden",
  "switzerland",
  "tunisia",
  "turkiye",
  "uruguay",
  "usa",
  "uzbekistan",
  "venezuela",
  "zambia",
];

await mkdir(publicPlayers, { recursive: true });

for (const slug of SLUGS) {
  const dir = path.join(publicPlayers, slug);
  await mkdir(dir, { recursive: true });
  const keep = path.join(dir, ".gitkeep");
  await writeFile(keep, "", { flag: "a" });
}

console.log(`Ensured ${SLUGS.length} nation folders under public/players/`);
