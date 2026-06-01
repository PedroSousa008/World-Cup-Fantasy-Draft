import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPlayerDetailsFromDb } from "@/lib/rankings/get-player-details";
import { PlayerPageClient } from "./player-page-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlayerPage({ params }: PageProps) {
  const { id } = await params;
  const dbPlayer = await getPlayerDetailsFromDb(id);

  if (!dbPlayer) {
    notFound();
  }

  return (
    <Suspense>
      <PlayerPageClient playerId={id} dbPlayer={dbPlayer} />
    </Suspense>
  );
}
