import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getKnockoutBracketData } from "@/lib/tournament/knockout/bracket-service";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const includeNations = searchParams.get("picker") === "1";

  const data = await getKnockoutBracketData({ includeNations });
  return NextResponse.json(data);
}
