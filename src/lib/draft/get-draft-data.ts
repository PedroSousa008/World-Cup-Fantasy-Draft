import { prisma } from "@/lib/db/prisma";
import type { DraftData, DraftPlayerCard } from "@/lib/draft/types";
import { getNationFlag } from "@/lib/nations";
import type { PlayerPosition } from "@/lib/players/types";
import { loadAllPlayerStats } from "@/lib/scoring/load-all-player-stats";

export async function getDraftData(userId: string): Promise<DraftData> {
  const [players, saved, statsMap] = await Promise.all([
    prisma.player.findMany({
      orderBy: [{ nationality: "asc" }, { name: "asc" }],
      include: {
        nationalTeam: {
          select: { slug: true, flagEmoji: true, name: true },
        },
        fantasySlots: {
          take: 1,
          include: {
            fantasyTeam: {
              include: {
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
    loadAllPlayerStats(),
  ]);

  const draftPlayers: DraftPlayerCard[] = players.map((player) => {
    const owner = player.fantasySlots[0]?.fantasyTeam.user ?? null;
    const stats = statsMap.get(player.id);

    const nationName = player.nationalTeam?.name ?? player.nationality;

    return {
      id: player.id,
      name: player.name,
      photoUrl: player.photoUrl,
      position: player.position as PlayerPosition,
      nation: nationName,
      nationSlug: player.nationalTeam?.slug ?? null,
      nationFlag: player.nationalTeam?.flagEmoji ?? getNationFlag(nationName),
      totalPoints: stats?.totalPoints ?? 0,
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
