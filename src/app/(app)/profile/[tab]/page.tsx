import { notFound } from "next/navigation";
import { PROFILE_TABS } from "@/lib/navigation";

interface PageProps {
  params: Promise<{ tab: string }>;
}

/** Route placeholder only — UI and data live in ProfileShell (layout). */
export default async function ProfileTabPage({ params }: PageProps) {
  const { tab } = await params;
  if (!PROFILE_TABS.some((t) => t.slug === tab)) notFound();
  return null;
}
