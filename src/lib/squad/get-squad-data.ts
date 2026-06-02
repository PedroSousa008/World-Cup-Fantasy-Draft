import { prisma } from "@/lib/db/prisma";
import { getPositionLabel } from "@/lib/players/types";
import { loadAllPlayerStats } from "@/lib/scoring/load-all-player-stats";
import type { FormationId } from "@/lib/squad/formations";
import {
  buildAssignmentsFromDb,
  UNASSIGNED_SLOT_ORDER,
} from "@/lib/squad/slot-keys";
import type { FantasyPlayer } from "@/lib/squad/squad-utils";
import { getPlayerFixture } from "@/lib/tournament/fixtures";
import { getNationMatchStartMap } from "@/lib/squad/matchday-squad";
import { getCurrentMatchday } from "@/lib/tournament/matchday-lock";
import { getNationTheme } from "@/lib/nation-theme";

export interface SquadInitialData {
  assignedPlayers: FantasyPlayer[];
  assignments: Record<string, string | null>;
  captainId: string | null;
  viceCaptainId: string | null;
  formationId: FormationId;
  managerNation: string;
  managerNationAbbr: string;
  currentMatchday: number;
  /** Player nation match started this matchday — bench player cannot enter XI if true */
  playerNationLocked: Record<string, boolean>;
  promotedPlayerIds: string[];
}

export async function getSquadData(userId: string): Promise<SquadInitialData | null> {
  const team = await prisma.fantasyTeam.findUnique({
    where: { userId },
    include: {
      players: {
        include: {
          player: {
            include: { nationalTeam: true },
          },
        },
      },
    },
  });

  if (!team) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { selectedNation: true },
  });
  const managerNation = user?.selectedNation ?? "—";
  const managerNationAbbr = getNationTheme(managerNation).abbr;
  const currentMatchday = (await getCurrentMatchday()) ?? 1;
  const nationKickoffs = await getNationMatchStartMap(currentMatchday);
  const now = Date.now();

  const savedMd = await prisma.userMatchdaySquad.findUnique({
    where: { userId_matchday: { userId, matchday: currentMatchday } },
  });
  const promotedPlayerIds = savedMd?.promotedPlayerIds ?? [];

  const statsMap = await loadAllPlayerStats();

  const availableSlots = team.players.filter((s) => s.player.availability === "AVAILABLE");

  const fixtures = await Promise.all(
    availableSlots.map((s) =>
      getPlayerFixture(s.player.nationalTeamId, s.player.nationality)
    )
  );

  const assignedPlayers: FantasyPlayer[] = [];

  availableSlots.forEach((slot, index) => {
    const p = slot.player;
    const stats = statsMap.get(p.id);
    const fixture = fixtures[index]!;
    const nation = p.nationalTeam?.name ?? p.nationality;

    assignedPlayers.push({
      id: p.id,
      name: p.name,
      photoUrl: p.photoUrl ?? undefined,
      position: p.position,
      nation,
      club: p.club ?? "",
      price: 0,
      totalPoints: stats?.totalPoints ?? 0,
      currentMatchdayPoints: stats?.matchdayPoints?.[currentMatchday] ?? 0,
      matchdayPoints: stats?.matchdayPoints?.[currentMatchday] ?? 0,
      managerNationAbbr,
      matchStatus: fixture.status,
      upcomingFixture: fixture.fixture,
      matchDate: fixture.scheduledAt
        ? new Date(fixture.scheduledAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          })
        : undefined,
      goals: stats?.goals ?? 0,
      assists: stats?.assists ?? 0,
      yellowCards: stats?.yellowCards ?? 0,
      redCards: stats?.redCards ?? 0,
      motmAwards: stats?.motmAwards ?? 0,
      isDrafted: true,
      matchHistory: stats?.matchHistory ?? [],
    });
  });

  const formationId: FormationId = "4-3-3";
  const lineup = team.players.map((s) => ({
    playerId: s.playerId,
    slotOrder: s.slotOrder,
    isStarter: s.isStarter,
  }));

  const assignments = buildAssignmentsFromDb(formationId, lineup);

  const assignedIds = new Set(assignedPlayers.map((p) => p.id));
  for (const [slotId, playerId] of Object.entries(assignments)) {
    if (playerId && !assignedIds.has(playerId)) {
      assignments[slotId] = null;
    }
  }

  const playerNationLocked: Record<string, boolean> = {};
  for (const slot of availableSlots) {
    const p = slot.player;
    if (!p.nationalTeamId) continue;
    const kick = nationKickoffs.get(p.nationalTeamId);
    playerNationLocked[p.id] = kick ? kick.getTime() <= now : false;
  }

  return {
    assignedPlayers,
    assignments,
    captainId: team.captainId,
    viceCaptainId: team.viceCaptainId,
    formationId,
    managerNation,
    managerNationAbbr,
    currentMatchday,
    playerNationLocked,
    promotedPlayerIds,
  };
}

export function isPlayerAvailableForPicker(player: {
  availability?: string;
}): boolean {
  return player.availability === "AVAILABLE" || player.availability === undefined;
}

export { getPositionLabel, UNASSIGNED_SLOT_ORDER };
