import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#0066FF] text-white shadow-[0_4px_20px_rgba(0,102,255,0.35)] hover:bg-[#0052CC] hover:shadow-[0_6px_28px_rgba(0,102,255,0.45)] focus-visible:ring-[#0066FF]",
  secondary:
    "bg-[#0B1526] text-white border border-white/10 hover:bg-[#081120] hover:border-white/20 focus-visible:ring-white/30",
  outline:
    "border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 focus-visible:ring-white/30",
  ghost:
    "bg-transparent text-white/70 hover:bg-white/8 hover:text-white focus-visible:ring-white/20",
  danger:
    "bg-[#E53935] text-white shadow-[0_4px_20px_rgba(229,57,53,0.3)] hover:bg-[#D62828] focus-visible:ring-[#E53935]",
  success:
    "bg-[#00C853] text-white shadow-[0_4px_20px_rgba(0,200,83,0.3)] hover:bg-[#00A844] focus-visible:ring-[#00C853]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-xl",
  md: "h-10 px-5 text-sm rounded-xl",
  lg: "h-12 px-7 text-base rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "wc-btn-motion inline-flex items-center justify-center gap-2 font-semibold",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081120]",
          "disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
