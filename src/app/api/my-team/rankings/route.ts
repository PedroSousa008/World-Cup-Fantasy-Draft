import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRankingsData } from "@/lib/rankings/get-rankings-data";
import { syncPowerStatuses } from "@/lib/powers/settle-powers";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  void syncPowerStatuses().catch(() => {});

  const data = await getRankingsData(session.user.teamName);
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
    },
  });
}
