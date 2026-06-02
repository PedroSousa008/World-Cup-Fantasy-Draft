import { prisma } from "@/lib/db/prisma";
import type { PlayerFixture } from "@/lib/tournament/types";

export async function getPlayerFixture(
  nationalTeamId: string | null | undefined,
  nationality: string
): Promise<PlayerFixture> {
  let teamId = nationalTeamId ?? null;

  if (!teamId) {
    const team = await prisma.nationalTeam.findFirst({
      where: { OR: [{ name: nationality }, { code: nationality }] },
      select: { id: true, name: true },
    });
    teamId = team?.id ?? null;
  }

  if (!teamId) {
    return {
      fixture: "No fixture scheduled",
      opponent: "—",
      scheduledAt: null,
      matchday: null,
      groupName: null,
      status: "not_started",
    };
  }

  const team = await prisma.nationalTeam.findUnique({
    where: { id: teamId },
    select: { id: true, name: true },
  });

  if (!team) {
    return {
      fixture: "No fixture scheduled",
      opponent: "—",
      scheduledAt: null,
      matchday: null,
      groupName: null,
      status: "not_started",
    };
  }

  const nextMatch = await prisma.match.findFirst({
    where: {
      OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
      status: { in: ["SCHEDULED", "LIVE"] },
    },
    orderBy: { scheduledAt: "asc" },
    include: { homeTeam: true, awayTeam: true },
  });

  if (!nextMatch) {
    const lastPlayed = await prisma.match.findFirst({
      where: {
        OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
        status: "FINISHED",
      },
      orderBy: { scheduledAt: "desc" },
      include: { homeTeam: true, awayTeam: true },
    });
    if (lastPlayed) {
      const opponent =
        lastPlayed.homeTeamId === team.id
          ? lastPlayed.awayTeam.name
          : lastPlayed.homeTeam.name;
      return {
        fixture: `${team.name} vs ${opponent}`,
        opponent,
        scheduledAt: lastPlayed.scheduledAt.toISOString(),
        matchday: lastPlayed.matchday,
        groupName: lastPlayed.groupName,
        status: "finished",
      };
    }
    return {
      fixture: "No fixture scheduled",
      opponent: "—",
      scheduledAt: null,
      matchday: null,
      groupName: null,
      status: "not_started",
    };
  }

  const opponent =
    nextMatch.homeTeamId === team.id ? nextMatch.awayTeam.name : nextMatch.homeTeam.name;
  const status =
    nextMatch.status === "LIVE"
      ? "live"
      : nextMatch.status === "FINISHED"
        ? "finished"
        : "not_started";

  return {
    fixture: `${team.name} vs ${opponent}`,
    opponent,
    scheduledAt: nextMatch.scheduledAt.toISOString(),
    matchday: nextMatch.matchday,
    groupName: nextMatch.groupName,
    status,
  };
}
