import { prisma } from "@/lib/db/prisma";
import { loadMatchdayInfos } from "@/lib/powers/matchday";
import type { MatchdayGroup, TournamentMatchCard } from "@/lib/tournament/types";
import {
  applyBestThirdQualification,
  applyStandingOverrides,
  computeGroupStandings,
  computeBestThirdPlace,
} from "@/lib/tournament/standings";

function mapMatch(
  m: Awaited<ReturnType<typeof loadMatches>>[number]
): TournamentMatchCard {
  return {
    id: m.id,
    matchday: m.matchday ?? 0,
    groupName: m.groupName,
    scheduledAt: m.scheduledAt.toISOString(),
    status: m.status,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    bettingOpen: m.bettingOpen,
    manOfTheMatchId: m.manOfTheMatchId,
    homeTeam: {
      id: m.homeTeam.id,
      name: m.homeTeam.name,
      slug: m.homeTeam.slug,
      flagEmoji: m.homeTeam.flagEmoji,
      groupName: m.homeTeam.groupName,
    },
    awayTeam: {
      id: m.awayTeam.id,
      name: m.awayTeam.name,
      slug: m.awayTeam.slug,
      flagEmoji: m.awayTeam.flagEmoji,
      groupName: m.awayTeam.groupName,
    },
  };
}

async function loadMatches() {
  return prisma.match.findMany({
    where: {
      matchday: { not: null },
      OR: [
        { stage: "GROUP" },
        {
          stage: "KNOCKOUT",
          knockoutMatchKey: { not: null },
        },
      ],
    },
    orderBy: [{ scheduledAt: "asc" }],
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  });
}

export async function getMatchesByMatchday(): Promise<MatchdayGroup[]> {
  const [matches, mdInfos] = await Promise.all([loadMatches(), loadMatchdayInfos()]);
  const byMd = new Map<number, TournamentMatchCard[]>();

  for (const m of matches) {
    const md = m.matchday ?? 0;
    if (!byMd.has(md)) byMd.set(md, []);
    byMd.get(md)!.push(mapMatch(m));
  }

  const matchdays = [...byMd.keys()].sort((a, b) => a - b);

  return matchdays.map((matchday) => {
    const info = mdInfos.find((i) => i.matchday === matchday);
    return {
      matchday,
      kickoffAt: info?.kickoffAt?.toISOString() ?? null,
      isLocked: info ? !info.isOpen : false,
      matches: byMd.get(matchday) ?? [],
    };
  });
}

export async function getAllTournamentMatches(): Promise<TournamentMatchCard[]> {
  const matches = await loadMatches();
  return matches.map(mapMatch);
}

export async function getGroupTablesData() {
  const [teams, matches, overrides] = await Promise.all([
    prisma.nationalTeam.findMany({ where: { groupName: { not: null } } }),
    prisma.match.findMany({
      include: { homeTeam: true, awayTeam: true },
    }),
    prisma.groupStandingOverride.findMany(),
  ]);

  const computed = computeGroupStandings(teams, matches);
  const rawTables = applyStandingOverrides(computed, overrides);
  const bestThird = computeBestThirdPlace(rawTables);
  const tables = applyBestThirdQualification(rawTables, bestThird);

  return { tables, bestThird, overrides };
}

export async function getMatchDetail(matchId: string) {
  return prisma.match.findUnique({
    where: { id: matchId },
    include: {
      homeTeam: true,
      awayTeam: true,
      manOfTheMatch: { select: { id: true, name: true, photoUrl: true, position: true } },
      events: {
        orderBy: [{ minute: "asc" }, { createdAt: "asc" }],
        include: { player: { select: { id: true, name: true, position: true, photoUrl: true } } },
      },
    },
  });
}

export async function getOwnerMatchesList() {
  const matches = await prisma.match.findMany({
    orderBy: [{ matchday: "asc" }, { scheduledAt: "asc" }],
    include: {
      homeTeam: true,
      awayTeam: true,
      events: { select: { id: true } },
    },
  });
  return matches;
}
