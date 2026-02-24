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
  Zap,
  Cloud,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DeployTab = "netlify" | "vercel" | "tiiny" | "github";

const tabs: { id: DeployTab; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: "netlify", label: "Netlify Drop", icon: <Rocket className="w-4 h-4" />, badge: "Easiest" },
  { id: "vercel", label: "Vercel", icon: <Globe className="w-4 h-4" /> },
  { id: "tiiny", label: "Tiiny.host", icon: <Zap className="w-4 h-4" /> },
  { id: "github", label: "GitHub", icon: <Github className="w-4 h-4" /> },
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

function HostLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--lf-accent)] underline underline-offset-2 inline-flex items-center gap-1 font-medium"
    >
      {children}
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

export function DeployModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState<DeployTab>("netlify");
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
      title="Publish Your Page"
      description="Download your page and put it online in 30 seconds."
    >
      <div className="space-y-5">
        {/* ── Step 1: Download ZIP ── */}
        <div>
          <p className="text-xs font-semibold text-[var(--lf-muted)] mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5" />
            Step 1 — Download
          </p>
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
          <p className="text-[10px] text-center text-[var(--lf-muted)] mt-2">
            Your ZIP contains a self-contained <code>index.html</code> — no coding needed!
          </p>
        </div>

        {/* ── Step 2: Choose hosting ── */}
        <div className="border-t border-[var(--lf-border)] pt-4">
          <p className="text-xs font-semibold text-[var(--lf-muted)] mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <Rocket className="w-3.5 h-3.5" />
            Step 2 — Put it online (free)
          </p>

          {/* Tab Buttons */}
          <div className="flex gap-1 p-1 rounded-xl bg-[var(--lf-card-bg)] border border-[var(--lf-border)] mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 cursor-pointer relative",
                  activeTab === tab.id
                    ? "bg-[var(--lf-accent)] text-white shadow-sm"
                    : "text-[var(--lf-muted)] hover:text-[var(--lf-text)]"
                )}
                aria-pressed={activeTab === tab.id}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.badge && (
                  <span className={cn(
                    "absolute -top-1.5 -right-0.5 text-[8px] font-bold px-1 py-0.5 rounded-full leading-none",
                    activeTab === tab.id
                      ? "bg-white text-[var(--lf-accent)]"
                      : "bg-[var(--lf-accent)] text-white"
                  )}>
                    <Star className="w-2 h-2 inline -mt-0.5" /> {tab.badge}
                  </span>
                )}
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
              {activeTab === "netlify" && (
                <>
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-300 mb-1">
                    ⚡ <strong>Recommended!</strong> No account needed. Just drag & drop.
                  </div>
                  <Step n={1}>
                    Buka <HostLink href="https://app.netlify.com/drop">app.netlify.com/drop</HostLink>
                  </Step>
                  <Step n={2}>
                    Ekstrak file ZIP yang sudah diunduh, lalu <strong>seret folder</strong> ke area upload di halaman tersebut.
                  </Step>
                  <Step n={3}>
                    Selesai! Website kamu langsung online dengan URL gratis <code>.netlify.app</code> 🎉
                  </Step>
                </>
              )}

              {activeTab === "vercel" && (
                <>
                  <Step n={1}>
                    Buka <HostLink href="https://vercel.com/new">vercel.com/new</HostLink> dan klik tombol <strong>&quot;Upload&quot;</strong>.
                  </Step>
                  <Step n={2}>
                    Ekstrak file ZIP, lalu <strong>seret folder</strong> ke area upload.
                  </Step>
                  <Step n={3}>
                    Vercel akan langsung deploy dengan URL gratis <code>.vercel.app</code>! ✨
                  </Step>
                </>
              )}

              {activeTab === "tiiny" && (
                <>
                  <Step n={1}>
                    Buka <HostLink href="https://tiiny.host">tiiny.host</HostLink>
                  </Step>
                  <Step n={2}>
                    <strong>Upload langsung file ZIP</strong> (tidak perlu diekstrak dulu!).
                  </Step>
                  <Step n={3}>
                    Pilih subdomain yang kamu inginkan, lalu klik <strong>Launch</strong>. Gratis untuk 1 minggu! 🚀
                  </Step>
                </>
              )}

              {activeTab === "github" && (
                <>
                  <Step n={1}>
                    Buat repository baru di GitHub.
                  </Step>
                  <Step n={2}>
                    Ekstrak ZIP, lalu upload isinya ke repository:
                    <CodeBlock>{`git init\ngit add .\ngit commit -m "Deploy bio page"\ngit remote add origin https://github.com/YOU/REPO.git\ngit push -u origin main`}</CodeBlock>
                  </Step>
                  <Step n={3}>
                    Buka <strong>Settings → Pages</strong>, pilih <strong>main branch</strong>, klik Save.
                  </Step>
                  <Step n={4}>
                    Website live di <code>https://YOU.github.io/REPO</code> 🎉
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
