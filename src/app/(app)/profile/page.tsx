import { redirect } from "next/navigation";
import { getDefaultTab, PROFILE_TABS } from "@/lib/navigation";

export default function ProfilePage() {
  redirect(`/profile/${getDefaultTab(PROFILE_TABS)}`);
}
