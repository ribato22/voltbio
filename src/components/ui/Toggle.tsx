"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Toggle({
  checked,
  onCheckedChange,
  label,
  disabled,
  className,
  id,
}: ToggleProps) {
  const toggleId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <SwitchPrimitive.Root
        id={toggleId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          "peer relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full",
          "border-2 border-transparent transition-colors duration-200",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lf-accent)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=checked]:bg-[var(--lf-accent)]",
          "data-[state=unchecked]:bg-[var(--lf-border)]"
        )}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg",
            "ring-0 transition-transform duration-200",
            "data-[state=checked]:translate-x-5",
            "data-[state=unchecked]:translate-x-0"
          )}
        />
      </SwitchPrimitive.Root>
      {label && (
        <label
          htmlFor={toggleId}
          className="text-sm font-medium text-[var(--lf-text)] cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
}
