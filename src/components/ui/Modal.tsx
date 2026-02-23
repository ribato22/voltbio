"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: ModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
            "data-[state=open]:animate-[fade-in_0.2s_ease-out]",
            "data-[state=closed]:animate-[fade-in_0.2s_ease-out_reverse]"
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-lg max-h-[85vh] overflow-y-auto",
            "rounded-2xl p-6",
            "bg-[var(--lf-card-bg)] border border-[var(--lf-border)]",
            "shadow-xl",
            "data-[state=open]:animate-[scale-in_0.2s_ease-out]",
            "focus:outline-none",
            className
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <DialogPrimitive.Title className="text-lg font-semibold text-[var(--lf-text)]">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="text-sm text-[var(--lf-muted)] mt-1">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close
              aria-label="Close"
              className={cn(
                "rounded-lg p-1.5 text-[var(--lf-muted)]",
                "hover:bg-[var(--lf-border)] hover:text-[var(--lf-text)]",
                "transition-colors duration-150",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lf-accent)]"
              )}
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
