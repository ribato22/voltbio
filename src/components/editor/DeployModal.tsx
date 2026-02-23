"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { exportStaticSite } from "@/lib/export";
import {
  Download,
  Rocket,
  Globe,
  Github,
  Check,
  Loader2,
  ExternalLink,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DeployTab = "vercel" | "netlify" | "github";

const tabs: { id: DeployTab; label: string; icon: React.ReactNode }[] = [
  { id: "vercel", label: "Vercel", icon: <Globe className="w-4 h-4" /> },
  { id: "netlify", label: "Netlify", icon: <Rocket className="w-4 h-4" /> },
  { id: "github", label: "GitHub Pages", icon: <Github className="w-4 h-4" /> },
];

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--lf-accent)] text-white text-xs font-bold flex items-center justify-center mt-0.5">
        {n}
      </div>
      <div className="text-sm text-[var(--lf-text)] opacity-80 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group mt-2 mb-3">
      <pre className="bg-neutral-900 text-neutral-100 text-xs rounded-lg p-3 overflow-x-auto font-mono">
        {children}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-neutral-700 text-neutral-300 hover:bg-neutral-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
        aria-label="Copy command"
      >
        {copied ? (
          <Check className="w-3 h-3 text-green-400" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </button>
    </div>
  );
}

export function DeployModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState<DeployTab>("vercel");
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const config = useStore((s) => s.config);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportStaticSite(config);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Export & Deploy"
      description="Download your bio page and deploy it for free."
    >
      <div className="space-y-5">
        {/* ── Export Button ── */}
        <Button
          onClick={handleExport}
          disabled={exporting}
          className="w-full"
          size="lg"
        >
          {exporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating…
            </>
          ) : exported ? (
            <>
              <Check className="w-4 h-4" />
              Downloaded!
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download ZIP
            </>
          )}
        </Button>

        <p className="text-xs text-center text-[var(--lf-muted)]">
          Your ZIP contains a self-contained <code>index.html</code> with inline CSS, SEO tags, and Open Graph metadata.
        </p>

        {/* ── Deploy Instructions Tabs ── */}
        <div className="border-t border-[var(--lf-border)] pt-4">
          <p className="text-xs font-medium text-[var(--lf-muted)] mb-3 uppercase tracking-wider">
            Deploy for Free
          </p>

          {/* Tab Buttons */}
          <div className="flex gap-1 p-1 rounded-xl bg-[var(--lf-card-bg)] border border-[var(--lf-border)] mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer",
                  activeTab === tab.id
                    ? "bg-[var(--lf-accent)] text-white shadow-sm"
                    : "text-[var(--lf-muted)] hover:text-[var(--lf-text)]"
                )}
                aria-pressed={activeTab === tab.id}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {activeTab === "vercel" && (
                <>
                  <Step n={1}>
                    Go to <a
                      href="https://vercel.com/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--lf-accent)] underline underline-offset-2 inline-flex items-center gap-1"
                    >
                      vercel.com/new
                      <ExternalLink className="w-3 h-3" />
                    </a> and click <strong>&quot;Upload&quot;</strong>.
                  </Step>
                  <Step n={2}>
                    Unzip the downloaded file and <strong>drag the folder</strong> into the upload area.
                  </Step>
                  <Step n={3}>
                    Vercel will deploy instantly with a free <code>.vercel.app</code> URL! ✨
                  </Step>
                </>
              )}

              {activeTab === "netlify" && (
                <>
                  <Step n={1}>
                    Go to <a
                      href="https://app.netlify.com/drop"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--lf-accent)] underline underline-offset-2 inline-flex items-center gap-1"
                    >
                      app.netlify.com/drop
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Step>
                  <Step n={2}>
                    <strong>Drag & drop</strong> your unzipped folder directly onto the page.
                  </Step>
                  <Step n={3}>
                    Your site is live on a free <code>.netlify.app</code> URL! 🚀
                  </Step>
                </>
              )}

              {activeTab === "github" && (
                <>
                  <Step n={1}>
                    Create a new GitHub repository (or use an existing one).
                  </Step>
                  <Step n={2}>
                    Unzip the downloaded file and push the contents:
                    <CodeBlock>{`git init\ngit add .\ngit commit -m "Deploy bio page"\ngit remote add origin https://github.com/YOU/YOUR-REPO.git\ngit push -u origin main`}</CodeBlock>
                  </Step>
                  <Step n={3}>
                    Go to <strong>Settings → Pages</strong>, select <strong>main branch</strong>, and click Save.
                  </Step>
                  <Step n={4}>
                    Your site will be live at <code>https://YOU.github.io/YOUR-REPO</code> 🎉
                  </Step>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
}
