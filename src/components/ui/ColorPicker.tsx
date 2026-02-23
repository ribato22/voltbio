"use client";

import { HexColorPicker } from "react-colorful";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

export function ColorPicker({ color, onChange, label, className }: ColorPickerProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <PopoverPrimitive.Root>
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            className={cn(
              "h-8 w-8 rounded-lg border-2 border-[var(--lf-border)]",
              "cursor-pointer transition-all duration-150",
              "hover:scale-110 hover:shadow-md",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lf-accent)]"
            )}
            style={{ backgroundColor: color }}
            aria-label={label ? `Pick color for ${label}` : "Pick a color"}
          />
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            side="bottom"
            align="start"
            sideOffset={8}
            className={cn(
              "z-50 rounded-xl p-3",
              "bg-[var(--lf-card-bg)] border border-[var(--lf-border)]",
              "shadow-xl",
              "data-[state=open]:animate-[scale-in_0.15s_ease-out]"
            )}
          >
            <HexColorPicker color={color} onChange={onChange} />
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-[var(--lf-muted)]">HEX</span>
              <input
                type="text"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                  "flex-1 h-7 px-2 text-xs rounded-md font-mono",
                  "bg-[var(--lf-bg)] text-[var(--lf-text)]",
                  "border border-[var(--lf-border)]",
                  "focus:outline-none focus:ring-1 focus:ring-[var(--lf-accent)]"
                )}
                aria-label="Hex color value"
              />
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
      {label && (
        <span className="text-sm text-[var(--lf-text)] opacity-80">{label}</span>
      )}
    </div>
  );
}
