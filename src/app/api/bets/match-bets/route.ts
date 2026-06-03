import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMatchBetsData } from "@/lib/bets/get-match-bets-data";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getMatchBetsData(session.user.id, session.user.role);
  return NextResponse.json(data, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
