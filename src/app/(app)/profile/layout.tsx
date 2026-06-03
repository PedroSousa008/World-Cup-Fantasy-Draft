import { ProfileSectionPrefetch } from "@/components/profile/profile-section-prefetch";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProfileSectionPrefetch />
      {children}
    </>
  );
}
