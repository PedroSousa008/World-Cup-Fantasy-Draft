import { MatchStage } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { resolveNationName } from "@/lib/tournament/nation-aliases";
import { GROUP_STAGE_SCHEDULE } from "@/lib/tournament/schedule-data";
import { TOURNAMENT_GROUPS } from "@/lib/tournament/groups-data";

export async function seedTournamentSchedule(): Promise<{
  matchesCreated: number;
  matchesUpdated: number;
  groupsAssigned: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let matchesCreated = 0;
  let matchesUpdated = 0;
  let groupsAssigned = 0;

  const teams = await prisma.nationalTeam.findMany();
  const byName = new Map(teams.map((t) => [t.name, t]));

  for (const [group, nationNames] of Object.entries(TOURNAMENT_GROUPS)) {
    for (const rawName of nationNames) {
      const name = resolveNationName(rawName) ?? rawName;
      const team = byName.get(name);
      if (!team) {
        errors.push(`Group ${group}: nation not in DB — ${rawName}`);
        continue;
      }
      await prisma.nationalTeam.update({
        where: { id: team.id },
        data: { groupName: group },
      });
      groupsAssigned++;
    }
  }

  for (const row of GROUP_STAGE_SCHEDULE) {
    const homeName = resolveNationName(row.home);
    const awayName = resolveNationName(row.away);
    if (!homeName || !awayName) {
      errors.push(`Unresolved teams: ${row.home} vs ${row.away}`);
      continue;
    }
    const home = byName.get(homeName);
    const away = byName.get(awayName);
    if (!home || !away) {
      errors.push(`Missing DB team: ${row.home} vs ${row.away}`);
      continue;
    }

    const scheduledAt = new Date(row.scheduledAt);
    const existing = await prisma.match.findFirst({
      where: {
        matchday: row.matchday,
        homeTeamId: home.id,
        awayTeamId: away.id,
        stage: MatchStage.GROUP,
      },
    });

    if (existing) {
      await prisma.match.update({
        where: { id: existing.id },
        data: {
          scheduledAt,
          groupName: row.group,
          matchday: row.matchday,
        },
      });
      matchesUpdated++;
    } else {
      await prisma.match.create({
        data: {
          homeTeamId: home.id,
          awayTeamId: away.id,
          scheduledAt,
          matchday: row.matchday,
          groupName: row.group,
          stage: MatchStage.GROUP,
          status: "SCHEDULED",
        },
      });
      matchesCreated++;
    }
  }

  return { matchesCreated, matchesUpdated, groupsAssigned, errors };
}
