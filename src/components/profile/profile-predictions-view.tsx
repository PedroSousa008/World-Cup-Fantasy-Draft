"use client";

import type { ProfilePredictionsPayload } from "@/lib/profile/types";
import { useProfileTab } from "@/hooks/use-profile-tab";
import { ProfileSection, ProfileStatCard } from "@/components/profile/profile-ui";
import { ProfilePredictionsSkeleton } from "@/components/profile/profile-tab-skeleton";

export function ProfilePredictionsView() {
  const { data, loading } = useProfileTab<ProfilePredictionsPayload>("predictions");

  if (loading || !data) {
    return <ProfilePredictionsSkeleton />;
  }

  const accuracyLabel =
    data.predictionAccuracyPercent != null
      ? `${data.predictionAccuracyPercent}%`
      : "—";

  return (
    <div className="space-y-8">
      <ProfileSection
        title="Match Predictions"
        description="Exact-score picks that earned points after matches finished."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <ProfileStatCard
            label="Correct Predictions"
            value={String(data.correctPredictions)}
            subValue={
              data.settledPredictions > 0
                ? `of ${data.settledPredictions} settled`
                : "No settled predictions yet"
            }
            accent="green"
          />
          <ProfileStatCard
            label="Prediction Accuracy"
            value={accuracyLabel}
            subValue="Based on settled exact-score picks"
            accent="blue"
          />
        </div>
      </ProfileSection>

      <ProfileSection
        title="Bets"
        description="Your participation in owner-promoted match bets."
      >
        <ProfileStatCard
          label="Bets Placed"
          value={String(data.betsPlaced)}
          subValue="Votes submitted on promoted matches"
          accent="gold"
        />
      </ProfileSection>
    </div>
  );
}
