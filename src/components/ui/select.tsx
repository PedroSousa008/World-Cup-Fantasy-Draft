import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, placeholder, ...props }, ref) => {
    const selectId = id ?? props.name;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-[#081120]/80"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "flex h-11 w-full rounded-xl border border-[#081120]/10 bg-white px-3.5 py-2 text-sm text-[#081120]",
            "transition-all duration-300",
            "focus:border-[#0066FF] focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-[#E53935] focus:border-[#E53935] focus:ring-[#E53935]/20",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-[#E53935]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
