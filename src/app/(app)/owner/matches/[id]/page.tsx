import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { OwnerMatchEditor } from "@/components/owner/owner-match-editor";
import { getOwnerMatchEditData } from "@/lib/owner/get-matches-data";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OwnerMatchEditPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.OWNER) {
    redirect("/my-team");
  }

  const { id } = await params;
  const data = await getOwnerMatchEditData(id);
  if (!data) notFound();

  return (
    <div className="space-y-6 overflow-x-hidden">
      <Link
        href="/owner/matches"
        className="inline-flex items-center gap-1 text-sm font-semibold text-white/50"
      >
        <ArrowLeft className="h-4 w-4" />
        All matches
      </Link>

      <OwnerMatchEditor
        match={data.match}
        events={data.events}
        players={data.players}
      />
    </div>
  );
}
