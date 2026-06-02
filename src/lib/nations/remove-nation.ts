import { prisma } from "@/lib/db/prisma";

export interface RemoveNationResult {
  slug: string;
  found: boolean;
  playersRemoved: number;
  matchesRemoved: number;
  usersUpdated: number;
}

/**
 * Permanently remove a nation and all dependent records (players, matches, etc.).
 */
export async function removeNationFromDatabase(slug: string): Promise<RemoveNationResult> {
  const nation = await prisma.nationalTeam.findUnique({ where: { slug } });
  if (!nation) {
    return { slug, found: false, playersRemoved: 0, matchesRemoved: 0, usersUpdated: 0 };
  }

  const players = await prisma.player.findMany({
    where: { nationalTeamId: nation.id },
    select: { id: true },
  });
  const playerIds = players.map((p) => p.id);

  if (playerIds.length > 0) {
    await prisma.savedPlayer.deleteMany({ where: { playerId: { in: playerIds } } });
    await prisma.fantasyTeamPlayer.deleteMany({ where: { playerId: { in: playerIds } } });
    await prisma.matchEvent.deleteMany({ where: { playerId: { in: playerIds } } });
    await prisma.player.deleteMany({ where: { id: { in: playerIds } } });
  }

  const matches = await prisma.match.findMany({
    where: { OR: [{ homeTeamId: nation.id }, { awayTeamId: nation.id }] },
    select: { id: true },
  });
  const matchIds = matches.map((m) => m.id);

  if (matchIds.length > 0) {
    await prisma.bet.deleteMany({ where: { matchId: { in: matchIds } } });
    await prisma.matchEvent.deleteMany({ where: { matchId: { in: matchIds } } });
    await prisma.match.deleteMany({ where: { id: { in: matchIds } } });
  }

  const usersUpdated = await prisma.user.updateMany({
    where: { selectedNation: nation.name },
    data: { selectedNation: "Unassigned" },
  });

  await prisma.nationalTeam.delete({ where: { id: nation.id } });

  return {
    slug,
    found: true,
    playersRemoved: playerIds.length,
    matchesRemoved: matchIds.length,
    usersUpdated: usersUpdated.count,
  };
}
