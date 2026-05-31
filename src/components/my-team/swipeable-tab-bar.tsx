"use client";

import { useRef, useEffect } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeTab]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none snap-x snap-mandatory"
    >
      {MY_TEAM_TABS.map((tab) => {
        const isActive = activeTab === tab.slug;
        return (
          <button
            key={tab.slug}
            ref={isActive ? activeRef : undefined}
            type="button"
            onClick={() => router.push(`${basePath}/${tab.slug}`)}
            className={cn(
              "min-h-[44px] shrink-0 snap-center rounded-full px-5 py-2.5",
              "text-sm font-bold transition-all duration-300",
              "active:scale-[0.96]",
              isActive
                ? "bg-[#00C853] text-white shadow-[0_4px_16px_rgba(0,200,83,0.35)]"
                : "bg-white/10 text-white/60"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function useSwipeTabs(activeTab: string, basePath = "/my-team") {
  const router = useRouter();
  const tabs = MY_TEAM_TABS;
  const currentIndex = tabs.findIndex((t) => t.slug === activeTab);

  const onTouchSwipe = (deltaX: number) => {
    const threshold = 60;
    if (Math.abs(deltaX) < threshold) return;

    if (deltaX < 0 && currentIndex < tabs.length - 1) {
      router.push(`${basePath}/${tabs[currentIndex + 1].slug}`);
    } else if (deltaX > 0 && currentIndex > 0) {
      router.push(`${basePath}/${tabs[currentIndex - 1].slug}`);
    }
  };

  return { onTouchSwipe, currentIndex, totalTabs: tabs.length };
}
