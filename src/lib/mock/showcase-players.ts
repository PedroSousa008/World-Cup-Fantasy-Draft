import type { FantasyPlayer } from "@/lib/squad/squad-utils";

const FIXTURES: Record<string, { fixture: string; date: string }> = {
  France: { fixture: "FRA vs BRA", date: "Jun 15" },
  England: { fixture: "ENG vs GER", date: "Jun 18" },
  Brazil: { fixture: "BRA vs FRA", date: "Jun 15" },
  Spain: { fixture: "ESP vs ITA", date: "Jun 20" },
  Portugal: { fixture: "POR vs ARG", date: "Jun 22" },
  Italy: { fixture: "ITA vs ESP", date: "Jun 20" },
};

function makePlayer(
  partial: Omit<FantasyPlayer, "matchHistory" | "isDrafted" | "motmAwards" | "upcomingFixture" | "matchDate"> & {
    matchHistory?: FantasyPlayer["matchHistory"];
    motmAwards?: number;
    upcomingFixture?: string;
    matchDate?: string;
  }
): FantasyPlayer {
  const fx = FIXTURES[partial.nation] ?? { fixture: "TBD vs TBD", date: "TBD" };
  return {
    ...partial,
    matchHistory: partial.matchHistory ?? [],
    isDrafted: false,
    motmAwards: partial.motmAwards ?? 0,
    upcomingFixture: partial.upcomingFixture ?? fx.fixture,
    matchDate: partial.matchDate ?? fx.date,
  };
}

/** Showcase players for Draft Room & Rankings display (not squad pool) */
export const SHOWCASE_PLAYERS: FantasyPlayer[] = [
  makePlayer({
    id: "show-1",
    name: "Kylian Mbappé",
    position: "FWD",
    nation: "France",
    club: "Real Madrid",
    price: 12.5,
    totalPoints: 89,
    matchdayPoints: 14,
    matchStatus: "live",
    goals: 4,
    assists: 2,
    yellowCards: 0,
    redCards: 0,
    motmAwards: 2,
    matchHistory: [{ matchday: 1, opponent: "Austria", points: 12 }],
  }),
  makePlayer({
    id: "show-2",
    name: "Jude Bellingham",
    position: "MID",
    nation: "England",
    club: "Real Madrid",
    price: 11.0,
    totalPoints: 72,
    matchdayPoints: 10,
    matchStatus: "not_started",
    goals: 2,
    assists: 3,
    yellowCards: 1,
    redCards: 0,
    motmAwards: 1,
  }),
  makePlayer({
    id: "show-3",
    name: "Vinícius Jr",
    position: "FWD",
    nation: "Brazil",
    club: "Real Madrid",
    price: 11.5,
    totalPoints: 78,
    matchdayPoints: 12,
    matchStatus: "live",
    goals: 3,
    assists: 2,
    yellowCards: 0,
    redCards: 0,
    motmAwards: 1,
  }),
  makePlayer({
    id: "show-4",
    name: "Cristiano Ronaldo",
    position: "FWD",
    nation: "Portugal",
    club: "Al-Nassr",
    price: 10.0,
    totalPoints: 58,
    matchdayPoints: 11,
    matchStatus: "live",
    goals: 5,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    motmAwards: 2,
  }),
  makePlayer({
    id: "show-5",
    name: "Lamine Yamal",
    position: "FWD",
    nation: "Spain",
    club: "Barcelona",
    price: 9.0,
    totalPoints: 65,
    matchdayPoints: 9,
    matchStatus: "not_started",
    goals: 2,
    assists: 4,
    yellowCards: 0,
    redCards: 0,
  }),
  makePlayer({
    id: "show-6",
    name: "Rodri",
    position: "MID",
    nation: "Spain",
    club: "Man City",
    price: 10.0,
    totalPoints: 61,
    matchdayPoints: 7,
    matchStatus: "not_started",
    goals: 1,
    assists: 2,
    yellowCards: 0,
    redCards: 0,
  }),
  makePlayer({
    id: "show-7",
    name: "Alisson",
    position: "GK",
    nation: "Brazil",
    club: "Liverpool",
    price: 6.0,
    totalPoints: 34,
    matchdayPoints: 4,
    matchStatus: "not_started",
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
  }),
];

export function getShowcasePlayer(name: string): FantasyPlayer | undefined {
  return SHOWCASE_PLAYERS.find(
    (p) => p.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(p.name.split(" ").pop()?.toLowerCase() ?? "")
  );
}
