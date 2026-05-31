import { redirect } from "next/navigation";
import { getDefaultTab, MY_TEAM_TABS } from "@/lib/navigation";

export default function MyTeamPage() {
  redirect(`/my-team/${getDefaultTab(MY_TEAM_TABS)}`);
}
