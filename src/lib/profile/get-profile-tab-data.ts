import type { ProfileTabPayload, ProfileTabSlug } from "@/lib/profile/types";
import { getProfileOverviewData } from "@/lib/profile/get-profile-overview";
import { getProfileRecordsData } from "@/lib/profile/get-profile-records";
import { getProfileSquadData } from "@/lib/profile/get-profile-squad";
import { getProfilePredictionsData } from "@/lib/profile/get-profile-predictions";
import { getProfileAchievementsData } from "@/lib/profile/get-profile-achievements";

export async function getProfileTabData(
  userId: string,
  tab: ProfileTabSlug
): Promise<ProfileTabPayload> {
  switch (tab) {
    case "overview":
      return getProfileOverviewData(userId);
    case "records":
      return getProfileRecordsData(userId);
    case "squad":
      return getProfileSquadData(userId);
    case "predictions":
      return getProfilePredictionsData(userId);
    case "achievements":
      return getProfileAchievementsData(userId);
    default:
      return getProfileOverviewData(userId);
  }
}
