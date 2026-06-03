import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isPlatformOwner } from "@/lib/auth/permissions";
import { OwnerBetsManagementPanel } from "@/components/owner/owner-bets-management-panel";
import { PageHeader } from "@/components/layout/section-page";
import { getOwnerBetsManagementData } from "@/lib/bets/get-owner-bets-management-data";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OwnerBetsManagementPage() {
  const session = await auth();
  if (!session?.user || !(await isPlatformOwner(session.user.id))) {
    redirect("/my-team");
  }

  const { matchOptions, activeBets } = await getOwnerBetsManagementData(session.user.id);

  return (
    <div className="space-y-6 overflow-x-hidden pb-8">
      <Link
        href="/owner"
        className="inline-flex items-center gap-1 text-sm font-semibold text-white/50"
      >
        <ArrowLeft className="h-4 w-4" />
        Owner dashboard
      </Link>

      <PageHeader
        title="Bets Management"
        description="Promote matchday matches, set manual odds, and track league votes."
      />

      <OwnerBetsManagementPanel matchOptions={matchOptions} activeBets={activeBets} />
    </div>
  );
}
