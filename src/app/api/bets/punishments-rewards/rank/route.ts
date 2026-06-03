import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserLeagueRankCached } from "@/lib/rankings/league-rank-index";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUserRank = await getUserLeagueRankCached(session.user.id);
  return NextResponse.json(
    { currentUserRank },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
