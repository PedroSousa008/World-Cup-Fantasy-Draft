import type { Match, NationalTeam } from "@prisma/client";
import type { GroupStandingRow, GroupTable, ThirdPlaceRow } from "@/lib/tournament/types";
import { GROUP_LETTERS, TOURNAMENT_GROUPS } from "@/lib/tournament/groups-data";

type FinishedMatch = Match & {
  homeTeam: NationalTeam;
  awayTeam: NationalTeam;
};

interface TeamAccumulator {
  teamId: string;
  teamName: string;
  flagEmoji: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
}

function emptyAcc(team: NationalTeam): TeamAccumulator {
  return {
    teamId: team.id,
    teamName: team.name,
    flagEmoji: team.flagEmoji,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  };
}

function applyResult(
  acc: TeamAccumulator,
  goalsFor: number,
  goalsAgainst: number
): void {
  acc.played += 1;
  acc.goalsFor += goalsFor;
  acc.goalsAgainst += goalsAgainst;
  if (goalsFor > goalsAgainst) acc.won += 1;
  else if (goalsFor === goalsAgainst) acc.drawn += 1;
  else acc.lost += 1;
}

function toRow(acc: TeamAccumulator, position: number): GroupStandingRow {
  const gd = acc.goalsFor - acc.goalsAgainst;
  const points = acc.won * 3 + acc.drawn;
  return {
    position,
    teamId: acc.teamId,
    teamName: acc.teamName,
    flagEmoji: acc.flagEmoji,
    played: acc.played,
    won: acc.won,
    drawn: acc.drawn,
    lost: acc.lost,
    goalsFor: acc.goalsFor,
    goalsAgainst: acc.goalsAgainst,
    goalDifference: gd,
    points,
    qualified: false,
    eliminated: false,
    isThirdPlace: false,
    manualOverride: false,
  };
}

function teamsForGroup(group: string, teams: NationalTeam[]): NationalTeam[] {
  const byGroup = teams.filter((t) => t.groupName === group);
  if (byGroup.length >= 4) return byGroup;
  const names = TOURNAMENT_GROUPS[group];
  if (!names) return byGroup;
  const byName = names
    .map((name) => teams.find((t) => t.name === name))
    .filter((t): t is NationalTeam => Boolean(t));
  return byName.length > 0 ? byName : byGroup;
}

function sortRows(rows: GroupStandingRow[]): GroupStandingRow[] {
  return [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamName.localeCompare(b.teamName);
  });
}

export type StandingOverrideInput = {
  nationalTeamId: string;
  played?: number | null;
  won?: number | null;
  drawn?: number | null;
  lost?: number | null;
  goalsFor?: number | null;
  goalsAgainst?: number | null;
  points?: number | null;
};

export function applyStandingOverrides(
  tables: GroupTable[],
  overrides: StandingOverrideInput[]
): GroupTable[] {
  if (overrides.length === 0) return tables;

  const byTeam = new Map(overrides.map((o) => [o.nationalTeamId, o]));

  return tables.map((table) => {
    const rows = table.rows.map((row) => {
      const o = byTeam.get(row.teamId);
      if (!o) return row;

      const played = o.played ?? row.played;
      const won = o.won ?? row.won;
      const drawn = o.drawn ?? row.drawn;
      const lost = o.lost ?? row.lost;
      const goalsFor = o.goalsFor ?? row.goalsFor;
      const goalsAgainst = o.goalsAgainst ?? row.goalsAgainst;
      const goalDifference = goalsFor - goalsAgainst;
      const points = o.points ?? won * 3 + drawn;

      return {
        ...row,
        played,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points,
        manualOverride: true,
      };
    });

    const sorted = sortRows(rows).map((r, i) => ({ ...r, position: i + 1 }));
    return { ...table, rows: sorted };
  });
}

export function computeGroupStandings(
  teams: NationalTeam[],
  matches: FinishedMatch[]
): GroupTable[] {
  const finished = matches.filter(
    (m) =>
      m.status === "FINISHED" &&
      m.homeScore != null &&
      m.awayScore != null &&
      m.groupName
  );

  const tables: GroupTable[] = [];

  for (const group of GROUP_LETTERS) {
    const groupTeams = teamsForGroup(group, teams);
    const accMap = new Map<string, TeamAccumulator>();
    for (const t of groupTeams) accMap.set(t.id, emptyAcc(t));

    for (const m of finished) {
      if (m.groupName !== group) continue;
      const home = accMap.get(m.homeTeamId);
      const away = accMap.get(m.awayTeamId);
      if (!home || !away) continue;
      const hs = m.homeScore!;
      const as = m.awayScore!;
      applyResult(home, hs, as);
      applyResult(away, as, hs);
    }

    const rows = sortRows(
      Array.from(accMap.values()).map((acc, i) => toRow(acc, i + 1))
    ).map((r, i) => ({ ...r, position: i + 1 }));

    const allGroupMatchesPlayed =
      groupTeams.length >= 2 &&
      finished.filter((m) => m.groupName === group).length >=
        (groupTeams.length * (groupTeams.length - 1)) / 2;

    for (const row of rows) {
      if (row.position <= 2 && allGroupMatchesPlayed) row.qualified = true;
      if (row.position >= 3 && allGroupMatchesPlayed) {
        row.eliminated = row.position > 3;
        row.isThirdPlace = row.position === 3;
      }
    }

    tables.push({ group, rows });
  }

  return tables;
}

function sortThirdPlaceRows(rows: ThirdPlaceRow[]): ThirdPlaceRow[] {
  return [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamName.localeCompare(b.teamName);
  });
}

export function computeBestThirdPlace(tables: GroupTable[]): ThirdPlaceRow[] {
  const thirds: ThirdPlaceRow[] = [];
  for (const table of tables) {
    const third = table.rows.find((r) => r.position === 3);
    if (third) thirds.push({ ...third, group: table.group });
  }
  return sortThirdPlaceRows(thirds).map((r, i) => ({
    ...r,
    position: i + 1,
    qualified: i < 8,
    eliminated: i >= 8,
  }));
}

export function applyBestThirdQualification(
  tables: GroupTable[],
  bestThird: ThirdPlaceRow[]
): GroupTable[] {
  const qualifiedThirdIds = new Set(
    bestThird.filter((r) => r.qualified).map((r) => r.teamId)
  );
  return tables.map((table) => ({
    ...table,
    rows: table.rows.map((row) => {
      if (row.position !== 3 || !qualifiedThirdIds.has(row.teamId)) return row;
      return { ...row, qualified: true, eliminated: false };
    }),
  }));
}

export function countQualifiedTeams(tables: GroupTable[], bestThird: ThirdPlaceRow[]): number {
  const fromGroups = tables.reduce((n, t) => n + t.rows.filter((r) => r.qualified).length, 0);
  const fromThird = bestThird.filter((r) => r.qualified).length;
  return fromGroups + fromThird;
}
