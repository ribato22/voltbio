"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/lib/store";
import { getAnalytics, getTotalClicks, resetAnalytics } from "@/lib/analytics";
import type { AnalyticsStore } from "@/lib/analytics";
import { BarChart3, MousePointerClick, Trash2, TrendingUp, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Analytics Dashboard — Privacy-First Click Statistics
 *
 * Shows click counts per link using localStorage-only data.
 * Features: Top 5 bar chart, 7-day activity heatmap, per-link stats.
 * All visualizations are pure HTML/CSS — no charting library.
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
    const interval = setInterval(refresh, 3000);
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

  // Top 5 links for bar chart
  const top5 = sortedLinks.slice(0, 5).filter((l) => (analytics[l.id]?.clicks ?? 0) > 0);
  const maxClicks = Math.max(1, ...links.map((l) => analytics[l.id]?.clicks ?? 0));

  // Build 7-day activity data from lastClick timestamps
  const dayActivity = (() => {
    const days: { label: string; clicks: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString("en", { weekday: "short" });
      // Count clicks that have lastClick on this date
      let count = 0;
      for (const data of Object.values(analytics)) {
        if (data.lastClick?.slice(0, 10) === dayStr) {
          count += data.clicks > 0 ? 1 : 0; // Activity indicator per link
        }
      }
      days.push({ label: dayLabel, clicks: count });
    }
    return days;
  })();

  const maxDayActivity = Math.max(1, ...dayActivity.map((d) => d.clicks));

  if (links.length === 0) return null;

  return (
    <div className="space-y-4">
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

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl bg-[var(--lf-accent)]/10 border border-[var(--lf-accent)]/20">
          <div className="flex items-center gap-2 mb-1">
            <MousePointerClick className="w-3.5 h-3.5 text-[var(--lf-accent)]" />
            <span className="text-[10px] text-[var(--lf-muted)] uppercase tracking-wider">
              Total Clicks
            </span>
          </div>
          <p className="text-xl font-bold text-[var(--lf-text)] tabular-nums">
            {totalClicks.toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--lf-card-bg)] border border-[var(--lf-border)]">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--lf-accent)]" />
            <span className="text-[10px] text-[var(--lf-muted)] uppercase tracking-wider">
              Active Links
            </span>
          </div>
          <p className="text-xl font-bold text-[var(--lf-text)] tabular-nums">
            {Object.keys(analytics).filter((id) => (analytics[id]?.clicks ?? 0) > 0).length}
          </p>
        </div>
      </div>

      {/* ── Top 5 Links Bar Chart (Pure CSS) ── */}
      {top5.length > 0 && (
        <div className="p-3 rounded-xl bg-[var(--lf-card-bg)] border border-[var(--lf-border)]">
          <p className="text-[10px] text-[var(--lf-muted)] uppercase tracking-wider mb-3 font-medium">
            🏆 Top Links
          </p>
          <div className="space-y-2">
            {top5.map((link, idx) => {
              const clicks = analytics[link.id]?.clicks ?? 0;
              const pct = (clicks / maxClicks) * 100;
              const barColors = [
                "bg-[var(--lf-accent)]",
                "bg-[var(--lf-accent)]/80",
                "bg-[var(--lf-accent)]/60",
                "bg-[var(--lf-accent)]/40",
                "bg-[var(--lf-accent)]/25",
              ];
              return (
                <div key={link.id} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[var(--lf-muted)] w-4 shrink-0">
                    {idx + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] font-medium text-[var(--lf-text)] truncate">
                        {link.title || "Untitled"}
                      </span>
                      <span className="text-[10px] font-bold text-[var(--lf-accent)] tabular-nums ml-2 shrink-0">
                        {clicks}
                      </span>
                    </div>
                    {/* Bar */}
                    <div className="w-full h-1.5 rounded-full bg-[var(--lf-border)] overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700", barColors[idx] || barColors[4])}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 7-Day Activity Heatmap (Pure CSS) ── */}
      <div className="p-3 rounded-xl bg-[var(--lf-card-bg)] border border-[var(--lf-border)]">
        <div className="flex items-center gap-1.5 mb-3">
          <Activity className="w-3 h-3 text-[var(--lf-accent)]" />
          <p className="text-[10px] text-[var(--lf-muted)] uppercase tracking-wider font-medium">
            7-Day Activity
          </p>
        </div>
        <div className="flex items-end gap-1 h-12">
          {dayActivity.map((day, i) => {
            const heightPct = day.clicks > 0 ? Math.max(15, (day.clicks / maxDayActivity) * 100) : 5;
            const isToday = i === 6;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: "32px" }}>
                  <div
                    className={cn(
                      "w-full max-w-[20px] rounded-sm transition-all duration-500",
                      day.clicks > 0
                        ? isToday
                          ? "bg-[var(--lf-accent)]"
                          : "bg-[var(--lf-accent)]/50"
                        : "bg-[var(--lf-border)]"
                    )}
                    style={{ height: `${heightPct}%` }}
                    title={`${day.label}: ${day.clicks} active link(s)`}
                  />
                </div>
                <span className={cn(
                  "text-[8px] tabular-nums",
                  isToday ? "text-[var(--lf-accent)] font-bold" : "text-[var(--lf-muted)]"
                )}>
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Per-Link Click Stats ── */}
      <div className="space-y-1.5">
        <p className="text-[10px] text-[var(--lf-muted)] uppercase tracking-wider font-medium px-1">
          All Links
        </p>
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
