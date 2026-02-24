"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { loadGoogleFont, getFontFallback } from "@/lib/fonts";
import { getPattern, gradientKeyframes } from "@/lib/patterns";
import type { ThemeColors } from "@/types";

/**
 * Maps theme color keys → CSS custom property names on `:root`.
 */
const CSS_VAR_MAP: Record<keyof ThemeColors, string> = {
  background: "--lf-bg",
  cardBackground: "--lf-card-bg",
  text: "--lf-text",
  accent: "--lf-accent",
  linkHover: "--lf-link-hover",
};

/* ── Color utilities for Light mode override ── */

function hexToRgb(hex: string): [number, number, number] | null {
  const cleaned = hex.replace(/^#/, "");
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    return [r, g, b];
  }
  if (cleaned.length >= 6) {
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    return [r, g, b];
  }
  return null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, "0")).join("")}`;
}

/** Lighten a hex color toward white. lightness 0 = original, 1 = white */
function lightenColor(color: string, lightness: number): string {
  // Handle rgba/transparent
  if (color.startsWith("rgba") || color === "transparent") return "#ffffff";
  const rgb = hexToRgb(color);
  if (!rgb) return "#ffffff";
  const [r, g, b] = rgb;
  return rgbToHex(
    r + (255 - r) * lightness,
    g + (255 - g) * lightness,
    b + (255 - b) * lightness
  );
}

/** Darken a hex color toward black. darkness 0 = original, 1 = black */
function darkenColor(color: string, darkness: number): string {
  if (color.startsWith("rgba") || color === "transparent") return "#1a1a1a";
  const rgb = hexToRgb(color);
  if (!rgb) return "#1a1a1a";
  const [r, g, b] = rgb;
  return rgbToHex(r * (1 - darkness), g * (1 - darkness), b * (1 - darkness));
}

/** Create rgba string with custom opacity from hex */
function adjustOpacity(color: string, opacity: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return `rgba(128,128,128,${opacity})`;
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity})`;
}

/**
 * Hook: syncs Zustand theme state → CSS custom properties in real-time.
 *
 * Handles: mode, colors, font, and background pattern.
 */
export function useThemeBridge() {
  const theme = useStore((s) => s.config.theme);
  const prevColorsRef = useRef<ThemeColors | null>(null);
  const prevModeRef = useRef<string | null>(null);
  const prevFontRef = useRef<string | null>(null);
  const prevPatternRef = useRef<string | null>(null);

  // Inject gradient keyframes once
  useEffect(() => {
    if (document.getElementById("lf-pattern-keyframes")) return;
    const style = document.createElement("style");
    style.id = "lf-pattern-keyframes";
    style.textContent = gradientKeyframes;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    // ── Apply mode (data-theme attribute) ──
    if (theme.mode !== prevModeRef.current) {
      if (theme.mode === "system") {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        root.setAttribute("data-theme", prefersDark ? "dark" : "light");
      } else {
        root.setAttribute("data-theme", theme.mode);
      }
      prevModeRef.current = theme.mode;
    }

    // ── Apply colors (CSS custom properties) ──
    const colors = theme.colors;
    const isLightForced = theme.mode === "light";
    const isSystemLight =
      theme.mode === "system" &&
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldLighten = isLightForced || isSystemLight;

    if (colors !== prevColorsRef.current || theme.mode !== prevModeRef.current) {
      for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
        let value = colors[key as keyof ThemeColors];
        if (value) {
          // Force light background/card when in Light mode
          if (shouldLighten && key === "background") {
            value = lightenColor(value, 0.95);
          } else if (shouldLighten && key === "cardBackground") {
            value = lightenColor(value, 0.98);
          } else if (shouldLighten && key === "text") {
            value = darkenColor(value, 0.1);
          }
          root.style.setProperty(cssVar, value);
        }
      }
      // Also set a muted color
      const mutedBase = shouldLighten ? "#6b7280" : adjustOpacity(colors.text, 0.55);
      root.style.setProperty("--lf-muted", mutedBase);
      root.style.setProperty("--lf-border", shouldLighten ? "#e5e7eb" : adjustOpacity(colors.text, 0.12));
      prevColorsRef.current = colors;
    }

    // ── Apply font ──
    if (theme.font && theme.font !== prevFontRef.current) {
      loadGoogleFont(theme.font);
      const fontStack = getFontFallback(theme.font);
      root.style.setProperty("--lf-font", fontStack);
      document.body.style.fontFamily = fontStack;
      prevFontRef.current = theme.font;
    }

    // ── Apply background pattern ──
    const patternKey = `${theme.backgroundPattern || "none"}-${colors.background}-${colors.accent}`;
    if (patternKey !== prevPatternRef.current) {
      const pattern = getPattern(theme.backgroundPattern || "none");
      const bgCSS = pattern.getCSS(colors.background, colors.accent);
      const extraCSS = pattern.getExtra(colors.background, colors.accent);

      // Apply to body via inline style
      document.body.style.background = bgCSS;

      // Parse and apply extra CSS (background-size, animation)
      if (extraCSS) {
        const pairs = extraCSS.split(";").filter(Boolean);
        for (const pair of pairs) {
          const colonIdx = pair.indexOf(":");
          if (colonIdx === -1) continue;
          const prop = pair.slice(0, colonIdx).trim();
          const val = pair.slice(colonIdx + 1).trim();
          document.body.style.setProperty(prop, val);
        }
      } else {
        // Clear pattern-related styles when switching to "none"
        document.body.style.backgroundSize = "";
        document.body.style.animation = "";
      }

      prevPatternRef.current = patternKey;
    }
  }, [theme]);

  // ── Listen for system theme changes when mode is "system" ──
  useEffect(() => {
    if (theme.mode !== "system") return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.setAttribute(
        "data-theme",
        e.matches ? "dark" : "light"
      );
    };

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme.mode]);
}
