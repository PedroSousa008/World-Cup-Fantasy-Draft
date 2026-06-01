import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { OwnerPlayersPanel } from "@/components/owner/owner-players-panel";
import { PageHeader } from "@/components/layout/section-page";
import { getOwnerPlayersPageData } from "@/lib/owner/get-nations-data";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OwnerPlayersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.OWNER) {
    redirect("/my-team");
  }

  const { nations, error, needsSetup } = await getOwnerPlayersPageData();

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
        title="Nations & Players"
        description="Manage nations, upload player images, create players, and assign squads."
      />

      <OwnerPlayersPanel nations={nations} error={error} needsSetup={needsSetup} />
    </div>
  );
}
