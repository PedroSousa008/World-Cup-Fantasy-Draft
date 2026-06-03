import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isPlatformOwner } from "@/lib/auth/permissions";
import { getMatchBetsData } from "@/lib/bets/get-match-bets-data";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const showVoteStats = await isPlatformOwner(session.user.id);
  const data = await getMatchBetsData(session.user.id, { includeVoteStats: showVoteStats });

  return NextResponse.json(data, {
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
