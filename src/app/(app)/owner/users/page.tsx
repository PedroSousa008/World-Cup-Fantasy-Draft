import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/section-page";
import { OwnerAllUsersPanel } from "@/components/owner/owner-all-users-panel";
import { getOwnerUsersData } from "@/lib/owner/get-users-data";

export const dynamic = "force-dynamic";

export default async function OwnerUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.OWNER) {
    redirect("/my-team");
  }

  const users = await getOwnerUsersData();

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
        title="All Users"
        description="View and manage every user in the league."
      />

      <OwnerAllUsersPanel users={users} />
    </div>
  );
}
