"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { MY_TEAM_TABS } from "@/lib/navigation";

interface SwipeableTabBarProps {
  activeTab: string;
  basePath?: string;
}

export function SwipeableTabBar({
  activeTab,
  basePath = "/my-team",
}: SwipeableTabBarProps) {
  const router = useRouter();

  return (
    <div className="w-full overflow-hidden px-3">
      <div
        className="grid w-full grid-cols-4 gap-0.5 rounded-xl bg-white/8 p-0.5"
        role="tablist"
        aria-label="My Team sections"
      >
        {MY_TEAM_TABS.map((tab) => {
          const isActive = activeTab === tab.slug;
          const label = tab.shortLabel ?? tab.label;
          return (
            <button
              key={tab.slug}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => router.push(`${basePath}/${tab.slug}`)}
              className={cn(
                "min-h-[36px] rounded-lg px-0.5 py-1.5 text-center",
                "text-[10px] font-bold leading-tight transition-all duration-200",
                "active:scale-[0.97]",
                isActive
                  ? "bg-[#00C853] text-white shadow-sm"
                  : "text-white/50 hover:text-white/70"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
