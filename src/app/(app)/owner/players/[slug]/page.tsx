import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { OwnerNationAssignments } from "@/components/owner/owner-nation-assignments";
import { getNationDetailData } from "@/lib/owner/get-nations-data";
import { getNationFlag } from "@/lib/nations";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function OwnerNationPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.OWNER) {
    redirect("/my-team");
  }

  const { slug } = await params;
  const data = await getNationDetailData(slug);

  if (!data) {
    return (
      <div className="space-y-6 overflow-x-hidden pb-8">
        <Link
          href="/owner/players"
          className="inline-flex items-center gap-1 text-sm font-semibold text-white/50"
        >
          <ArrowLeft className="h-4 w-4" />
          All nations
        </Link>
        <div className="rounded-2xl bg-white/95 p-6 text-center shadow-lg ring-1 ring-black/5">
          <p className="font-bold text-[#081120]">Nation not found</p>
          <Link
            href="/owner/players"
            className="mt-4 inline-block text-sm font-semibold text-[#0066FF]"
          >
            ← Nations & Players
          </Link>
        </div>
      </div>
    );
  }

  const { nation } = data;
  const flag = nation.flagEmoji ?? getNationFlag(nation.name);

  return (
    <div className="space-y-6 overflow-x-hidden pb-8">
      <Link
        href="/owner/players"
        className="inline-flex items-center gap-1 text-sm font-semibold text-white/50"
      >
        <ArrowLeft className="h-4 w-4" />
        All nations
      </Link>

      <div className="flex items-center gap-3">
        <span className="text-4xl">{flag}</span>
        <div>
          <h1 className="text-display text-2xl text-white">{nation.name}</h1>
          <p className="text-sm text-white/50">
            <code className="rounded bg-white/10 px-1">public/{nation.imageDir}/</code> ·{" "}
            {nation.playerCount} players
          </p>
        </div>
      </div>

      <OwnerNationAssignments
        nationSlug={nation.slug}
        nationName={nation.name}
        players={data.players}
        users={data.users}
      />
    </div>
  );
}
