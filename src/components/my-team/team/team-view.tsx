"use client";

import { FormationBuilder } from "@/components/my-team/team/formation-builder";

interface TeamViewProps {
  teamName: string;
  selectedNation: string;
}

export function TeamView({ teamName, selectedNation }: TeamViewProps) {
  return <FormationBuilder teamName={teamName} selectedNation={selectedNation} />;
}
