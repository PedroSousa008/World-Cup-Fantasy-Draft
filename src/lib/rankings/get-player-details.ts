import { prisma } from "@/lib/db/prisma";
import { loadAllPlayerStats } from "@/lib/scoring/load-all-player-stats";
import { getCurrentMatchday } from "@/lib/tournament/matchday-lock";
import { getPlayerFixture } from "@/lib/tournament/fixtures";
import type { FantasyPlayer } from "@/lib/squad/squad-utils";
import type { PlayerPosition } from "@/lib/mock/my-team-data";

export interface DbPlayerDetails extends FantasyPlayer {
  ownerTeamName: string | null;
  minutesPlayed: number;
  ownGoals: number;
}

export async function getPlayerDetailsFromDb(
  playerId: string
): Promise<DbPlayerDetails | null> {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    include: {
      nationalTeam: true,
      fantasySlots: {
        include: {
          fantasyTeam: {
            include: { user: { select: { teamName: true } } },
          },
        },
      },
    },
  });

  if (!player) return null;

  const [statsMap, fixtureData, currentMd] = await Promise.all([
    loadAllPlayerStats(),
    getPlayerFixture(player.nationalTeamId, player.nationality),
    getCurrentMatchday(),
  ]);

  const stats = statsMap.get(player.id);
  const md = currentMd ?? 1;

  const fixture = {
    fixture: fixtureData.fixture,
    date: fixtureData.scheduledAt
      ? new Date(fixtureData.scheduledAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        })
      : undefined,
    status: fixtureData.status,
  };

  return {
    id: player.id,
    name: player.name,
    photoUrl: player.photoUrl ?? undefined,
    position: player.position as PlayerPosition,
    nation: player.nationalTeam?.name ?? player.nationality,
    club: player.club ?? "—",
    price: 0,
    totalPoints: stats?.totalPoints ?? 0,
    currentMatchdayPoints: stats?.matchdayPoints[md] ?? 0,
    matchdayPoints: stats?.matchdayPoints[md] ?? 0,
    matchStatus: fixture.status,
    upcomingFixture: fixture.fixture,
    matchDate: fixture.date,
    goals: stats?.goals ?? 0,
    assists: stats?.assists ?? 0,
    yellowCards: stats?.yellowCards ?? 0,
    redCards: stats?.redCards ?? 0,
    motmAwards: stats?.motmAwards ?? 0,
    minutesPlayed: stats?.minutesPlayed ?? 0,
    ownGoals: stats?.ownGoals ?? 0,
    isDrafted: player.fantasySlots.length > 0,
    ownerTeamName: player.fantasySlots[0]?.fantasyTeam.user.teamName ?? null,
    matchHistory: stats?.matchHistory ?? [],
  };
}
