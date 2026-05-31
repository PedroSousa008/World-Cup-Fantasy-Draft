import { redirect } from "next/navigation";
import { getDefaultTab, PREDICTIONS_TABS } from "@/lib/navigation";

export default function PredictionsPage() {
  redirect(`/predictions/${getDefaultTab(PREDICTIONS_TABS)}`);
}
