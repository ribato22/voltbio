"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useThemeBridge } from "@/lib/hooks/useThemeBridge";
import { BioPage } from "@/components/preview/BioPage";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Pencil, Sparkles } from "lucide-react";

const emptySubscribe = () => () => {};
function useHasMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export default function PreviewPage() {
  const mounted = useHasMounted();
  useThemeBridge();

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--lf-bg)] flex items-center justify-center">
        <Sparkles className="w-6 h-6 text-[var(--lf-accent)] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Floating Edit Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button variant="secondary" size="sm" asChild className="glass shadow-lg">
          <Link href="/editor">
            <ArrowLeft className="w-3.5 h-3.5" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="fixed top-4 right-4 z-50">
        <Button variant="secondary" size="sm" asChild className="glass shadow-lg">
          <Link href="/editor">
            <Pencil className="w-3.5 h-3.5" />
            Editor
          </Link>
        </Button>
      </div>

      <BioPage />
    </div>
  );
}
