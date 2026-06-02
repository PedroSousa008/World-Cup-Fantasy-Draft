import { WORLD_CUP_NATION_BY_NAME } from "@/lib/nations/world-cup-nations";

/** Map schedule labels / typos to canonical nation names in the database. */
const ALIASES: Record<string, string> = {
  turkey: "Türkiye",
  tuniasia: "Tunisia",
  "curaçao": "Curaçao",
  curacao: "Curaçao",
  curação: "Curaçao",
  "dr congo": "DR Congo",
  "ivory coast": "Ivory Coast",
  "south korea": "South Korea",
  "south africa": "South Africa",
  "saudi arabia": "Saudi Arabia",
  "new zealand": "New Zealand",
  "czech republic": "Czech Republic",
  "bosnia and herzegovina": "Bosnia and Herzegovina",
  "cape verde": "Cape Verde",
  usa: "USA",
};

export function resolveNationName(input: string): string | null {
  const trimmed = input.trim();
  if (WORLD_CUP_NATION_BY_NAME.has(trimmed)) return trimmed;

  const key = trimmed.toLowerCase();
  const alias = ALIASES[key];
  if (alias && WORLD_CUP_NATION_BY_NAME.has(alias)) return alias;

  for (const [name] of WORLD_CUP_NATION_BY_NAME) {
    if (name.toLowerCase() === key) return name;
  }

  return null;
}
