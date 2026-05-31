import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function Card({ children, className, title, description }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900/50 p-6",
        className
      )}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-zinc-400">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="mb-4 text-zinc-600">{icon}</div>
      )}
      <h3 className="text-lg font-medium text-zinc-300">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">{description}</p>
    </div>
  );
}
