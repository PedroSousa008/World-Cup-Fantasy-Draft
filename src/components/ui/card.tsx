import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  description?: string;
  variant?: "light" | "dark";
  hover?: boolean;
}

export function Card({
  children,
  className,
  title,
  description,
  variant = "light",
  hover = true,
}: CardProps) {
  return (
    <div
      className={cn(
        "p-6",
        variant === "light" ? "wc-card" : "wc-card-dark",
        !hover && "hover:transform-none hover:shadow-[inherit]",
        className
      )}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3
              className={cn(
                "text-lg font-semibold",
                variant === "light" ? "text-[#081120]" : "text-white"
              )}
            >
              {title}
            </h3>
          )}
          {description && (
            <p
              className={cn(
                "mt-1 text-sm",
                variant === "light" ? "text-[#081120]/60" : "text-white/55"
              )}
            >
              {description}
            </p>
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
  accent = "blue",
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  accent?: "blue" | "green" | "red";
}) {
  const accentBorder = {
    blue: "border-[#0066FF]/20",
    green: "border-[#00C853]/20",
    red: "border-[#E53935]/20",
  }[accent];

  const accentBg = {
    blue: "from-[#0066FF]/5 to-transparent",
    green: "from-[#00C853]/5 to-transparent",
    red: "from-[#E53935]/5 to-transparent",
  }[accent];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed px-6 py-16 text-center",
        "wc-card",
        accentBorder
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
          accentBg
        )}
      />
      <div className="relative">
        {icon && <div className="mb-4 text-[#081120]/30">{icon}</div>}
        <h3 className="text-lg font-semibold text-[#081120]">{title}</h3>
        <p className="mt-2 max-w-md text-sm text-[#081120]/55">{description}</p>
      </div>
    </div>
  );
}
