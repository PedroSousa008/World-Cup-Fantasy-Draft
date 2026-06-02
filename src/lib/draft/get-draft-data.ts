import { prisma } from "@/lib/db/prisma";
import type { DraftData, DraftPlayerCard } from "@/lib/draft/types";
import { getNationFlag, isCatalogNationName, isCatalogNationSlug } from "@/lib/nations";
import type { PlayerPosition } from "@/lib/players/types";

/**
 * Lightweight draft payload — no full stats scan (rankings/detail load points separately).
 */
export async function getDraftData(userId: string): Promise<DraftData> {
  const [players, saved] = await Promise.all([
    prisma.player.findMany({
      orderBy: [{ nationality: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        photoUrl: true,
        position: true,
        nationality: true,
        nationalTeam: {
          select: { slug: true, flagEmoji: true, name: true },
        },
        fantasySlots: {
          take: 1,
          select: {
            fantasyTeam: {
              select: {
                user: { select: { teamName: true, selectedNation: true } },
              },
            },
          },
        },
      },
    }),
    prisma.savedPlayer.findMany({
      where: { userId },
      select: { playerId: true },
    }),
  ]);

  const draftPlayers: DraftPlayerCard[] = players
    .filter((player) => {
      const slug = player.nationalTeam?.slug ?? null;
      const nationName = player.nationalTeam?.name ?? player.nationality;
      if (slug) return isCatalogNationSlug(slug);
      return isCatalogNationName(nationName);
    })
    .map((player) => {
    const owner = player.fantasySlots[0]?.fantasyTeam.user ?? null;
    const nationName = player.nationalTeam?.name ?? player.nationality;

    return {
      id: player.id,
      name: player.name,
      photoUrl: player.photoUrl,
      position: player.position as PlayerPosition,
      nation: nationName,
      nationSlug: player.nationalTeam?.slug ?? null,
      nationFlag: player.nationalTeam?.flagEmoji ?? getNationFlag(nationName),
      totalPoints: 0,
      ownerTeamName: owner?.teamName ?? null,
      ownerSelectedNation: owner?.selectedNation ?? null,
      isAssigned: player.fantasySlots.length > 0,
    };
  });

  return {
    players: draftPlayers,
    savedPlayerIds: saved.map((s) => s.playerId),
  };
}

export async function isPlayerSaved(userId: string, playerId: string): Promise<boolean> {
  const row = await prisma.savedPlayer.findUnique({
    where: { userId_playerId: { userId, playerId } },
  });
  return !!row;
}
