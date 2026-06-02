import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MyTeamLayoutClient } from "./my-team-layout-client";
import { getSquadData } from "@/lib/squad/get-squad-data";
import { getEmptyAssignments } from "@/lib/squad/empty-assignments";

export const dynamic = "force-dynamic";

export default async function MyTeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const squadInitial =
    (await getSquadData(session.user.id)) ?? {
      assignedPlayers: [],
      assignments: getEmptyAssignments("4-3-3"),
      captainId: null,
      viceCaptainId: null,
      formationId: "4-3-3" as const,
    };

  return (
    <MyTeamLayoutClient teamName={session.user.teamName} squadInitial={squadInitial}>
      {children}
    </MyTeamLayoutClient>
  );
}
