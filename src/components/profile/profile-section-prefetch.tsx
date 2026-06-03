"use client";

import { useEffect } from "react";
import { prefetchProfileOverview } from "@/lib/profile/profile-cache";

/** Prefetch overview only — other tabs load on demand. */
export function ProfileSectionPrefetch() {
  useEffect(() => {
    prefetchProfileOverview();
  }, []);

  return null;
}
