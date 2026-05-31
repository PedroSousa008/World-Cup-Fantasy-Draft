import { requireOwner } from "@/lib/session";
import { OwnerNav } from "@/components/navigation/OwnerNav";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOwner();

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <OwnerNav />
      <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
    </div>
  );
}
