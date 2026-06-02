import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { PageHeader } from "@/components/layout/section-page";
import { OwnerMatchesPanel } from "@/components/owner/owner-matches-panel";
import { getOwnerMatchesPageData } from "@/lib/owner/get-matches-data";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OwnerMatchesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.OWNER) {
    redirect("/my-team");
  }

  const { matches } = await getOwnerMatchesPageData();

  return (
    <div className="space-y-6 overflow-x-hidden">
      <Link
        href="/owner"
        className="inline-flex items-center gap-1 text-sm font-semibold text-white/50"
      >
        <ArrowLeft className="h-4 w-4" />
        Owner dashboard
      </Link>

      <PageHeader
        title="Match Management"
        description="Enter results, goals, assists, cards, and MOTM. Fantasy points and group tables update automatically."
      />

      <OwnerMatchesPanel matches={matches} />
    </div>
  );
}
