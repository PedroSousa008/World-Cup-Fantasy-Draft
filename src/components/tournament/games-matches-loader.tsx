import { GamesView } from "@/components/tournament/games-view";
import { getMatchesByMatchday } from "@/lib/tournament/get-tournament-data";

export async function GamesMatchesLoader() {
  const matchdayGroups = await getMatchesByMatchday();
  return <GamesView matchdayGroups={matchdayGroups} />;
}
