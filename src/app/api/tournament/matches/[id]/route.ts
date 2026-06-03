import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMatchDetail } from "@/lib/tournament/get-tournament-data";
import type { MatchDetailResponse } from "@/lib/tournament/match-detail-types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const match = await getMatchDetail(id);
  if (!match) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const payload: MatchDetailResponse = {
    id: match.id,
    matchday: match.matchday,
    groupName: match.groupName,
    stage: match.stage,
    scheduledAt: match.scheduledAt.toISOString(),
    status: match.status,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    homeTeam: {
      id: match.homeTeam.id,
      name: match.homeTeam.name,
      flagEmoji: match.homeTeam.flagEmoji,
    },
    awayTeam: {
      id: match.awayTeam.id,
      name: match.awayTeam.name,
      flagEmoji: match.awayTeam.flagEmoji,
    },
    manOfTheMatch: match.manOfTheMatch
      ? {
          id: match.manOfTheMatch.id,
          name: match.manOfTheMatch.name,
          position: match.manOfTheMatch.position,
        }
      : null,
    events: match.events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      minute: event.minute,
      player: event.player
        ? {
            id: event.player.id,
            name: event.player.name,
            position: event.player.position,
          }
        : null,
    })),
  };

  return NextResponse.json(payload);
}
