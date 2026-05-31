import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MyTeamLayoutClient } from "./my-team-layout-client";

export default async function MyTeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <MyTeamLayoutClient teamName={session.user.teamName}>
      {children}
    </MyTeamLayoutClient>
  );
}
