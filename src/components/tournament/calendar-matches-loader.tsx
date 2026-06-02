import { CalendarView } from "@/components/tournament/calendar-view";
import { getAllTournamentMatches } from "@/lib/tournament/get-tournament-data";

export async function CalendarMatchesLoader() {
  const matches = await getAllTournamentMatches();
  return <CalendarView matches={matches} />;
}
