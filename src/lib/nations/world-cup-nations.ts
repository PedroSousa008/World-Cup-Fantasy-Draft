/**
 * Official participating nations — single source of truth for DB seed and UI.
 * Player images live under public/players/{slug}/
 */

export interface WorldCupNation {
  name: string;
  slug: string;
  code: string;
  flagEmoji: string;
  imageDir: string;
}

function nation(
  name: string,
  slug: string,
  code: string,
  flagEmoji: string
): WorldCupNation {
  return {
    name,
    slug,
    code,
    flagEmoji,
    imageDir: `players/${slug}`,
  };
}

export const WORLD_CUP_NATIONS: readonly WorldCupNation[] = [
  nation("Argentina", "argentina", "ARG", "🇦🇷"),
  nation("Australia", "australia", "AUS", "🇦🇺"),
  nation("Austria", "austria", "AUT", "🇦🇹"),
  nation("Belgium", "belgium", "BEL", "🇧🇪"),
  nation("Bosnia and Herzegovina", "bosnia-and-herzegovina", "BIH", "🇧🇦"),
  nation("Brazil", "brazil", "BRA", "🇧🇷"),
  nation("Canada", "canada", "CAN", "🇨🇦"),
  nation("Cape Verde", "cape-verde", "CPV", "🇨🇻"),
  nation("Colombia", "colombia", "COL", "🇨🇴"),
  nation("Croatia", "croatia", "CRO", "🇭🇷"),
  nation("Curaçao", "curacao", "CUW", "🇨🇼"),
  nation("Czech Republic", "czech-republic", "CZE", "🇨🇿"),
  nation("DR Congo", "dr-congo", "COD", "🇨🇩"),
  nation("Ecuador", "ecuador", "ECU", "🇪🇨"),
  nation("Egypt", "egypt", "EGY", "🇪🇬"),
  nation("England", "england", "ENG", "🏴󠁧󠁢󠁥󠁮󠁧󠁿"),
  nation("France", "france", "FRA", "🇫🇷"),
  nation("Germany", "germany", "GER", "🇩🇪"),
  nation("Ghana", "ghana", "GHA", "🇬🇭"),
  nation("Haiti", "haiti", "HTI", "🇭🇹"),
  nation("Iran", "iran", "IRN", "🇮🇷"),
  nation("Iraq", "iraq", "IRQ", "🇮🇶"),
  nation("Ivory Coast", "ivory-coast", "CIV", "🇨🇮"),
  nation("Japan", "japan", "JPN", "🇯🇵"),
  nation("Jordan", "jordan", "JOR", "🇯🇴"),
  nation("Mexico", "mexico", "MEX", "🇲🇽"),
  nation("Morocco", "morocco", "MAR", "🇲🇦"),
  nation("Netherlands", "netherlands", "NED", "🇳🇱"),
  nation("New Zealand", "new-zealand", "NZL", "🇳🇿"),
  nation("Nigeria", "nigeria", "NGA", "🇳🇬"),
  nation("Norway", "norway", "NOR", "🇳🇴"),
  nation("Paraguay", "paraguay", "PAR", "🇵🇾"),
  nation("Portugal", "portugal", "POR", "🇵🇹"),
  nation("Qatar", "qatar", "QAT", "🇶🇦"),
  nation("Saudi Arabia", "saudi-arabia", "KSA", "🇸🇦"),
  nation("Scotland", "scotland", "SCO", "🏴󠁧󠁢󠁳󠁣󠁴󠁿"),
  nation("Senegal", "senegal", "SEN", "🇸🇳"),
  nation("South Africa", "south-africa", "RSA", "🇿🇦"),
  nation("South Korea", "south-korea", "KOR", "🇰🇷"),
  nation("Spain", "spain", "ESP", "🇪🇸"),
  nation("Sweden", "sweden", "SWE", "🇸🇪"),
  nation("Switzerland", "switzerland", "SUI", "🇨🇭"),
  nation("Tunisia", "tunisia", "TUN", "🇹🇳"),
  nation("Türkiye", "turkiye", "TUR", "🇹🇷"),
  nation("Uruguay", "uruguay", "URU", "🇺🇾"),
  nation("USA", "usa", "USA", "🇺🇸"),
  nation("Uzbekistan", "uzbekistan", "UZB", "🇺🇿"),
  nation("Venezuela", "venezuela", "VEN", "🇻🇪"),
  nation("Zambia", "zambia", "ZAM", "🇿🇲"),
] as const;

export const WORLD_CUP_NATION_NAMES = WORLD_CUP_NATIONS.map((n) => n.name);

export const WORLD_CUP_NATION_BY_SLUG = new Map(
  WORLD_CUP_NATIONS.map((n) => [n.slug, n])
);

export const WORLD_CUP_NATION_BY_NAME = new Map(
  WORLD_CUP_NATIONS.map((n) => [n.name, n])
);

export const WORLD_CUP_NATION_FLAGS: Record<string, string> = Object.fromEntries(
  WORLD_CUP_NATIONS.map((n) => [n.name, n.flagEmoji])
);
