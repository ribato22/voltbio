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
    if (colors !== prevColorsRef.current) {
      for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
        const value = colors[key as keyof ThemeColors];
        if (value) {
          root.style.setProperty(cssVar, value);
        }
      }
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
