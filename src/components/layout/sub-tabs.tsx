"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { prefetchPunishmentsRewards } from "@/lib/bets/punishments-rewards-cache";
import { prefetchProfileTab } from "@/lib/profile/profile-cache";
import { cn } from "@/lib/utils";
import type { SubTab } from "@/lib/navigation";

interface SubTabsProps {
  tabs: SubTab[];
  /** When omitted, active tab is inferred from the current path. */
  activeTab?: string;
  basePath: string;
  accent?: "blue" | "green" | "red";
  hrefForTab?: (tab: SubTab) => string;
  isTabActive?: (tab: SubTab, pathname: string) => boolean;
  /** Lock horizontal swipe — no vertical movement while scrolling tabs. */
  lockHorizontalScroll?: boolean;
}

export function SubTabs({
  tabs,
  activeTab,
  basePath,
  accent = "blue",
  hrefForTab,
  isTabActive,
  lockHorizontalScroll = false,
}: SubTabsProps) {
  const pathname = usePathname();

  const accentColor = {
    blue: { active: "border-[#0066FF] text-[#0066FF]", hover: "hover:text-white/70" },
    green: { active: "border-[#00C853] text-[#00C853]", hover: "hover:text-white/70" },
    red: { active: "border-[#E53935] text-[#E53935]", hover: "hover:text-white/70" },
  }[accent];

  return (
    <div
      className={cn(
        "shrink-0 border-b border-white/8",
        lockHorizontalScroll
          ? "h-12 max-h-12 overflow-x-auto overflow-y-hidden overscroll-x-contain overscroll-y-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          : "overflow-x-auto"
      )}
      style={lockHorizontalScroll ? { touchAction: "pan-x pinch-zoom" } : undefined}
    >
      <nav
        className={cn(
          "-mb-px flex min-w-max gap-1 px-1",
          lockHorizontalScroll && "h-12 items-stretch"
        )}
        aria-label="Sub navigation"
      >
        {tabs.map((tab) => {
          const href = hrefForTab?.(tab) ?? `${basePath}/${tab.slug}`;
          const isActive = activeTab
            ? activeTab === tab.slug
            : isTabActive
              ? isTabActive(tab, pathname)
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={tab.slug}
              href={href}
              scroll={false}
              onMouseEnter={() => {
                if (basePath === "/bets" && tab.slug === "punishments") {
                  prefetchPunishmentsRewards();
                }
                if (basePath === "/profile") {
                  prefetchProfileTab(
                    tab.slug as
                      | "overview"
                      | "records"
                      | "squad"
                      | "predictions"
                      | "achievements"
                  );
                }
              }}
              onTouchStart={() => {
                if (basePath === "/profile") {
                  prefetchProfileTab(
                    tab.slug as
                      | "overview"
                      | "records"
                      | "squad"
                      | "predictions"
                      | "achievements"
                  );
                }
              }}
              className={cn(
                "relative flex shrink-0 items-center whitespace-nowrap px-4 text-sm font-semibold transition-colors duration-200",
                lockHorizontalScroll ? "h-12 py-0" : "py-3.5",
                "border-b-2",
                isActive
                  ? accentColor.active
                  : cn("border-transparent text-white/45", accentColor.hover)
              )}
              style={lockHorizontalScroll ? { touchAction: "manipulation" } : undefined}
            >
              {tab.shortLabel ?? tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
