"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { MY_TEAM_TABS } from "@/lib/navigation";

const TAB_SLUGS = new Set(MY_TEAM_TABS.map((t) => t.slug));

function tabFromPathname(pathname: string): string | null {
  const segment = pathname.split("/").filter(Boolean).pop();
  if (segment && TAB_SLUGS.has(segment)) return segment;
  return null;
}

interface MyTeamTabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MyTeamTabsContext = createContext<MyTeamTabsContextValue | null>(null);

export function MyTeamTabsProvider({
  initialTab,
  children,
}: {
  initialTab: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [activeTab, setActiveTabState] = useState(initialTab);

  useEffect(() => {
    const tab = tabFromPathname(pathname);
    if (tab) setActiveTabState(tab);
  }, [pathname]);

  const setActiveTab = useCallback((tab: string) => {
    if (!TAB_SLUGS.has(tab)) return;
    setActiveTabState(tab);
    const next = `/my-team/${tab}`;
    if (window.location.pathname !== next) {
      window.history.replaceState(null, "", next);
    }
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const tab = tabFromPathname(window.location.pathname);
      if (tab) setActiveTabState(tab);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const value = useMemo(
    () => ({ activeTab, setActiveTab }),
    [activeTab, setActiveTab]
  );

  return (
    <MyTeamTabsContext.Provider value={value}>{children}</MyTeamTabsContext.Provider>
  );
}

export function useMyTeamTabs() {
  const ctx = useContext(MyTeamTabsContext);
  if (!ctx) {
    throw new Error("useMyTeamTabs must be used within MyTeamTabsProvider");
  }
  return ctx;
}
