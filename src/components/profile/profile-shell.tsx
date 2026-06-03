"use client";

import { memo, useMemo } from "react";
import { usePathname } from "next/navigation";
import { SubTabs } from "@/components/layout/sub-tabs";
import { PageHeader } from "@/components/layout/section-page";
import { PROFILE_TABS } from "@/lib/navigation";
import type { ProfileTabSlug } from "@/lib/profile/types";
import { ProfileTabContent } from "@/components/profile/profile-tab-content";

const TAB_COPY: Record<ProfileTabSlug, { title: string; description: string }> = {
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

function tabFromPathname(pathname: string): ProfileTabSlug {
  const match = PROFILE_TABS.find(
    (t) => pathname === `/profile/${t.slug}` || pathname.startsWith(`/profile/${t.slug}/`)
  );
  return (match?.slug ?? "overview") as ProfileTabSlug;
}

export const ProfileShell = memo(function ProfileShell() {
  const pathname = usePathname();
  const activeTab = useMemo(() => tabFromPathname(pathname), [pathname]);
  const copy = TAB_COPY[activeTab];

  return (
    <div className="space-y-6 overflow-x-hidden pb-8">
      <PageHeader
        title="Profile"
        description="Your personal World Cup Fantasy headquarters."
      />

      <SubTabs
        tabs={PROFILE_TABS}
        activeTab={activeTab}
        basePath="/profile"
        accent="blue"
        lockHorizontalScroll
      />

      <div className="space-y-2">
        <h2 className="text-display text-xl text-white">{copy.title}</h2>
        <p className="text-body text-sm text-white/50">{copy.description}</p>
      </div>

      <ProfileTabContent tab={activeTab} />
    </div>
  );
});
