"use client";

import { SubTabs } from "@/components/layout/sub-tabs";
import { OWNER_MATCHES_EVENTS_TABS } from "@/lib/navigation";

export function OwnerMatchesEventsTabs() {
  return (
    <SubTabs
      tabs={OWNER_MATCHES_EVENTS_TABS}
      basePath="/owner/matches-events"
      accent="green"
      hrefForTab={(tab) =>
        tab.slug === "events"
          ? "/owner/matches-events/events/group-stage"
          : `/owner/matches-events/${tab.slug}`
      }
      isTabActive={(tab, path) =>
        tab.slug === "events"
          ? path.includes("/owner/matches-events/events")
          : path.includes("/owner/matches-events/matches")
      }
    />
  );
}
