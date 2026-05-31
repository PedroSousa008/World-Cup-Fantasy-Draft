import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SubTab } from "@/lib/navigation";

interface SubTabsProps {
  tabs: SubTab[];
  activeTab: string;
  basePath: string;
}

export function SubTabs({ tabs, activeTab, basePath }: SubTabsProps) {
  return (
    <div className="overflow-x-auto border-b border-slate-800">
      <nav className="-mb-px flex gap-1 min-w-max px-1" aria-label="Sub navigation">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.slug;
          const href = `${basePath}/${tab.slug}`;

          return (
            <Link
              key={tab.slug}
              href={href}
              className={cn(
                "whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-200"
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
