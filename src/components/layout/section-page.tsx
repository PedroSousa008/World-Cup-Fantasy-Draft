import { EmptyState } from "@/components/ui/card";

interface SectionPageProps {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
}

export function SectionPage({
  title,
  description,
  emptyTitle,
  emptyDescription,
}: SectionPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
      <EmptyState title={emptyTitle} description={emptyDescription} />
    </div>
  );
}
