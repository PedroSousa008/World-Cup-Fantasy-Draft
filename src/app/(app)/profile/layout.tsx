import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProfileSectionPrefetch } from "@/components/profile/profile-section-prefetch";
import { ProfileShell } from "@/components/profile/profile-shell";

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <ProfileSectionPrefetch />
      <ProfileShell />
      {children}
    </>
  );
}
