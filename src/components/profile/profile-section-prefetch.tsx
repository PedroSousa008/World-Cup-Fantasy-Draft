"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { PROFILE_TABS } from "@/lib/navigation";
import { prefetchProfileOverview, prefetchProfileTab } from "@/lib/profile/profile-cache";

export function ProfileSectionPrefetch() {
  const pathname = usePathname();

  useEffect(() => {
    prefetchProfileOverview();

    const active = PROFILE_TABS.find(
      (tab) =>
        pathname === `/profile/${tab.slug}` || pathname.startsWith(`/profile/${tab.slug}/`)
    );
    if (active && active.slug !== "overview") {
      prefetchProfileTab(active.slug as "records" | "squad" | "predictions" | "achievements");
    }
  }, [pathname]);

  return null;
}
