import type { PlayerPosition } from "@/lib/mock/my-team-data";

export interface DraftPlayerCard {
  id: string;
  name: string;
  photoUrl: string | null;
  position: PlayerPosition;
  nation: string;
  totalPoints: number;
  ownerTeamName: string | null;
  ownerSelectedNation: string | null;
  isAssigned: boolean;
}

export interface DraftData {
  players: DraftPlayerCard[];
  savedPlayerIds: string[];
}

export type DraftMode = "initial" | "redraft" | "saved";

export interface DraftFilterState {
  position: PlayerPosition | null;
  search: string;
  nations: string[];
}

export function filterDraftPlayers(
  players: DraftPlayerCard[],
  filters: DraftFilterState,
  options: { onlyUnassigned?: boolean; savedIds?: string[] } = {}
): DraftPlayerCard[] {
  let list = players;

  if (options.onlyUnassigned) {
    list = list.filter((p) => !p.isAssigned);
  }

  if (options.savedIds) {
    const saved = new Set(options.savedIds);
    list = list.filter((p) => saved.has(p.id));
  }

  if (filters.position) {
    list = list.filter((p) => p.position === filters.position);
  }

  if (filters.nations.length > 0) {
    const nationSet = new Set(filters.nations);
    list = list.filter((p) => nationSet.has(p.nation));
  }

  const query = filters.search.trim().toLowerCase();
  if (query) {
    list = list.filter((p) => p.name.toLowerCase().includes(query));
  }

  return list;
}
