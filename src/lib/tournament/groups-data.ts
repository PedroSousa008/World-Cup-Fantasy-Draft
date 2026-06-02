/** Group stage assignments — 12 groups × 4 teams */
export const TOURNAMENT_GROUPS: Record<string, readonly string[]> = {
  A: ["Czech Republic", "Mexico", "South Africa", "South Korea"],
  B: ["Switzerland", "Bosnia and Herzegovina", "Canada", "Qatar"],
  C: ["Scotland", "Brazil", "Haiti", "Morocco"],
  D: ["Australia", "Türkiye", "Paraguay", "USA"],
  E: ["Germany", "Ecuador", "Ivory Coast", "Curaçao"],
  F: ["Sweden", "Netherlands", "Tunisia", "Japan"],
  G: ["Belgium", "Egypt", "Iran", "New Zealand"],
  H: ["Spain", "Uruguay", "Cape Verde", "Saudi Arabia"],
  I: ["France", "Norway", "Senegal", "Iraq"],
  J: ["Austria", "Argentina", "Algeria", "Jordan"],
  K: ["Portugal", "Colombia", "DR Congo", "Uzbekistan"],
  L: ["Croatia", "England", "Ghana", "Panama"],
} as const;

export const GROUP_LETTERS = Object.keys(TOURNAMENT_GROUPS).sort() as (
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
)[];
