import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SubTabs } from "@/components/layout/sub-tabs";
import { PageHeader } from "@/components/layout/section-page";
import { PROFILE_TABS } from "@/lib/navigation";
import { getProfileTabData } from "@/lib/profile/get-profile-tab-data";
import type {
  ProfileAchievementsPayload,
  ProfileOverviewPayload,
  ProfilePredictionsPayload,
  ProfileRecordsPayload,
  ProfileSquadPayload,
  ProfileTabSlug,
} from "@/lib/profile/types";
import { ProfileOverviewView } from "@/components/profile/profile-overview-view";
import { ProfileRecordsView } from "@/components/profile/profile-records-view";
import { ProfileSquadView } from "@/components/profile/profile-squad-view";
import { ProfilePredictionsView } from "@/components/profile/profile-predictions-view";
import { ProfileAchievementsView } from "@/components/profile/profile-achievements-view";

interface PageProps {
  params: Promise<{ tab: string }>;
}

const TAB_COPY: Record<
  ProfileTabSlug,
  { title: string; description: string }
> = {
  overview: {
    title: "Fantasy Dashboard",
    description: "Your performance, ranking, and matchday snapshot at a glance.",
  },
  records: {
    title: "Personal Records",
    description: "Best and worst matchdays, streaks, and squad leaders.",
  },
  squad: {
    title: "Squad Stats",
    description: "Every player in your squad with live fantasy points.",
  },
  predictions: {
    title: "Predictions & Bets",
    description: "How accurate your picks are and how many bets you've placed.",
  },
  achievements: {
    title: "Achievements",
    description: "Powers remaining and your full matchday journey.",
  },
};

export default async function ProfileTabPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { tab } = await params;
  const validTab = PROFILE_TABS.find((t) => t.slug === tab);
  if (!validTab) notFound();

  const slug = tab as ProfileTabSlug;
  const initialData = await getProfileTabData(session.user.id, slug);
  const copy = TAB_COPY[slug];

  return (
    <div className="space-y-6 overflow-x-hidden pb-8">
      <PageHeader title="Profile" description="Your personal World Cup Fantasy headquarters." />

      <SubTabs tabs={PROFILE_TABS} activeTab={tab} basePath="/profile" accent="blue" />

      <div className="space-y-2">
        <h2 className="text-display text-xl text-white">{copy.title}</h2>
        <p className="text-body text-sm text-white/50">{copy.description}</p>
      </div>

      {slug === "overview" ? (
        <ProfileOverviewView initialData={initialData as ProfileOverviewPayload} />
      ) : null}
      {slug === "records" ? (
        <ProfileRecordsView initialData={initialData as ProfileRecordsPayload} />
      ) : null}
      {slug === "squad" ? (
        <ProfileSquadView initialData={initialData as ProfileSquadPayload} />
      ) : null}
      {slug === "predictions" ? (
        <ProfilePredictionsView initialData={initialData as ProfilePredictionsPayload} />
      ) : null}
      {slug === "achievements" ? (
        <ProfileAchievementsView initialData={initialData as ProfileAchievementsPayload} />
      ) : null}
    </div>
  );
}
