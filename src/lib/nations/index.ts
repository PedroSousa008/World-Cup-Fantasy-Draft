export {
  WORLD_CUP_NATIONS,
  WORLD_CUP_NATION_NAMES,
  WORLD_CUP_NATION_BY_SLUG,
  WORLD_CUP_NATION_BY_NAME,
  WORLD_CUP_NATION_FLAGS,
  type WorldCupNation,
} from "@/lib/nations/world-cup-nations";

import {
  WORLD_CUP_NATION_BY_SLUG,
  WORLD_CUP_NATION_FLAGS,
} from "@/lib/nations/world-cup-nations";

export function getNationFlag(nationName: string): string {
  return WORLD_CUP_NATION_FLAGS[nationName] ?? "🏳️";
}

export function getNationFlagBySlug(slug: string): string {
  return WORLD_CUP_NATION_BY_SLUG.get(slug)?.flagEmoji ?? "🏳️";
}
