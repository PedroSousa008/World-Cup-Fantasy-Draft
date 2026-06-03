import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { SubTabs } from "@/components/layout/sub-tabs";
import { PageHeader } from "@/components/layout/section-page";
import { OWNER_PLAYERS_TABS } from "@/lib/navigation";
import { ArrowLeft } from "lucide-react";

export default async function OwnerPlayersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.OWNER) {
    redirect("/my-team");
  }

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
        title="Players & Teams"
        description="Manage nations and players, or assign each user's 18-player squad."
      />

      <SubTabs tabs={OWNER_PLAYERS_TABS} basePath="/owner/players" accent="blue" />

      {children}
    </div>
  );
}
