"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/lib/store";
import { getAnalytics, getTotalClicks, resetAnalytics } from "@/lib/analytics";
import type { AnalyticsStore } from "@/lib/analytics";
import { BarChart3, MousePointerClick, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Analytics Dashboard — Privacy-First Click Statistics
 *
 * Shows click counts per link using localStorage-only data.
 * No backend, no cookies, no personal data.
 */
export function AnalyticsDashboard() {
  const links = useStore((s) => s.config.links);
  const [analytics, setAnalytics] = useState<AnalyticsStore>({});
  const [totalClicks, setTotalClicks] = useState(0);

  // Refresh analytics data
  const refresh = useCallback(() => {
    setAnalytics(getAnalytics());
    setTotalClicks(getTotalClicks());
  }, []);

  // Load on mount + periodic refresh
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000); // Auto-refresh every 3s
    return () => clearInterval(interval);
  }, [refresh]);

  const handleReset = () => {
    if (confirm("Reset all click analytics? This cannot be undone.")) {
      resetAnalytics();
      refresh();
    }
  };

  // Sort links by click count (most clicked first)
  const sortedLinks = [...links].sort((a, b) => {
    const aClicks = analytics[a.id]?.clicks ?? 0;
    const bClicks = analytics[b.id]?.clicks ?? 0;
    return bClicks - aClicks;
  });

  // Find max clicks for relative bar width
  const maxClicks = Math.max(
    1,
    ...links.map((l) => analytics[l.id]?.clicks ?? 0)
  );

  if (links.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[var(--lf-accent)]" />
          <h3 className="text-sm font-semibold text-[var(--lf-text)]">
            Click Analytics
          </h3>
        </div>
        {totalClicks > 0 && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <Trash2 className="w-3 h-3" />
            Reset
          </Button>
        )}
      </div>

      {/* Total clicks summary */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--lf-accent)]/10 border border-[var(--lf-accent)]/20">
        <div className="w-9 h-9 rounded-lg bg-[var(--lf-accent)]/20 flex items-center justify-center">
          <MousePointerClick className="w-4 h-4 text-[var(--lf-accent)]" />
        </div>
        <div>
          <p className="text-lg font-bold text-[var(--lf-text)] leading-tight">
            {totalClicks.toLocaleString()}
          </p>
          <p className="text-[10px] text-[var(--lf-muted)] uppercase tracking-wider">
            Total Clicks
          </p>
        </div>
      </div>

      {/* Per-link click stats */}
      <div className="space-y-1.5">
        {sortedLinks.map((link) => {
          const data = analytics[link.id];
          const clicks = data?.clicks ?? 0;
          const barWidth = maxClicks > 0 ? (clicks / maxClicks) * 100 : 0;

          return (
            <div
              key={link.id}
              className="group relative px-3 py-2.5 rounded-lg bg-[var(--lf-card-bg)] border border-[var(--lf-border)] overflow-hidden"
            >
              {/* Background bar */}
              <div
                className="absolute inset-y-0 left-0 bg-[var(--lf-accent)]/8 transition-all duration-500"
                style={{ width: `${barWidth}%` }}
              />

              {/* Content */}
              <div className="relative flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[var(--lf-text)] truncate flex-1">
                  {link.title || "Untitled"}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {clicks > 0 && barWidth === 100 && (
                    <TrendingUp className="w-3 h-3 text-[var(--lf-accent)]" />
                  )}
                  <span
                    className={cn(
                      "text-xs font-bold tabular-nums",
                      clicks > 0
                        ? "text-[var(--lf-accent)]"
                        : "text-[var(--lf-muted)]"
                    )}
                  >
                    {clicks}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-[var(--lf-muted)] text-center leading-relaxed">
        Privacy-first · Data stored locally · Auto-refreshes
      </p>
    </div>
  );
}
