"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Link2,
  Palette,
  Smartphone,
  Download,
  ArrowRight,
  Github,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui";

const emptySubscribe = () => () => {};

function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

const features = [
  {
    icon: <Link2 className="h-5 w-5" />,
    title: "Unlimited Links",
    description: "Add as many links as you need. No restrictions, ever.",
  },
  {
    icon: <Palette className="h-5 w-5" />,
    title: "Beautiful Themes",
    description: "Choose from hand-crafted themes or create your own palette.",
  },
  {
    icon: <Smartphone className="h-5 w-5" />,
    title: "Mobile-First",
    description: "Pixel-perfect on every device, from phones to desktops.",
  },
  {
    icon: <Download className="h-5 w-5" />,
    title: "Export & Deploy",
    description: "Download as ZIP or deploy to Vercel, Netlify, or GitHub Pages.",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Privacy-First",
    description: "Your data stays on your device. No tracking, no analytics.",
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Blazing Fast",
    description: "Static output means sub-second load times worldwide.",
  },
];

export default function HomePage() {
  const mounted = useHasMounted();

  if (!mounted) return null;

  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  return (
    <div className="min-h-screen bg-[var(--lf-bg)] text-[var(--lf-text)] overflow-hidden">
      {/* ─── Hero ─── */}
      <header className="relative">
        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
          <div className="absolute -top-20 right-0 w-80 h-80 bg-blue-500/15 rounded-full blur-[100px]" />
          <div className="absolute top-60 left-1/2 w-72 h-72 bg-pink-500/10 rounded-full blur-[100px]" />
        </div>

        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[var(--lf-accent)]" />
            <span className="text-xl font-bold tracking-tight">VoltBio</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View on GitHub"
              >
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </Button>
            <Button size="sm" asChild>
              <Link href="/editor">
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </nav>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-[var(--lf-accent)]/10 text-[var(--lf-accent)] border border-[var(--lf-accent)]/20 mb-6">
              <Sparkles className="h-3 w-3" />
              100% Free & Open Source
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Your Links,{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Beautifully Forged
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[var(--lf-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
              Create a stunning link-in-bio page in minutes. No paywall, no
              sign-up. Just beautiful design you can deploy anywhere, for free.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/editor">
                  Start Building
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/preview">
                  See Demo
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* ─── Features Grid ─── */}
      <section className="relative max-w-6xl mx-auto px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="text-[var(--lf-muted)] max-w-lg mx-auto">
              Built for creators, developers, and small businesses who deserve
              premium tools without premium prices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                className="group p-6 rounded-2xl border border-[var(--lf-border)] bg-[var(--lf-card-bg)] hover:border-[var(--lf-accent)]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--lf-accent)]/5"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--lf-accent)]/10 text-[var(--lf-accent)] mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--lf-muted)] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[var(--lf-border)] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[var(--lf-muted)]">
            <Sparkles className="h-4 w-4 text-[var(--lf-accent)]" />
            <span>
              VoltBio — MIT Licensed. Made with ❤️ for the open-source community.
            </span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--lf-muted)] hover:text-[var(--lf-text)] transition-colors"
          >
            Star on GitHub ⭐
          </a>
        </div>
      </footer>
    </div>
  );
}
