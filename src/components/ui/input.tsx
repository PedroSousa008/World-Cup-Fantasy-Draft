import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#081120]/80"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "flex h-11 w-full rounded-xl border border-[#081120]/10 bg-white px-3.5 py-2 text-sm text-[#081120]",
            "placeholder:text-[#081120]/35",
            "transition-all duration-300",
            "focus:border-[#0066FF] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-[#E53935] focus:border-[#E53935] focus:ring-[#E53935]/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#E53935]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
