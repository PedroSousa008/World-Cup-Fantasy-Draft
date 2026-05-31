import { redirect } from "next/navigation";
import { getDefaultTab, BETS_TABS } from "@/lib/navigation";

export default function BetsPage() {
  redirect(`/bets/${getDefaultTab(BETS_TABS)}`);
}
