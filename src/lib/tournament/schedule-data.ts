/** World Cup 2026 group stage schedule (UTC kickoffs, June 2026). */
export interface ScheduledMatch {
  matchday: number;
  group: string;
  home: string;
  away: string;
  /** ISO 8601 */
  scheduledAt: string;
}

function m(
  matchday: number,
  group: string,
  day: number,
  hour: number,
  minute: number,
  home: string,
  away: string
): ScheduledMatch {
  const mm = String(minute).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return {
    matchday,
    group,
    home,
    away,
    scheduledAt: `2026-06-${dd}T${hh}:${mm}:00.000Z`,
  };
}

export const GROUP_STAGE_SCHEDULE: ScheduledMatch[] = [
  // Matchday 1
  m(1, "A", 11, 20, 0, "Mexico", "South Africa"),
  m(1, "A", 12, 3, 0, "South Korea", "Czech Republic"),
  m(1, "B", 12, 20, 0, "Canada", "Bosnia and Herzegovina"),
  m(1, "D", 13, 2, 0, "USA", "Paraguay"),
  m(1, "B", 13, 20, 0, "Qatar", "Switzerland"),
  m(1, "C", 13, 23, 0, "Brazil", "Morocco"),
  m(1, "C", 14, 2, 0, "Haiti", "Scotland"),
  m(1, "D", 14, 5, 0, "Australia", "Türkiye"),
  m(1, "E", 14, 18, 0, "Germany", "Curaçao"),
  m(1, "F", 14, 21, 0, "Netherlands", "Japan"),
  m(1, "E", 15, 0, 0, "Ivory Coast", "Ecuador"),
  m(1, "F", 15, 15, 0, "Sweden", "Tunisia"),
  m(1, "H", 15, 17, 0, "Spain", "Cape Verde"),
  m(1, "G", 15, 20, 0, "Belgium", "Egypt"),
  m(1, "H", 15, 23, 0, "Saudi Arabia", "Uruguay"),
  m(1, "G", 16, 2, 0, "Iran", "New Zealand"),
  m(1, "I", 16, 20, 0, "France", "Senegal"),
  m(1, "I", 16, 23, 0, "Iraq", "Norway"),
  m(1, "J", 17, 2, 0, "Argentina", "Algeria"),
  m(1, "J", 17, 5, 0, "Austria", "Jordan"),
  m(1, "K", 17, 18, 0, "Portugal", "DR Congo"),
  m(1, "L", 17, 21, 0, "England", "Croatia"),
  m(1, "L", 18, 0, 0, "Ghana", "Panama"),
  m(1, "K", 18, 3, 0, "Uzbekistan", "Colombia"),

  // Matchday 2
  m(2, "A", 18, 17, 0, "Czech Republic", "South Africa"),
  m(2, "B", 18, 20, 0, "Switzerland", "Bosnia and Herzegovina"),
  m(2, "B", 18, 23, 0, "Canada", "Qatar"),
  m(2, "A", 19, 2, 0, "Mexico", "South Korea"),
  m(2, "D", 19, 20, 0, "USA", "Australia"),
  m(2, "C", 19, 23, 0, "Scotland", "Morocco"),
  m(2, "C", 20, 1, 30, "Brazil", "Haiti"),
  m(2, "D", 20, 4, 0, "Türkiye", "Paraguay"),
  m(2, "F", 20, 18, 0, "Netherlands", "Sweden"),
  m(2, "E", 20, 21, 0, "Germany", "Ivory Coast"),
  m(2, "E", 21, 1, 0, "Ecuador", "Curaçao"),
  m(2, "F", 21, 5, 0, "Tunisia", "Japan"),
  m(2, "H", 21, 17, 0, "Spain", "Saudi Arabia"),
  m(2, "G", 21, 20, 0, "Belgium", "Iran"),
  m(2, "H", 21, 23, 0, "Uruguay", "Cape Verde"),
  m(2, "G", 22, 2, 0, "New Zealand", "Egypt"),
  m(2, "J", 22, 18, 0, "Argentina", "Austria"),
  m(2, "I", 22, 22, 0, "France", "Iraq"),
  m(2, "I", 23, 1, 0, "Norway", "Senegal"),
  m(2, "J", 23, 4, 0, "Jordan", "Algeria"),
  m(2, "K", 23, 18, 0, "Portugal", "Uzbekistan"),
  m(2, "L", 23, 21, 0, "England", "Ghana"),
  m(2, "L", 24, 0, 0, "Panama", "Croatia"),
  m(2, "K", 24, 3, 0, "Colombia", "DR Congo"),

  // Matchday 3
  m(3, "B", 24, 20, 0, "Switzerland", "Canada"),
  m(3, "B", 24, 20, 0, "Bosnia and Herzegovina", "Qatar"),
  m(3, "C", 24, 23, 0, "Morocco", "Haiti"),
  m(3, "C", 24, 23, 0, "Scotland", "Brazil"),
  m(3, "A", 25, 2, 0, "South Africa", "South Korea"),
  m(3, "A", 25, 2, 0, "Czech Republic", "Mexico"),
  m(3, "E", 25, 21, 0, "Curaçao", "Ivory Coast"),
  m(3, "E", 25, 21, 0, "Ecuador", "Germany"),
  m(3, "F", 26, 0, 0, "Tunisia", "Netherlands"),
  m(3, "F", 26, 0, 0, "Japan", "Sweden"),
  m(3, "D", 26, 3, 0, "Türkiye", "USA"),
  m(3, "D", 26, 3, 0, "Paraguay", "Australia"),
  m(3, "I", 26, 20, 0, "Norway", "France"),
  m(3, "I", 26, 20, 0, "Senegal", "Iraq"),
  m(3, "H", 27, 1, 0, "Cape Verde", "Saudi Arabia"),
  m(3, "H", 27, 1, 0, "Uruguay", "Spain"),
  m(3, "G", 27, 4, 0, "New Zealand", "Belgium"),
  m(3, "G", 27, 4, 0, "Egypt", "Iran"),
  m(3, "L", 27, 22, 0, "Panama", "England"),
  m(3, "L", 27, 22, 0, "Croatia", "Ghana"),
  m(3, "K", 28, 0, 30, "Colombia", "Portugal"),
  m(3, "K", 28, 0, 30, "DR Congo", "Uzbekistan"),
  m(3, "J", 28, 3, 0, "Algeria", "Austria"),
  m(3, "J", 28, 3, 0, "Jordan", "Argentina"),
];
