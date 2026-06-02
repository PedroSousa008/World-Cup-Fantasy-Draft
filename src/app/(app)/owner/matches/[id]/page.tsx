import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OwnerMatchEditRedirect({ params }: PageProps) {
  const { id } = await params;
  redirect(`/owner/matches-events/matches/${id}`);
}
