"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useSquadManager, type SquadManager } from "@/hooks/use-squad-manager";

const SquadContext = createContext<SquadManager | null>(null);

export function SquadProvider({
  teamName,
  children,
}: {
  teamName: string;
  children: ReactNode;
}) {
  const squad = useSquadManager(teamName);
  return <SquadContext.Provider value={squad}>{children}</SquadContext.Provider>;
}

export function useSquad() {
  const ctx = useContext(SquadContext);
  if (!ctx) throw new Error("useSquad must be used within SquadProvider");
  return ctx;
}
