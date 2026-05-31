import { EmptyState } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionPageProps {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  accent?: "blue" | "green" | "red";
  children?: React.ReactNode;
}

export function SectionPage({
  title,
  description,
  emptyTitle,
  emptyDescription,
  accent = "blue",
  children,
}: SectionPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-2xl sm:text-3xl">{title}</h1>
        <p className="text-body mt-1.5 text-sm">{description}</p>
      </div>
      {children ?? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          accent={accent}
        />
      )}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <h1 className="text-display text-2xl sm:text-3xl">{title}</h1>
      {description && <p className="text-body text-sm">{description}</p>}
    </div>
  );
}
