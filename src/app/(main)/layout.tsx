import { auth } from "@/lib/auth";
import { MainNav } from "@/components/navigation/MainNav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="min-h-screen bg-zinc-950">
      <MainNav
        teamName={user?.teamName}
        nation={user?.nation}
        isOwner={user?.role === "OWNER"}
      />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
