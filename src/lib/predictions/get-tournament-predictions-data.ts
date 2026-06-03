import { prisma } from "@/lib/db/prisma";
import { GROUP_LETTERS, TOURNAMENT_GROUPS } from "@/lib/tournament/groups-data";
import { getKnockoutUnlockState } from "@/lib/predictions/tournament-status";

export interface GroupTeamOption {
  id: string;
  name: string;
  flagEmoji: string | null;
  code: string;
}

export interface GroupPredictionState {
  groupName: string;
  teams: GroupTeamOption[];
  positions: [string | null, string | null, string | null, string | null];
  isComplete: boolean;
}

export interface TournamentPredictionsData {
  groups: GroupPredictionState[];
  completedGroupCount: number;
  allGroupsComplete: boolean;
  knockoutUnlocked: boolean;
  knockoutLocked: boolean;
}

async function loadTeamsByGroup(): Promise<Map<string, GroupTeamOption[]>> {
  const dbTeams = await prisma.nationalTeam.findMany({
    where: { groupName: { not: null } },
    select: { id: true, name: true, groupName: true, flagEmoji: true, code: true },
    orderBy: { name: "asc" },
  });

  const byGroup = new Map<string, GroupTeamOption[]>();

  if (dbTeams.length > 0) {
    for (const team of dbTeams) {
      const group = team.groupName!;
      const list = byGroup.get(group) ?? [];
      list.push({
        id: team.id,
        name: team.name,
        flagEmoji: team.flagEmoji,
        code: team.code,
      });
      byGroup.set(group, list);
    }
    return byGroup;
  }

  const allTeams = await prisma.nationalTeam.findMany({
    select: { id: true, name: true, flagEmoji: true, code: true },
  });
  const byName = new Map(allTeams.map((t) => [t.name, t]));

  for (const group of GROUP_LETTERS) {
    const names = TOURNAMENT_GROUPS[group] ?? [];
    const teams: GroupTeamOption[] = [];
    for (const name of names) {
      const team = byName.get(name);
      if (team) {
        teams.push({
          id: team.id,
          name: team.name,
          flagEmoji: team.flagEmoji,
          code: team.code,
        });
      }
    }
    byGroup.set(group, teams);
  }

  return byGroup;
}

export async function getTournamentPredictionsData(
  userId: string
): Promise<TournamentPredictionsData> {
  const [teamsByGroup, saved, unlock, user] = await Promise.all([
    loadTeamsByGroup(),
    prisma.userGroupPrediction.findMany({ where: { userId } }),
    getKnockoutUnlockState(),
    prisma.user.findUnique({
      where: { id: userId },
      select: { knockoutPredictionsLocked: true },
    }),
  ]);

  const savedByGroup = new Map(saved.map((row) => [row.groupName, row]));

  const groups: GroupPredictionState[] = GROUP_LETTERS.map((groupName) => {
    const teams = teamsByGroup.get(groupName) ?? [];
    const row = savedByGroup.get(groupName);
    const positions: [string | null, string | null, string | null, string | null] = row
      ? [row.firstPlaceId, row.secondPlaceId, row.thirdPlaceId, row.fourthPlaceId]
      : [null, null, null, null];
    const isComplete = positions.every(Boolean);
    return { groupName, teams, positions, isComplete };
  });

  const completedGroupCount = groups.filter((g) => g.isComplete).length;

  return {
    groups,
    completedGroupCount,
    allGroupsComplete: completedGroupCount === GROUP_LETTERS.length,
    knockoutUnlocked: unlock.unlocked,
    knockoutLocked: user?.knockoutPredictionsLocked ?? false,
  };
}

export function isGroupPredictionComplete(
  positions: [string | null, string | null, string | null, string | null]
): boolean {
  return positions.every(Boolean);
}
