import { NextResponse } from "next/server";
import { getGroupTablesData } from "@/lib/tournament/get-tournament-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeOverrides = searchParams.get("overrides") === "1";
  const { tables, bestThird, overrides } = await getGroupTablesData();
  return NextResponse.json(
    {
      tables,
      bestThird,
      ...(includeOverrides ? { overrides } : {}),
      fetchedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
