import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProfileTabData } from "@/lib/profile/get-profile-tab-data";
import { PROFILE_TABS } from "@/lib/navigation";
import type { ProfileTabSlug } from "@/lib/profile/types";

interface RouteContext {
  params: Promise<{ tab: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tab } = await context.params;
  const valid = PROFILE_TABS.some((t) => t.slug === tab);
  if (!valid) {
    return NextResponse.json({ error: "Invalid tab" }, { status: 404 });
  }

  const data = await getProfileTabData(session.user.id, tab as ProfileTabSlug);
  return NextResponse.json(data);
}
