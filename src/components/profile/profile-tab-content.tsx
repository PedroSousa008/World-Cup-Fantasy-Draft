"use client";

import { memo } from "react";
import type { ProfileTabSlug } from "@/lib/profile/types";
import { ProfileOverviewView } from "@/components/profile/profile-overview-view";
import { ProfileRecordsView } from "@/components/profile/profile-records-view";
import { ProfileSquadView } from "@/components/profile/profile-squad-view";
import { ProfilePredictionsView } from "@/components/profile/profile-predictions-view";
import { ProfileAchievementsView } from "@/components/profile/profile-achievements-view";

interface ProfileTabContentProps {
  tab: ProfileTabSlug;
}

export const ProfileTabContent = memo(function ProfileTabContent({
  tab,
}: ProfileTabContentProps) {
  switch (tab) {
    case "overview":
      return <ProfileOverviewView />;
    case "records":
      return <ProfileRecordsView />;
    case "squad":
      return <ProfileSquadView />;
    case "predictions":
      return <ProfilePredictionsView />;
    case "achievements":
      return <ProfileAchievementsView />;
    default:
      return <ProfileOverviewView />;
  }
});
