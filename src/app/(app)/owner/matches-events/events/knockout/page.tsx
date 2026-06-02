import { OwnerKnockoutPanel } from "@/components/owner/owner-knockout-panel";
import { getProgressionData } from "@/lib/actions/owner/progression";

export const dynamic = "force-dynamic";

export default async function OwnerEventsKnockoutPage() {
  const nations = await getProgressionData();

  return <OwnerKnockoutPanel nations={nations} />;
}
