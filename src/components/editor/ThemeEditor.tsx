"use client";

import { useStore } from "@/lib/store";
import { themePresets } from "@/lib/themes";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { Palette, Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ThemeConfig } from "@/types";

const modeOptions: { value: ThemeConfig["mode"]; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <Sun className="w-3.5 h-3.5" /> },
  { value: "dark", label: "Dark", icon: <Moon className="w-3.5 h-3.5" /> },
  { value: "system", label: "System", icon: <Monitor className="w-3.5 h-3.5" /> },
];

const buttonStyles: { value: ThemeConfig["buttonStyle"]; label: string }[] = [
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill" },
  { value: "square", label: "Square" },
  { value: "outline", label: "Outline" },
];

const animations: { value: ThemeConfig["animation"]; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fade-up", label: "Fade Up" },
  { value: "slide-in", label: "Slide In" },
  { value: "scale", label: "Scale" },
];

export function ThemeEditor() {
  const theme = useStore((s) => s.config.theme);
  const setTheme = useStore((s) => s.setTheme);
  const applyPreset = useStore((s) => s.applyPreset);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-1">
        <Palette className="w-4 h-4 text-[var(--lf-accent)]" />
        <h3 className="text-sm font-semibold text-[var(--lf-text)]">Theme</h3>
      </div>

      {/* ── Mode Toggle ── */}
      <div>
        <p className="text-xs font-medium text-[var(--lf-muted)] mb-2 uppercase tracking-wider">
          Mode
        </p>
        <div className="flex gap-1 p-1 rounded-xl bg-[var(--lf-card-bg)] border border-[var(--lf-border)]">
          {modeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme({ mode: opt.value })}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer",
                theme.mode === opt.value
                  ? "bg-[var(--lf-accent)] text-white shadow-sm"
                  : "text-[var(--lf-muted)] hover:text-[var(--lf-text)]"
              )}
              aria-pressed={theme.mode === opt.value}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Presets Grid ── */}
      <div>
        <p className="text-xs font-medium text-[var(--lf-muted)] mb-2 uppercase tracking-wider">
          Preset Themes
        </p>
        <div className="grid grid-cols-2 gap-2">
          {themePresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className={cn(
                "relative rounded-xl p-3 text-left transition-all duration-200 cursor-pointer",
                "border-2",
                theme.preset === preset.id
                  ? "border-[var(--lf-accent)] shadow-md shadow-[var(--lf-accent)]/10"
                  : "border-[var(--lf-border)] hover:border-[var(--lf-accent)]/40"
              )}
              aria-pressed={theme.preset === preset.id}
              aria-label={`Select ${preset.name} theme`}
            >
              <div
                className="w-full h-8 rounded-lg mb-2"
                style={{ background: preset.preview }}
              />
              <p className="text-xs font-medium text-[var(--lf-text)]">
                {preset.name}
              </p>
              <div className="flex gap-1 mt-1.5">
                {Object.values(preset.colors).slice(0, 4).map((c, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full border border-black/10"
                    style={{ background: c }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Custom Colors ── */}
      <div>
        <p className="text-xs font-medium text-[var(--lf-muted)] mb-3 uppercase tracking-wider">
          Custom Colors
        </p>
        <div className="space-y-3">
          <ColorPicker
            label="Background"
            color={theme.colors.background}
            onChange={(c) =>
              setTheme({ colors: { ...theme.colors, background: c } })
            }
          />
          <ColorPicker
            label="Card"
            color={theme.colors.cardBackground}
            onChange={(c) =>
              setTheme({ colors: { ...theme.colors, cardBackground: c } })
            }
          />
          <ColorPicker
            label="Text"
            color={theme.colors.text}
            onChange={(c) =>
              setTheme({ colors: { ...theme.colors, text: c } })
            }
          />
          <ColorPicker
            label="Accent"
            color={theme.colors.accent}
            onChange={(c) =>
              setTheme({ colors: { ...theme.colors, accent: c } })
            }
          />
          <ColorPicker
            label="Link Hover"
            color={theme.colors.linkHover}
            onChange={(c) =>
              setTheme({ colors: { ...theme.colors, linkHover: c } })
            }
          />
        </div>
      </div>

      {/* ── Button Style ── */}
      <div>
        <p className="text-xs font-medium text-[var(--lf-muted)] mb-2 uppercase tracking-wider">
          Button Style
        </p>
        <div className="flex gap-1 p-1 rounded-xl bg-[var(--lf-card-bg)] border border-[var(--lf-border)]">
          {buttonStyles.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme({ buttonStyle: opt.value })}
              className={cn(
                "flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer",
                theme.buttonStyle === opt.value
                  ? "bg-[var(--lf-accent)] text-white shadow-sm"
                  : "text-[var(--lf-muted)] hover:text-[var(--lf-text)]"
              )}
              aria-pressed={theme.buttonStyle === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Animation ── */}
      <div>
        <p className="text-xs font-medium text-[var(--lf-muted)] mb-2 uppercase tracking-wider">
          Animation
        </p>
        <div className="flex gap-1 p-1 rounded-xl bg-[var(--lf-card-bg)] border border-[var(--lf-border)]">
          {animations.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme({ animation: opt.value })}
              className={cn(
                "flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer",
                theme.animation === opt.value
                  ? "bg-[var(--lf-accent)] text-white shadow-sm"
                  : "text-[var(--lf-muted)] hover:text-[var(--lf-text)]"
              )}
              aria-pressed={theme.animation === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
