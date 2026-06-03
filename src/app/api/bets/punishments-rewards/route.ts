import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPunishmentsRewardsData } from "@/lib/bets/get-punishments-rewards-data";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getPunishmentsRewardsData(session.user.id, session.user.role);
  return NextResponse.json(data, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
