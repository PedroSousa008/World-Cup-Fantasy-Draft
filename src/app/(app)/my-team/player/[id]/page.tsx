import { Suspense } from "react";
import { PlayerPageClient } from "./player-page-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlayerPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense>
      <PlayerPageClient playerId={id} />
    </Suspense>
  );
}
