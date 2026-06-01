import type { PlayerPosition } from "@/lib/players/types";

export { getNationFlag, WORLD_CUP_NATION_FLAGS as NATION_FLAGS } from "@/lib/nations";
export type { PlayerPosition } from "@/lib/players/types";
export type MatchStatus = "live" | "finished" | "not_started" | "eliminated" | "injured";

export interface SquadPlayer {
  id: string;
  name: string;
  position: PlayerPosition;
  nation: string;
  club: string;
  photoUrl?: string;
  totalPoints: number;
  matchdayPoints: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isStarter: boolean;
  matchStatus: MatchStatus;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  upcomingMatch?: string;
  matchHistory: { matchday: number; opponent: string; points: number }[];
}

export interface TeamSummary {
  rank: number;
  totalPoints: number;
  matchdayPoints: number;
}

export interface RankingEntry {
  rank: number;
  teamName: string;
  nation: string;
  points: number;
  movement: number;
}

export interface DraftPlayer {
  id: string;
  name: string;
  nation: string;
  position: PlayerPosition;
  club: string;
}

export interface DraftFeedItem {
  id: string;
  manager: string;
  player: string;
  timestamp: string;
}

export interface PowerCard {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: "available" | "used" | "expired" | "locked";
  history?: {
    target?: string;
    matchday?: number;
    bonus?: string;
  };
}

export const MOCK_TEAM_SUMMARY: TeamSummary = {
  rank: 2,
  totalPoints: 421,
  matchdayPoints: 67,
};

export const MOCK_SQUAD: SquadPlayer[] = [
  {
    id: "1",
    name: "Diogo Costa",
    position: "GK",
    nation: "Portugal",
    club: "FC Porto",
    totalPoints: 28,
    matchdayPoints: 6,
    isStarter: true,
    matchStatus: "finished",
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    upcomingMatch: "MD3 vs Morocco",
    matchHistory: [
      { matchday: 1, opponent: "Czechia", points: 6 },
      { matchday: 2, opponent: "Turkey", points: 8 },
    ],
  },
  {
    id: "2",
    name: "Rúben Dias",
    position: "DEF",
    nation: "Portugal",
    club: "Man City",
    totalPoints: 45,
    matchdayPoints: 12,
    isStarter: true,
    matchStatus: "live",
    goals: 0,
    assists: 1,
    yellowCards: 0,
    redCards: 0,
    upcomingMatch: "Live vs France",
    matchHistory: [
      { matchday: 1, opponent: "Czechia", points: 8 },
      { matchday: 2, opponent: "Turkey", points: 10 },
    ],
  },
  {
    id: "3",
    name: "João Cancelo",
    position: "DEF",
    nation: "Portugal",
    club: "Al-Hilal",
    totalPoints: 38,
    matchdayPoints: 8,
    isStarter: true,
    matchStatus: "live",
    goals: 0,
    assists: 0,
    yellowCards: 1,
    redCards: 0,
    matchHistory: [{ matchday: 1, opponent: "Czechia", points: 7 }],
  },
  {
    id: "4",
    name: "Vitinha",
    position: "MID",
    nation: "Portugal",
    club: "PSG",
    totalPoints: 52,
    matchdayPoints: 14,
    isCaptain: true,
    isStarter: true,
    matchStatus: "live",
    goals: 1,
    assists: 1,
    yellowCards: 0,
    redCards: 0,
    matchHistory: [
      { matchday: 1, opponent: "Czechia", points: 12 },
      { matchday: 2, opponent: "Turkey", points: 14 },
    ],
  },
  {
    id: "5",
    name: "Bernardo Silva",
    position: "MID",
    nation: "Portugal",
    club: "Man City",
    totalPoints: 41,
    matchdayPoints: 9,
    isViceCaptain: true,
    isStarter: true,
    matchStatus: "finished",
    goals: 0,
    assists: 2,
    yellowCards: 0,
    redCards: 0,
    matchHistory: [{ matchday: 1, opponent: "Czechia", points: 9 }],
  },
  {
    id: "6",
    name: "Rafael Leão",
    position: "MID",
    nation: "Portugal",
    club: "AC Milan",
    totalPoints: 36,
    matchdayPoints: 7,
    isStarter: true,
    matchStatus: "not_started",
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    upcomingMatch: "MD3 vs Morocco",
    matchHistory: [{ matchday: 1, opponent: "Czechia", points: 5 }],
  },
  {
    id: "7",
    name: "Cristiano Ronaldo",
    position: "FWD",
    nation: "Portugal",
    club: "Al-Nassr",
    totalPoints: 58,
    matchdayPoints: 11,
    isStarter: true,
    matchStatus: "live",
    goals: 2,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    matchHistory: [
      { matchday: 1, opponent: "Czechia", points: 14 },
      { matchday: 2, opponent: "Turkey", points: 11 },
    ],
  },
  {
    id: "8",
    name: "Pedro Neto",
    position: "FWD",
    nation: "Portugal",
    club: "Chelsea",
    totalPoints: 29,
    matchdayPoints: 0,
    isStarter: true,
    matchStatus: "injured",
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    matchHistory: [{ matchday: 1, opponent: "Czechia", points: 4 }],
  },
  {
    id: "9",
    name: "Gonçalo Ramos",
    position: "FWD",
    nation: "Portugal",
    club: "PSG",
    totalPoints: 18,
    matchdayPoints: 0,
    isStarter: false,
    matchStatus: "not_started",
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    matchHistory: [],
  },
  {
    id: "10",
    name: "Nuno Mendes",
    position: "DEF",
    nation: "Portugal",
    club: "PSG",
    totalPoints: 22,
    matchdayPoints: 0,
    isStarter: false,
    matchStatus: "not_started",
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    matchHistory: [],
  },
  {
    id: "11",
    name: "João Félix",
    position: "MID",
    nation: "Portugal",
    club: "AC Milan",
    totalPoints: 15,
    matchdayPoints: 0,
    isStarter: false,
    matchStatus: "eliminated",
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    matchHistory: [{ matchday: 1, opponent: "Czechia", points: 2 }],
  },
  {
    id: "12",
    name: "José Sá",
    position: "GK",
    nation: "Portugal",
    club: "Wolves",
    totalPoints: 8,
    matchdayPoints: 0,
    isStarter: false,
    matchStatus: "not_started",
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    matchHistory: [],
  },
];

export const MOCK_OVERALL_RANKINGS: RankingEntry[] = [
  { rank: 1, teamName: "João FC", nation: "France", points: 468, movement: 2 },
  { rank: 2, teamName: "Pedro FC", nation: "Portugal", points: 421, movement: 0 },
  { rank: 3, teamName: "Miguel XI", nation: "Brazil", points: 405, movement: -1 },
  { rank: 4, teamName: "Draft Kings", nation: "Argentina", points: 392, movement: 3 },
  { rank: 5, teamName: "Galácticos", nation: "Spain", points: 378, movement: -2 },
  { rank: 6, teamName: "Last Place FC", nation: "England", points: 341, movement: 1 },
];

export const MOCK_MATCHDAY_RANKINGS: RankingEntry[] = [
  { rank: 1, teamName: "Miguel XI", nation: "Brazil", points: 78, movement: 4 },
  { rank: 2, teamName: "Pedro FC", nation: "Portugal", points: 67, movement: 1 },
  { rank: 3, teamName: "João FC", nation: "France", points: 62, movement: -2 },
  { rank: 4, teamName: "Galácticos", nation: "Spain", points: 54, movement: 0 },
  { rank: 5, teamName: "Draft Kings", nation: "Argentina", points: 48, movement: -1 },
];

export const MOCK_PLAYER_RANKINGS = [
  { label: "Most Points", player: "Mbappé", nation: "France", value: "89 pts" },
  { label: "Most Goals", player: "Ronaldo", nation: "Portugal", value: "5 goals" },
  { label: "Most Assists", player: "Bellingham", nation: "England", value: "4 assists" },
  { label: "Best GK", player: "Donnarumma", nation: "Italy", value: "42 pts" },
  { label: "Best DEF", player: "Hakimi", nation: "Morocco", value: "51 pts" },
  { label: "Best MID", player: "Vitinha", nation: "Portugal", value: "52 pts" },
  { label: "Best FWD", player: "Mbappé", nation: "France", value: "89 pts" },
];

export const MOCK_SPECIAL_RANKINGS = [
  { title: "Best Captain Choices", leader: "João FC", detail: "Avg 14.2 pts", icon: "👑" },
  { title: "Worst Captain Choices", leader: "Last Place FC", detail: "Avg 3.1 pts", icon: "💀" },
  { title: "Most Bench Points", leader: "Miguel XI", detail: "38 pts total", icon: "🪑" },
  { title: "Best Bet Record", leader: "Draft Kings", detail: "7W - 2L", icon: "🎯" },
  { title: "Best Prediction Record", leader: "Galácticos", detail: "82% accuracy", icon: "🔮" },
];

export const MOCK_DRAFT_PLAYERS: DraftPlayer[] = [
  { id: "d1", name: "Kylian Mbappé", nation: "France", position: "FWD", club: "Real Madrid" },
  { id: "d2", name: "Jude Bellingham", nation: "England", position: "MID", club: "Real Madrid" },
  { id: "d3", name: "Vinícius Jr", nation: "Brazil", position: "FWD", club: "Real Madrid" },
  { id: "d4", name: "Lamine Yamal", nation: "Spain", position: "FWD", club: "Barcelona" },
  { id: "d5", name: "Rodri", nation: "Spain", position: "MID", club: "Man City" },
  { id: "d6", name: "Alisson", nation: "Brazil", position: "GK", club: "Liverpool" },
];

export const MOCK_DRAFT_FEED: DraftFeedItem[] = [
  { id: "f1", manager: "João", player: "Mbappé", timestamp: "Just now" },
  { id: "f2", manager: "Pedro", player: "Bellingham", timestamp: "1m ago" },
  { id: "f3", manager: "Miguel", player: "Vinícius Jr", timestamp: "2m ago" },
  { id: "f4", manager: "Tiago", player: "Rodri", timestamp: "3m ago" },
  { id: "f5", manager: "André", player: "Alisson", timestamp: "4m ago" },
];

export const MOCK_POWERS: PowerCard[] = [
  {
    id: "p1",
    name: "Double Points",
    description: "Double your matchday points for one player.",
    icon: "✖️2",
    status: "available",
  },
  {
    id: "p2",
    name: "Triple Captain",
    description: "Your captain scores triple points this matchday.",
    icon: "👑",
    status: "used",
    history: { target: "Vitinha", matchday: 2, bonus: "+18 Bonus Points" },
  },
  {
    id: "p3",
    name: "Rival Challenge",
    description: "Challenge a rival — winner takes bonus points.",
    icon: "⚔️",
    status: "available",
  },
  {
    id: "p4",
    name: "Lucky Dip",
    description: "Swap a bench player for a random available pick.",
    icon: "🎲",
    status: "locked",
  },
  {
    id: "p5",
    name: "Wildcard",
    description: "Unlimited free transfers for one matchday.",
    icon: "🃏",
    status: "available",
  },
  {
    id: "p6",
    name: "Block Bet",
    description: "Block an opponent's bet for one matchday.",
    icon: "🛡️",
    status: "expired",
    history: { matchday: 1 },
  },
];
