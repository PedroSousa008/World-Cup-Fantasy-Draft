import { prisma } from "@/lib/db/prisma";

export interface NationListItem {
  id: string;
  name: string;
  slug: string;
  code: string;
  flagEmoji: string | null;
  imageDir: string;
  isActive: boolean;
  playerCount: number;
}

export interface NationDetailData {
  nation: NationListItem;
  players: {
    id: string;
    name: string;
    position: string;
    photoUrl: string | null;
    positionLocked: boolean;
    ownerTeamName: string | null;
    isAssigned: boolean;
  }[];
  users: { id: string; teamName: string }[];
}

export async function getNationsListData(): Promise<NationListItem[]> {
  const nations = await prisma.nationalTeam.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { players: true } } },
  });

  return nations.map((n) => ({
    id: n.id,
    name: n.name,
    slug: n.slug,
    code: n.code,
    flagEmoji: n.flagEmoji,
    imageDir: n.imageDir,
    isActive: n.isActive,
    playerCount: n._count.players,
  }));
}

export async function getNationDetailData(slug: string): Promise<NationDetailData | null> {
  const nation = await prisma.nationalTeam.findUnique({
    where: { slug },
    include: {
      _count: { select: { players: true } },
      players: {
        orderBy: { name: "asc" },
        include: {
          fantasySlots: {
            take: 1,
            include: { fantasyTeam: { include: { user: { select: { teamName: true } } } } },
          },
        },
      },
    },
  });

  if (!nation) return null;

  const users = await prisma.user.findMany({
    select: { id: true, teamName: true },
    orderBy: { teamName: "asc" },
  });

  return {
    nation: {
      id: nation.id,
      name: nation.name,
      slug: nation.slug,
      code: nation.code,
      flagEmoji: nation.flagEmoji,
      imageDir: nation.imageDir,
      isActive: nation.isActive,
      playerCount: nation._count.players,
    },
    players: nation.players.map((p) => ({
      id: p.id,
      name: p.name,
      position: p.position,
      photoUrl: p.photoUrl,
      positionLocked: p.positionLocked,
      ownerTeamName: p.fantasySlots[0]?.fantasyTeam.user.teamName ?? null,
      isAssigned: p.fantasySlots.length > 0,
    })),
    users,
  };
}
