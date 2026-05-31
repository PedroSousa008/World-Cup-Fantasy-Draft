"use client";

import { SquadProvider } from "@/contexts/squad-context";

interface MyTeamLayoutClientProps {
  teamName: string;
  children: React.ReactNode;
}

export function MyTeamLayoutClient({ teamName, children }: MyTeamLayoutClientProps) {
  return <SquadProvider teamName={teamName}>{children}</SquadProvider>;
}
