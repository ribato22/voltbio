"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(
          // Base
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lf-accent)]",
          "disabled:pointer-events-none disabled:opacity-50",
          "cursor-pointer select-none",
          // Variants
          variant === "primary" && [
            "bg-[var(--lf-accent)] text-white",
            "hover:brightness-110 hover:shadow-lg hover:shadow-[var(--lf-accent)]/20",
            "active:scale-[0.98]",
          ],
          variant === "secondary" && [
            "bg-[var(--lf-card-bg)] text-[var(--lf-text)] border border-[var(--lf-border)]",
            "hover:bg-[var(--lf-border)]",
            "active:scale-[0.98]",
          ],
          variant === "ghost" && [
            "text-[var(--lf-text)]",
            "hover:bg-[var(--lf-card-bg)]",
          ],
          variant === "danger" && [
            "bg-red-500/10 text-red-400 border border-red-500/20",
            "hover:bg-red-500/20",
            "active:scale-[0.98]",
          ],
          variant === "outline" && [
            "border border-[var(--lf-border)] text-[var(--lf-text)] bg-transparent",
            "hover:bg-[var(--lf-card-bg)]",
            "active:scale-[0.98]",
          ],
          // Sizes
          size === "sm" && "h-8 px-3 text-xs rounded-lg",
          size === "md" && "h-10 px-4 text-sm rounded-lg",
          size === "lg" && "h-12 px-6 text-base rounded-xl",
          size === "icon" && "h-10 w-10 rounded-lg",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
