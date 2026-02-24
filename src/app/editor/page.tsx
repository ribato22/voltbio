"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useThemeBridge } from "@/lib/hooks/useThemeBridge";
import { exportConfig, importConfig } from "@/lib/config-io";
import { DeployModal } from "@/components/editor/DeployModal";
import { ProfileEditor } from "@/components/editor/ProfileEditor";
import { LinkEditor } from "@/components/editor/LinkEditor";
import { ThemeEditor } from "@/components/editor/ThemeEditor";
import { SeoEditor } from "@/components/editor/SeoEditor";
import { QRCodeGenerator } from "@/components/editor/QRCodeGenerator";
import { BioPage } from "@/components/preview/BioPage";
import { Tabs, TabContent } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Rocket,
  User,
  Link2,
  Palette,
  Search,
  Download,
  Upload,
  Eye,
  EyeOff,
  Sparkles,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditorPanel } from "@/types";

const emptySubscribe = () => () => {};
function useHasMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

const tabItems = [
  { value: "profile" as const, label: "Profile", icon: <User className="w-3.5 h-3.5" /> },
  { value: "links" as const, label: "Links", icon: <Link2 className="w-3.5 h-3.5" /> },
  { value: "theme" as const, label: "Theme", icon: <Palette className="w-3.5 h-3.5" /> },
  { value: "seo" as const, label: "SEO", icon: <Search className="w-3.5 h-3.5" /> },
];

export default function EditorPage() {
  const mounted = useHasMounted();
  const [deployOpen, setDeployOpen] = useState(false);
  const activePanel = useStore((s) => s.editor.activePanel);
  const showPreview = useStore((s) => s.editor.showPreview);
  const setActivePanel = useStore((s) => s.setActivePanel);
  const togglePreview = useStore((s) => s.togglePreview);

  // Activate the theme bridge so CSS vars update live
  useThemeBridge();

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--lf-bg)] flex items-center justify-center">
        <Sparkles className="w-6 h-6 text-[var(--lf-accent)] animate-pulse" />
      </div>
    );
  }

  const handleImport = async () => {
    const result = await importConfig();
    if (!result.success) {
      alert(result.error || "Import failed");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--lf-bg)] text-[var(--lf-text)] flex flex-col">
      {/* ─── Top Bar ─── */}
      <header className="sticky top-0 z-40 border-b border-[var(--lf-border)] bg-[var(--lf-bg)]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/" aria-label="Back to home">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--lf-accent)]" />
              <span className="font-semibold text-sm hidden sm:inline">VoltBio Editor</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleImport}
              className="hidden sm:inline-flex"
            >
              <Upload className="w-3.5 h-3.5" />
              Import
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={exportConfig}
              className="hidden sm:inline-flex"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </Button>
            <Button
              size="sm"
              onClick={() => setDeployOpen(true)}
              className="hidden sm:inline-flex"
            >
              <Rocket className="w-3.5 h-3.5" />
              Deploy
            </Button>

            {/* Desktop: Toggle preview pane */}
            <Button
              variant="secondary"
              size="sm"
              onClick={togglePreview}
              className="hidden lg:inline-flex"
            >
              {showPreview ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  Show Preview
                </>
              )}
            </Button>

            {/* Mobile: Preview button */}
            <Button variant="secondary" size="icon" className="lg:hidden" asChild>
              <Link href="/preview" aria-label="Open preview">
                <Smartphone className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Editor Panel (always visible) ── */}
        <div
          className={cn(
            "flex flex-col overflow-y-auto",
            showPreview ? "w-full lg:w-1/2 xl:w-[45%]" : "w-full",
            "border-r-0 lg:border-r border-[var(--lf-border)]"
          )}
        >
          <div className="p-4 flex-1">
            <Tabs
              items={tabItems}
              value={activePanel}
              onValueChange={(v) => setActivePanel(v as EditorPanel)}
            >
              <TabContent value="profile">
                <ProfileEditor />
                <div className="mt-6 pt-6 border-t border-[var(--lf-border)]">
                  <QRCodeGenerator />
                </div>
              </TabContent>
              <TabContent value="links">
                <LinkEditor />
              </TabContent>
              <TabContent value="theme">
                <ThemeEditor />
              </TabContent>
              <TabContent value="seo">
                <SeoEditor />
              </TabContent>
            </Tabs>
          </div>

          {/* Mobile action bar */}
          <div className="sm:hidden border-t border-[var(--lf-border)] p-3 flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleImport} className="flex-1">
              <Upload className="w-3.5 h-3.5" />
              Import
            </Button>
            <Button size="sm" onClick={() => setDeployOpen(true)} className="flex-1">
              <Rocket className="w-3.5 h-3.5" />
              Deploy
            </Button>
          </div>
        </div>

        {/* ── Live Preview Panel (desktop only) ── */}
        {showPreview && (
          <div className="hidden lg:flex flex-col flex-1 bg-neutral-950/50">
            {/* Phone frame */}
            <div className="flex-1 flex items-start justify-center p-6 overflow-y-auto">
              <div className="w-[375px] min-h-[700px] rounded-[2.5rem] border-4 border-neutral-700 bg-neutral-900 shadow-2xl overflow-hidden relative">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-neutral-900 rounded-b-2xl z-10" />
                {/* Screen */}
                <div className="h-full overflow-y-auto pt-8">
                  <BioPage embedded />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deploy Modal */}
      <DeployModal open={deployOpen} onOpenChange={setDeployOpen} />
    </div>
  );
}
