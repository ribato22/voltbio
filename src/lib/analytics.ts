/* ============================================================
   VoltBio — Local-Only Click Analytics
   
   Privacy-first link click tracking using localStorage.
   No backend, no cookies, no personal data collection.
   ============================================================ */

const STORAGE_KEY = "voltbio-analytics";

export interface LinkClickData {
  /** Total click count */
  clicks: number;
  /** ISO timestamp of first click */
  firstClick: string;
  /** ISO timestamp of most recent click */
  lastClick: string;
}

export type AnalyticsStore = Record<string, LinkClickData>;

/**
 * Get all analytics data from localStorage.
 */
export function getAnalytics(): AnalyticsStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Record a click for a specific link.
 * @param linkId - The unique ID of the link
 */
export function trackClick(linkId: string): void {
  if (typeof window === "undefined") return;

  const analytics = getAnalytics();
  const now = new Date().toISOString();
  const existing = analytics[linkId];

  analytics[linkId] = {
    clicks: (existing?.clicks ?? 0) + 1,
    firstClick: existing?.firstClick ?? now,
    lastClick: now,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(analytics));
  } catch {
    // localStorage full — silently fail, analytics are non-critical
  }
}

/**
 * Get click data for a specific link.
 */
export function getClickData(linkId: string): LinkClickData | null {
  const analytics = getAnalytics();
  return analytics[linkId] ?? null;
}

/**
 * Get total clicks across all links.
 */
export function getTotalClicks(): number {
  const analytics = getAnalytics();
  return Object.values(analytics).reduce((sum, d) => sum + d.clicks, 0);
}

/**
 * Reset all analytics data.
 */
export function resetAnalytics(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
