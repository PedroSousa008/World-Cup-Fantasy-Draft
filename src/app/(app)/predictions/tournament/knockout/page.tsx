import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { SubTabs } from "@/components/layout/sub-tabs";
import { PageHeader } from "@/components/layout/section-page";
import { PREDICTIONS_TABS } from "@/lib/navigation";
import { KnockoutPredictionsClient } from "@/components/predictions/knockout-predictions-client";
import { getKnockoutPredictionsData } from "@/lib/predictions/get-knockout-predictions-data";
import { getTournamentPredictionsData } from "@/lib/predictions/get-tournament-predictions-data";

export const dynamic = "force-dynamic";

export default async function KnockoutPredictionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [tournamentData, knockoutData] = await Promise.all([
    getTournamentPredictionsData(session.user.id),
    getKnockoutPredictionsData(session.user.id),
  ]);

  if (!tournamentData.allGroupsComplete) {
    redirect("/predictions/tournament");
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      <SubTabs tabs={PREDICTIONS_TABS} activeTab="tournament" basePath="/predictions" accent="blue" />

      <Link
        href="/predictions/tournament"
        className="inline-flex items-center gap-1 text-sm font-semibold text-white/50"
      >
        <ArrowLeft className="h-4 w-4" />
        Group stage predictions
      </Link>

      <PageHeader
        title="KO Stages"
        description="Pick winners for every knockout match based on the real Last 32 bracket."
      />

      <KnockoutPredictionsClient
        initialData={knockoutData.bracket}
        locked={knockoutData.locked}
        unlocked={knockoutData.unlocked}
        isComplete={knockoutData.isComplete}
        predictedCount={knockoutData.predictedCount}
        totalMatches={knockoutData.totalMatches}
      />
    </div>
  );
}
