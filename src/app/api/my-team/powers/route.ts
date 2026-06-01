import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPowersData } from "@/lib/powers/get-powers-data";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getPowersData(session.user.id);
  return NextResponse.json(data);
}
