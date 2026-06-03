"use client";

import type { ProfileOverviewPayload } from "@/lib/profile/types";
import { useProfileTab } from "@/hooks/use-profile-tab";
import { ProfileHeaderCard } from "@/components/profile/profile-header-card";
import { ProfileStatCard } from "@/components/profile/profile-ui";

interface ProfileOverviewViewProps {
  initialData: ProfileOverviewPayload;
}

export function ProfileOverviewView({ initialData }: ProfileOverviewViewProps) {
  const { data, refresh } = useProfileTab("overview", initialData);

  return (
    <div className="space-y-6">
      <ProfileHeaderCard header={data.header} onUpdated={refresh} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <ProfileStatCard
          label="Current Ranking"
          value={data.cards.rank != null ? `#${data.cards.rank}` : "—"}
          accent="gold"
        />
        <ProfileStatCard
          label="Total Fantasy Points"
          value={data.cards.totalPoints.toLocaleString()}
          accent="blue"
        />
        <ProfileStatCard
          label="Current Matchday Points"
          value={data.cards.currentMatchdayPoints.toLocaleString()}
          accent="green"
        />
        <ProfileStatCard
          label="Active Matchday"
          value={data.currentMatchday != null ? `MD${data.currentMatchday}` : "—"}
          subValue="Live fantasy window"
          accent="gold"
        />
      </div>
    </div>
  );
}
