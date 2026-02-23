"use client";

import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Toggle } from "@/components/ui/Toggle";
import { Search, Settings2 } from "lucide-react";

export function SeoEditor() {
  const seo = useStore((s) => s.config.seo);
  const settings = useStore((s) => s.config.settings);
  const updateSeo = useStore((s) => s.updateSeo);
  const updateSettings = useStore((s) => s.updateSettings);

  return (
    <div className="space-y-6">
      {/* ── SEO Section ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-4 h-4 text-[var(--lf-accent)]" />
          <h3 className="text-sm font-semibold text-[var(--lf-text)]">SEO</h3>
        </div>

        <div className="space-y-4">
          <Input
            label="Page Title"
            value={seo.title}
            onChange={(e) => updateSeo({ title: e.target.value })}
            placeholder="My Links — Your Name"
            hint="Shown in browser tab and search results"
          />

          <Textarea
            label="Meta Description"
            value={seo.description}
            onChange={(e) => updateSeo({ description: e.target.value })}
            placeholder="All my important links in one place."
            maxLength={200}
            hint={`${seo.description.length}/200 — Keep it concise for search results`}
          />
        </div>
      </div>

      {/* ── Settings Section ── */}
      <div className="border-t border-[var(--lf-border)] pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="w-4 h-4 text-[var(--lf-accent)]" />
          <h3 className="text-sm font-semibold text-[var(--lf-text)]">Settings</h3>
        </div>

        <div className="space-y-4">
          <Toggle
            label="Show Footer"
            checked={settings.showFooter}
            onCheckedChange={(v) => updateSettings({ showFooter: v })}
          />

          {settings.showFooter && (
            <Input
              label="Footer Text"
              value={settings.footerText}
              onChange={(e) => updateSettings({ footerText: e.target.value })}
              placeholder="Powered by VoltBio"
            />
          )}

          <Input
            label="Analytics ID"
            value={settings.analyticsId || ""}
            onChange={(e) => updateSettings({ analyticsId: e.target.value })}
            placeholder="Optional: Umami or Plausible ID"
            hint="Add a privacy-friendly analytics tracker"
          />

          <div>
            <p className="text-xs font-medium text-[var(--lf-muted)] mb-2 uppercase tracking-wider">
              Language
            </p>
            <div className="flex gap-1 p-1 rounded-xl bg-[var(--lf-card-bg)] border border-[var(--lf-border)]">
              {(["en", "id"] as const).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => updateSettings({ locale: loc })}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                    settings.locale === loc
                      ? "bg-[var(--lf-accent)] text-white shadow-sm"
                      : "text-[var(--lf-muted)] hover:text-[var(--lf-text)]"
                  }`}
                  aria-pressed={settings.locale === loc}
                >
                  {loc === "en" ? "English" : "Bahasa Indonesia"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
