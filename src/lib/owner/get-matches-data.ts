import { getOwnerMatchesList, getMatchDetail } from "@/lib/tournament/get-tournament-data";

export async function getOwnerMatchesPageData() {
  const matches = await getOwnerMatchesList();
  return {
    matches: matches.map((m) => ({
      id: m.id,
      matchday: m.matchday,
      groupName: m.groupName,
      scheduledAt: m.scheduledAt.toISOString(),
      status: m.status,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      bettingOpen: m.bettingOpen,
      eventCount: m.events.length,
      homeTeam: {
        id: m.homeTeam.id,
        name: m.homeTeam.name,
        flagEmoji: m.homeTeam.flagEmoji,
      },
      awayTeam: {
        id: m.awayTeam.id,
        name: m.awayTeam.name,
        flagEmoji: m.awayTeam.flagEmoji,
      },
    })),
  };
}

export async function getOwnerMatchEditData(matchId: string) {
  const match = await getMatchDetail(matchId);
  if (!match) return null;

  const { prisma } = await import("@/lib/db/prisma");
  const players = await prisma.player.findMany({
    where: {
      nationalTeamId: { in: [match.homeTeamId, match.awayTeamId] },
    },
    select: {
      id: true,
      name: true,
      position: true,
      nationality: true,
      nationalTeamId: true,
    },
    orderBy: [{ position: "asc" }, { name: "asc" }],
  });

  return {
    match: {
      id: match.id,
      matchday: match.matchday,
      groupName: match.groupName,
      scheduledAt: match.scheduledAt.toISOString(),
      status: match.status,
      homeScore: match.homeScore ?? 0,
      awayScore: match.awayScore ?? 0,
      bettingOpen: match.bettingOpen,
      manOfTheMatchId: match.manOfTheMatchId,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
    },
    events: match.events.map((e) => ({
      id: e.id,
      playerId: e.playerId ?? "",
      eventType: e.eventType,
      minute: e.minute,
      playerName: e.player?.name ?? "",
    })),
    players: players.map((p) => ({
      id: p.id,
      name: p.name,
      position: p.position,
      teamId: p.nationalTeamId!,
      teamName: p.nationality,
    })),
  };
}
