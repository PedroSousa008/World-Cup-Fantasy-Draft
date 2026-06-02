import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { PageHeader } from "@/components/layout/section-page";
import { OwnerMatchesEventsTabs } from "@/components/owner/owner-matches-events-tabs";
import { ArrowLeft } from "lucide-react";

export default async function OwnerMatchesEventsLayout({
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
        title="Matches & Events"
        description="Enter match results and events. Manage group tables and knockout progression."
      />

      <OwnerMatchesEventsTabs />

      {children}
    </div>
  );
}
