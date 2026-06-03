import { redirect } from "next/navigation";
import { getDefaultTab, OWNER_PLAYERS_TABS } from "@/lib/navigation";

export default function OwnerPlayersPage() {
  redirect(`/owner/players/${getDefaultTab(OWNER_PLAYERS_TABS)}`);
}
