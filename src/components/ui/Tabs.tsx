"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({
  items,
  value,
  onValueChange,
  children,
  className,
}: TabsProps) {
  return (
    <TabsPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
    >
      <TabsPrimitive.List
        className={cn(
          "flex gap-1 rounded-xl p-1",
          "bg-[var(--lf-card-bg)] border border-[var(--lf-border)]"
        )}
        aria-label="Editor sections"
      >
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2",
              "text-xs font-medium rounded-lg",
              "text-[var(--lf-muted)] transition-all duration-200",
              "hover:text-[var(--lf-text)]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lf-accent)]",
              "data-[state=active]:bg-[var(--lf-accent)] data-[state=active]:text-white",
              "data-[state=active]:shadow-sm",
              "cursor-pointer select-none"
            )}
          >
            {item.icon}
            <span className="hidden sm:inline">{item.label}</span>
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {children}
    </TabsPrimitive.Root>
  );
}

export function TabContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsPrimitive.Content
      value={value}
      className={cn(
        "mt-4 focus:outline-none",
        "data-[state=active]:animate-[fade-up_0.3s_ease-out]",
        className
      )}
    >
      {children}
    </TabsPrimitive.Content>
  );
}
