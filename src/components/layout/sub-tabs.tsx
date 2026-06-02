"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
}

export function SubTabs({
  tabs,
  activeTab,
  basePath,
  accent = "blue",
  hrefForTab,
  isTabActive,
}: SubTabsProps) {
  const pathname = usePathname();

  const accentColor = {
    blue: { active: "border-[#0066FF] text-[#0066FF]", hover: "hover:text-white/70" },
    green: { active: "border-[#00C853] text-[#00C853]", hover: "hover:text-white/70" },
    red: { active: "border-[#E53935] text-[#E53935]", hover: "hover:text-white/70" },
  }[accent];

  return (
    <div className="overflow-x-auto border-b border-white/8">
      <nav className="-mb-px flex min-w-max gap-1 px-1" aria-label="Sub navigation">
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
              className={cn(
                "relative whitespace-nowrap px-4 py-3.5 text-sm font-semibold transition-all duration-300",
                "border-b-2",
                isActive
                  ? accentColor.active
                  : cn("border-transparent text-white/45", accentColor.hover)
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
