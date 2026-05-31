import { cn } from "@/lib/utils";

interface BallMarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

/** Abstract mark inspired by WC2026 ball panel geometry — not FIFA branding */
export function BallMark({ size = "md", className }: BallMarkProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center",
        sizes[size],
        className
      )}
    >
      <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
        <circle cx="24" cy="24" r="22" fill="#F8F9FA" opacity="0.95" />
        <path
          d="M24 4 C34 12, 40 22, 38 32 C36 42, 28 46, 24 44 C20 46, 12 42, 10 32 C8 22, 14 12, 24 4Z"
          fill="#0066FF"
          opacity="0.85"
        />
        <path
          d="M8 28 C14 34, 22 38, 30 36 C38 34, 42 28, 40 22"
          fill="none"
          stroke="#E53935"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M38 18 C32 14, 26 12, 20 16 C14 20, 12 28, 16 34"
          fill="none"
          stroke="#00C853"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.85"
        />
        <circle cx="24" cy="24" r="3" fill="#081120" opacity="0.15" />
      </svg>
    </div>
  );
}

interface BrandLogoProps {
  showName?: boolean;
  className?: string;
  nameClassName?: string;
}

export function BrandLogo({
  showName = true,
  className,
  nameClassName,
}: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <BallMark size="md" />
      {showName && (
        <span
          className={cn(
            "text-display text-base font-bold tracking-tight text-white sm:text-lg",
            nameClassName
          )}
        >
          WC Fantasy Draft
        </span>
      )}
    </div>
  );
}
