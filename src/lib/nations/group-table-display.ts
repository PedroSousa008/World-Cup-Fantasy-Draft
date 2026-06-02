import { WORLD_CUP_NATION_BY_NAME } from "@/lib/nations/world-cup-nations";

/** Display-only overrides for Group Stage tables (full names stay in DB). */
const GROUP_TABLE_CODE_OVERRIDES: Record<string, string> = {
  Haiti: "HAI",
};

/**
 * 3-letter abbreviation for Group Stage table rows (flag + code only on mobile).
 */
export function getGroupTableAbbreviation(
  teamName: string,
  dbCode?: string | null
): string {
  if (GROUP_TABLE_CODE_OVERRIDES[teamName]) {
    return GROUP_TABLE_CODE_OVERRIDES[teamName];
  }
  const catalog = WORLD_CUP_NATION_BY_NAME.get(teamName);
  if (catalog) return catalog.code;
  if (dbCode) return dbCode.toUpperCase();
  return teamName.slice(0, 3).toUpperCase();
}
