import Link from "next/link";
import { notFound } from "next/navigation";
import { OwnerMatchEditor } from "@/components/owner/owner-match-editor";
import { getOwnerMatchEditData } from "@/lib/owner/get-matches-data";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OwnerMatchesEventsMatchEditPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getOwnerMatchEditData(id);
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/owner/matches-events/matches"
        className="inline-flex items-center gap-1 text-sm font-semibold text-white/50"
      >
        <ArrowLeft className="h-4 w-4" />
        Matches
      </Link>

      <OwnerMatchEditor
        match={data.match}
        events={data.events}
        participantIds={data.participantIds}
        players={data.players}
      />
    </div>
  );
}
