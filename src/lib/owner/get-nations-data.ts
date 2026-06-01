import { prisma } from "@/lib/db/prisma";
import { WORLD_CUP_NATION_BY_NAME } from "@/lib/nations/world-cup-nations";
import { ensureNationSchema, prepareOwnerPlayersDatabase } from "@/lib/db/ensure-nation-schema";

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

export type OwnerPlayersPageData = {
  nations: NationListItem[];
  error: string | null;
  needsSetup: boolean;
};

function mapNation(
  n: {
    id: string;
    name: string;
    slug: string | null;
    code: string;
    flagEmoji: string | null;
    imageDir: string | null;
    isActive: boolean;
    _count: { players: number };
  }
): NationListItem {
  const catalog = WORLD_CUP_NATION_BY_NAME.get(n.name);
  const slug = n.slug ?? catalog?.slug ?? n.code.toLowerCase();
  const imageDir = n.imageDir ?? catalog?.imageDir ?? `players/${slug}`;

  return {
    id: n.id,
    name: n.name,
    slug,
    code: n.code,
    flagEmoji: n.flagEmoji ?? catalog?.flagEmoji ?? null,
    imageDir,
    isActive: n.isActive ?? true,
    playerCount: n._count.players,
  };
}

export async function getOwnerPlayersPageData(): Promise<OwnerPlayersPageData> {
  try {
    const schema = await ensureNationSchema();
    if (!schema.ok) {
      return {
        nations: [],
        error: schema.error,
        needsSetup: true,
      };
    }

    const nations = await prisma.nationalTeam.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { players: true } } },
    });

    if (nations.length === 0) {
      return {
        nations: [],
        error: null,
        needsSetup: true,
      };
    }

    return {
      nations: nations.map(mapNation),
      error: null,
      needsSetup: false,
    };
  } catch (error) {
    console.error("[getOwnerPlayersPageData]", error);
    return {
      nations: [],
      error: error instanceof Error ? error.message : "Failed to load nations",
      needsSetup: true,
    };
  }
}

export async function getNationsListData(): Promise<NationListItem[]> {
  const page = await getOwnerPlayersPageData();
  return page.nations;
}

export async function getNationDetailData(slug: string): Promise<NationDetailData | null> {
  try {
    const schema = await ensureNationSchema();
    if (!schema.ok) return null;

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

    const mapped = mapNation(nation);

    return {
      nation: mapped,
      players: nation.players.map((p) => ({
        id: p.id,
        name: p.name,
        position: p.position,
        photoUrl: p.photoUrl,
        positionLocked: p.positionLocked ?? true,
        ownerTeamName: p.fantasySlots[0]?.fantasyTeam.user.teamName ?? null,
        isAssigned: p.fantasySlots.length > 0,
      })),
      users,
    };
  } catch (error) {
    console.error("[getNationDetailData]", error);
    return null;
  }
}

