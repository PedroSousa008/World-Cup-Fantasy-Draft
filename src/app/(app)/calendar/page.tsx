import { redirect } from "next/navigation";
import { getDefaultTab, CALENDAR_TABS } from "@/lib/navigation";

export default function CalendarPage() {
  redirect(`/calendar/${getDefaultTab(CALENDAR_TABS)}`);
}
