import { prisma } from "@/lib/db/prisma";
import type { DraftPlayerCard } from "@/lib/draft/types";
import { getNationFlag, isCatalogNationName, isCatalogNationSlug } from "@/lib/nations";
import {
  getOwnerRosterSlotByOrder,
  OWNER_ROSTER_SLOTS,
} from "@/lib/owner/owner-roster-slots";
import { getOwnerUsersData } from "@/lib/owner/get-users-data";
import type { PlayerPosition } from "@/lib/players/types";
import { loadAllPlayerStats } from "@/lib/scoring/load-all-player-stats";

export interface OwnerRosterSlotPlayer {
  id: string;
  name: string;
  photoUrl: string | null;
  position: PlayerPosition;
}

export interface OwnerTeamRosterSlot {
  slotOrder: number;
  position: PlayerPosition;
  player: OwnerRosterSlotPlayer | null;
}

export interface OwnerTeamCard {
  userId: string;
  username: string;
  teamName: string;
  selectedNation: string;
  totalPoints: number;
  slots: OwnerTeamRosterSlot[];
}

export interface OwnerTeamsPageData {
  teams: OwnerTeamCard[];
  pickerPlayers: DraftPlayerCard[];
}

export async function getOwnerTeamsPageData(): Promise<OwnerTeamsPageData> {
  const [users, players, statsMap] = await Promise.all([
    getOwnerUsersData(),
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
    loadAllPlayerStats(),
  ]);

  const fantasyTeams = await prisma.fantasyTeam.findMany({
    where: { userId: { in: users.map((u) => u.id) } },
    include: {
      players: {
        include: {
          player: {
            select: {
              id: true,
              name: true,
              photoUrl: true,
              position: true,
            },
          },
        },
      },
    },
  });

  const teamByUserId = new Map(fantasyTeams.map((t) => [t.userId, t]));

  const teams: OwnerTeamCard[] = users.map((user) => {
    const fantasyTeam = teamByUserId.get(user.id);
    const slotPlayerByOrder = new Map<number, OwnerRosterSlotPlayer>();

    if (fantasyTeam) {
      for (const row of fantasyTeam.players) {
        const def = getOwnerRosterSlotByOrder(row.slotOrder);
        if (!def) continue;
        slotPlayerByOrder.set(row.slotOrder, {
          id: row.player.id,
          name: row.player.name,
          photoUrl: row.player.photoUrl,
          position: row.player.position as PlayerPosition,
        });
      }
    }

    const slots: OwnerTeamRosterSlot[] = OWNER_ROSTER_SLOTS.map((def) => ({
      slotOrder: def.slotOrder,
      position: def.position,
      player: slotPlayerByOrder.get(def.slotOrder) ?? null,
    }));

    return {
      userId: user.id,
      username: user.username,
      teamName: user.teamName,
      selectedNation: user.selectedNation,
      totalPoints: user.totalPoints,
      slots,
    };
  });

  const pickerPlayers: DraftPlayerCard[] = players
    .filter((player) => {
      const slug = player.nationalTeam?.slug ?? null;
      const nationName = player.nationalTeam?.name ?? player.nationality;
      if (slug) return isCatalogNationSlug(slug);
      return isCatalogNationName(nationName);
    })
    .map((player) => {
      const owner = player.fantasySlots[0]?.fantasyTeam.user ?? null;
      const nationName = player.nationalTeam?.name ?? player.nationality;
      const stats = statsMap.get(player.id);

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

  return { teams, pickerPlayers };
}
