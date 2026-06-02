"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useSquadManager, type SquadManager } from "@/hooks/use-squad-manager";
import type { SquadInitialData } from "@/lib/squad/get-squad-data";

const SquadContext = createContext<SquadManager | null>(null);

export function SquadProvider({
  initial,
  children,
}: {
  initial: SquadInitialData;
  children: ReactNode;
}) {
  const squad = useSquadManager(initial);
  return <SquadContext.Provider value={squad}>{children}</SquadContext.Provider>;
}

export function useSquad() {
  const ctx = useContext(SquadContext);
  if (!ctx) throw new Error("useSquad must be used within SquadProvider");
  return ctx;
}
