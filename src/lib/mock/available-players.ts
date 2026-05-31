import type { FantasyPlayer } from "@/lib/squad/squad-utils";
import { MOCK_SQUAD } from "@/lib/mock/my-team-data";

function toFantasyPlayer(p: (typeof MOCK_SQUAD)[0], price: number, fixture: string): FantasyPlayer {
  return {
    id: p.id,
    name: p.name,
    position: p.position,
    nation: p.nation,
    club: p.club,
    price,
    totalPoints: p.totalPoints,
    matchdayPoints: p.matchdayPoints,
    matchStatus: p.matchStatus,
    upcomingFixture: fixture,
    goals: p.goals,
    assists: p.assists,
    yellowCards: p.yellowCards,
    redCards: p.redCards,
    isDrafted: true,
    matchHistory: p.matchHistory,
  };
}

const FIXTURES: Record<string, string> = {
  Portugal: "POR vs ARG",
  France: "FRA vs BRA",
  Brazil: "BRA vs FRA",
  England: "ENG vs GER",
  Argentina: "ARG vs POR",
  Spain: "ESP vs ITA",
  Germany: "GER vs ENG",
  Italy: "ITA vs ESP",
};

export const MOCK_AVAILABLE_PLAYERS: FantasyPlayer[] = [
  ...MOCK_SQUAD.map((p, i) =>
    toFantasyPlayer(p, 8.5 + i * 0.3, FIXTURES[p.nation] ?? `${p.nation.slice(0, 3).toUpperCase()} vs TBD`)
  ),
  {
    id: "av-1",
    name: "Kylian Mbappé",
    position: "FWD",
    nation: "France",
    club: "Real Madrid",
    price: 12.5,
    totalPoints: 89,
    matchdayPoints: 14,
    matchStatus: "live",
    upcomingFixture: "FRA vs BRA",
    goals: 4,
    assists: 2,
    yellowCards: 0,
    redCards: 0,
    isDrafted: false,
    matchHistory: [{ matchday: 1, opponent: "Austria", points: 12 }],
  },
  {
    id: "av-2",
    name: "Jude Bellingham",
    position: "MID",
    nation: "England",
    club: "Real Madrid",
    price: 11.0,
    totalPoints: 72,
    matchdayPoints: 10,
    matchStatus: "not_started",
    upcomingFixture: "ENG vs GER",
    goals: 2,
    assists: 3,
    yellowCards: 1,
    redCards: 0,
    isDrafted: false,
    matchHistory: [],
  },
  {
    id: "av-3",
    name: "Alisson",
    position: "GK",
    nation: "Brazil",
    club: "Liverpool",
    price: 6.0,
    totalPoints: 34,
    matchdayPoints: 4,
    matchStatus: "not_started",
    upcomingFixture: "BRA vs FRA",
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    isDrafted: false,
    matchHistory: [],
  },
  {
    id: "av-4",
    name: "Antoine Griezmann",
    position: "FWD",
    nation: "France",
    club: "Atlético Madrid",
    price: 9.5,
    totalPoints: 55,
    matchdayPoints: 8,
    matchStatus: "live",
    upcomingFixture: "FRA vs BRA",
    goals: 2,
    assists: 1,
    yellowCards: 0,
    redCards: 0,
    isDrafted: false,
    matchHistory: [],
  },
  {
    id: "av-5",
    name: "Rodri",
    position: "MID",
    nation: "Spain",
    club: "Man City",
    price: 10.0,
    totalPoints: 61,
    matchdayPoints: 7,
    matchStatus: "not_started",
    upcomingFixture: "ESP vs ITA",
    goals: 1,
    assists: 2,
    yellowCards: 0,
    redCards: 0,
    isDrafted: false,
    matchHistory: [],
  },
  {
    id: "av-6",
    name: "Marquinhos",
    position: "DEF",
    nation: "Brazil",
    club: "PSG",
    price: 7.5,
    totalPoints: 42,
    matchdayPoints: 6,
    matchStatus: "not_started",
    upcomingFixture: "BRA vs FRA",
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    isDrafted: false,
    matchHistory: [],
  },
];

export function getInitialAssignments(formationDef = 4, formationMid = 3, formationFwd = 3) {
  const assignments: Record<string, string | null> = {};
  assignments["gk-0"] = MOCK_SQUAD.find((p) => p.position === "GK" && p.isStarter)?.id ?? null;

  const defs = MOCK_SQUAD.filter((p) => p.position === "DEF" && p.isStarter);
  for (let i = 0; i < formationDef; i++) assignments[`def-${i}`] = defs[i]?.id ?? null;

  const mids = MOCK_SQUAD.filter((p) => p.position === "MID" && p.isStarter);
  for (let i = 0; i < formationMid; i++) assignments[`mid-${i}`] = mids[i]?.id ?? null;

  const fwds = MOCK_SQUAD.filter((p) => p.position === "FWD" && p.isStarter);
  for (let i = 0; i < formationFwd; i++) assignments[`fwd-${i}`] = fwds[i]?.id ?? null;

  const bench = MOCK_SQUAD.filter((p) => !p.isStarter);
  for (let i = 0; i < 7; i++) assignments[`bench-${i}`] = bench[i]?.id ?? null;

  return assignments;
}

export function buildPlayersMap(): Record<string, FantasyPlayer> {
  const map: Record<string, FantasyPlayer> = {};
  for (const p of MOCK_AVAILABLE_PLAYERS) {
    map[p.id] = p;
  }
  return map;
}
