export interface NationTheme {
  abbr: string;
  primary: string;
  secondary: string;
  accent: string;
}

export const NATION_THEMES: Record<string, NationTheme> = {
  Argentina: { abbr: "ARG", primary: "#75AADB", secondary: "#FFFFFF", accent: "#F6B40E" },
  Australia: { abbr: "AUS", primary: "#00843D", secondary: "#FFCD00", accent: "#FFFFFF" },
  Belgium: { abbr: "BEL", primary: "#EF3340", secondary: "#FAE042", accent: "#000000" },
  Brazil: { abbr: "BRA", primary: "#009C3B", secondary: "#FFDF00", accent: "#002776" },
  Canada: { abbr: "CAN", primary: "#FF0000", secondary: "#FFFFFF", accent: "#FF0000" },
  Colombia: { abbr: "COL", primary: "#FCD116", secondary: "#003893", accent: "#CE1126" },
  Croatia: { abbr: "CRO", primary: "#FF0000", secondary: "#FFFFFF", accent: "#171796" },
  England: { abbr: "ENG", primary: "#FFFFFF", secondary: "#CE1124", accent: "#00247D" },
  France: { abbr: "FRA", primary: "#002395", secondary: "#ED2939", accent: "#FFFFFF" },
  Germany: { abbr: "GER", primary: "#000000", secondary: "#DD0000", accent: "#FFCE00" },
  Italy: { abbr: "ITA", primary: "#009246", secondary: "#FFFFFF", accent: "#CE2B37" },
  Japan: { abbr: "JPN", primary: "#BC002D", secondary: "#FFFFFF", accent: "#BC002D" },
  Mexico: { abbr: "MEX", primary: "#006847", secondary: "#FFFFFF", accent: "#CE1126" },
  Morocco: { abbr: "MAR", primary: "#C1272D", secondary: "#006233", accent: "#F7F7F7" },
  Netherlands: { abbr: "NED", primary: "#FF6B00", secondary: "#FFFFFF", accent: "#21468B" },
  Portugal: { abbr: "POR", primary: "#006600", secondary: "#FF0000", accent: "#FFD700" },
  Spain: { abbr: "ESP", primary: "#AA151B", secondary: "#F1BF00", accent: "#FFFFFF" },
  USA: { abbr: "USA", primary: "#3C3B6E", secondary: "#B22234", accent: "#FFFFFF" },
  Uruguay: { abbr: "URU", primary: "#0038A8", secondary: "#FFFFFF", accent: "#FFD700" },
};

export function getNationTheme(nation: string): NationTheme {
  return (
    NATION_THEMES[nation] ?? {
      abbr: nation.slice(0, 3).toUpperCase(),
      primary: "#081120",
      secondary: "#0066FF",
      accent: "#FFD700",
    }
  );
}

export function parseFixture(fixture: string): { match: string; opponent: string; date?: string } {
  const parts = fixture.split(" vs ");
  const match = fixture;
  const opponent = parts.length > 1 ? parts[1] : "TBD";
  return { match, opponent };
}
