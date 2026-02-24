"use client";

import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Toggle } from "@/components/ui/Toggle";
import { Search, Settings2, MessageCircle, Twitter, Globe, Smartphone } from "lucide-react";

/* ── Live Social Preview Cards ── */
function WhatsAppPreview({ title, description, url }: { title: string; description: string; url: string }) {
  const displayUrl = url || "voltbio.app";
  return (
    <div className="rounded-xl overflow-hidden border border-[var(--lf-border)] bg-[#075e54]/10">
      <div className="px-3 py-2 flex items-center gap-2 border-b border-[var(--lf-border)]">
        <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
        <span className="text-[10px] font-semibold text-[var(--lf-muted)] uppercase tracking-wider">WhatsApp Preview</span>
      </div>
      <div className="p-3">
        {/* Chat bubble */}
        <div className="bg-[#dcf8c6]/20 rounded-lg p-2.5 max-w-[260px] ml-auto border border-[#25D366]/20">
          {/* OG card inside bubble */}
          <div className="rounded-lg overflow-hidden border border-[var(--lf-border)] bg-[var(--lf-card-bg)] mb-1.5">
            <div className="w-full h-20 bg-gradient-to-br from-[var(--lf-accent)]/30 to-[var(--lf-accent)]/5 flex items-center justify-center">
              <Globe className="w-8 h-8 opacity-30 text-[var(--lf-accent)]" />
            </div>
            <div className="p-2">
              <p className="text-[10px] text-[var(--lf-muted)] truncate">{displayUrl}</p>
              <p className="text-[11px] font-semibold text-[var(--lf-text)] truncate mt-0.5">
                {title || "Page Title"}
              </p>
              <p className="text-[10px] text-[var(--lf-muted)] line-clamp-2 mt-0.5 leading-relaxed">
                {description || "Meta description will appear here..."}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-blue-400 truncate">🔗 {displayUrl}</p>
          <p className="text-[9px] text-[var(--lf-muted)] text-right mt-1">12:00</p>
        </div>
      </div>
    </div>
  );
}

function TwitterPreview({ title, description, url }: { title: string; description: string; url: string }) {
  const displayUrl = url || "voltbio.app";
  return (
    <div className="rounded-xl overflow-hidden border border-[var(--lf-border)] bg-[var(--lf-card-bg)]">
      <div className="px-3 py-2 flex items-center gap-2 border-b border-[var(--lf-border)]">
        <Twitter className="w-3.5 h-3.5 text-[#1DA1F2]" />
        <span className="text-[10px] font-semibold text-[var(--lf-muted)] uppercase tracking-wider">Twitter / X Preview</span>
      </div>
      <div className="p-3">
        <div className="rounded-xl overflow-hidden border border-[var(--lf-border)]">
          {/* OG Image placeholder */}
          <div className="w-full h-28 bg-gradient-to-br from-[var(--lf-accent)]/20 to-[var(--lf-accent)]/5 flex items-center justify-center">
            <Globe className="w-10 h-10 opacity-20 text-[var(--lf-accent)]" />
          </div>
          <div className="p-2.5 bg-[var(--lf-bg)]">
            <p className="text-[10px] text-[var(--lf-muted)]">{displayUrl}</p>
            <p className="text-[12px] font-semibold text-[var(--lf-text)] truncate mt-0.5">
              {title || "Page Title"}
            </p>
            <p className="text-[11px] text-[var(--lf-muted)] line-clamp-2 leading-relaxed mt-0.5">
              {description || "Meta description will appear here..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Google Search Preview ── */
function GooglePreview({ title, description, url }: { title: string; description: string; url: string }) {
  const displayUrl = url || "voltbio.app";
  return (
    <div className="rounded-xl overflow-hidden border border-[var(--lf-border)] bg-[var(--lf-card-bg)]">
      <div className="px-3 py-2 flex items-center gap-2 border-b border-[var(--lf-border)]">
        <Search className="w-3.5 h-3.5 text-[#4285F4]" />
        <span className="text-[10px] font-semibold text-[var(--lf-muted)] uppercase tracking-wider">Google Preview</span>
      </div>
      <div className="p-3">
        <p className="text-[11px] text-[var(--lf-muted)]">{displayUrl}</p>
        <p className="text-[14px] text-[#8ab4f8] hover:underline cursor-pointer truncate mt-0.5">
          {title || "Page Title"}
        </p>
        <p className="text-[11px] text-[var(--lf-muted)] line-clamp-2 leading-relaxed mt-1">
          {description || "Meta description will appear here when shared on search engines..."}
        </p>
      </div>
    </div>
  );
}

export function SeoEditor() {
  const seo = useStore((s) => s.config.seo);
  const profile = useStore((s) => s.config.profile);
  const settings = useStore((s) => s.config.settings);
  const updateSeo = useStore((s) => s.updateSeo);
  const updateSettings = useStore((s) => s.updateSettings);
  const fab = useStore((s) => s.config.floatingButton) || { enabled: false, icon: "whatsapp" as const, url: "", label: "" };
  const updateFab = useStore((s) => s.updateFloatingButton);

  const previewUrl = `${profile.username}.voltbio.app`;

  return (
    <div className="space-y-6">
      {/* ── SEO Inputs ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-4 h-4 text-[var(--lf-accent)]" />
          <h3 className="text-sm font-semibold text-[var(--lf-text)]">SEO & Social</h3>
        </div>

        <div className="space-y-4">
          <Input
            label="Page Title"
            value={seo.title}
            onChange={(e) => updateSeo({ title: e.target.value })}
            placeholder="My Links — Your Name"
            hint="Shown in browser tab, search results & social cards"
          />

          <Textarea
            label="Meta Description"
            value={seo.description}
            onChange={(e) => updateSeo({ description: e.target.value })}
            placeholder="All my important links in one place."
            maxLength={200}
            hint={`${seo.description.length}/200 — Keep it concise`}
          />

          <Input
            label="OG Image URL"
            value={seo.ogImage || ""}
            onChange={(e) => updateSeo({ ogImage: e.target.value })}
            placeholder="https://yourdomain.com/og-image.png"
            hint="1200×630px recommended for social previews"
          />
        </div>
      </div>

      {/* ── Live Social Preview ── */}
      <div className="border-t border-[var(--lf-border)] pt-6">
        <p className="text-xs font-semibold text-[var(--lf-text)] mb-3">
          📱 Live Social Preview
        </p>
        <p className="text-[10px] text-[var(--lf-muted)] mb-4">
          This is how your page will look when shared on social media
        </p>
        <div className="space-y-3">
          <WhatsAppPreview title={seo.title} description={seo.description} url={previewUrl} />
          <TwitterPreview title={seo.title} description={seo.description} url={previewUrl} />
          <GooglePreview title={seo.title} description={seo.description} url={previewUrl} />
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

        {/* ── Floating Action Button ── */}
        <div className="space-y-3 p-3.5 rounded-xl bg-[var(--lf-bg)] border border-[var(--lf-border)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[var(--lf-text)] flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" />
              Floating Contact Button
            </p>
            <Toggle
              checked={fab.enabled}
              onCheckedChange={(v) => updateFab({ enabled: v })}
              id="fab-toggle"
            />
          </div>

          {fab.enabled && (
            <div className="space-y-3 pt-1">
              {/* Icon type */}
              <div>
                <label className="text-[10px] text-[var(--lf-muted)] uppercase tracking-wider font-medium mb-1 block">
                  Button Type
                </label>
                <div className="flex gap-1.5">
                  {([
                    { key: "whatsapp", label: "💬 WhatsApp" },
                    { key: "email", label: "✉️ Email" },
                    { key: "phone", label: "📞 Phone" },
                    { key: "link", label: "🔗 Link" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => updateFab({ icon: opt.key })}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                        fab.icon === opt.key
                          ? "bg-[var(--lf-accent)] text-white border-transparent"
                          : "bg-[var(--lf-card-bg)] text-[var(--lf-text)] border-[var(--lf-border)] hover:border-[var(--lf-accent)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* URL / contact */}
              <Input
                label={fab.icon === "whatsapp" ? "WhatsApp Number" : fab.icon === "email" ? "Email Address" : fab.icon === "phone" ? "Phone Number" : "URL"}
                value={fab.url}
                onChange={(e) => updateFab({ url: e.target.value })}
                placeholder={
                  fab.icon === "whatsapp" ? "628123456789"
                    : fab.icon === "email" ? "hello@example.com"
                    : fab.icon === "phone" ? "+628123456789"
                    : "https://example.com"
                }
              />

              {/* Label */}
              <Input
                label="Tooltip Label"
                value={fab.label || ""}
                onChange={(e) => updateFab({ label: e.target.value })}
                placeholder="Chat with us!"
              />
            </div>
          )}
        </div>

        {/* ── Search Bar ── */}
        <div className="space-y-3 p-3.5 rounded-xl bg-[var(--lf-bg)] border border-[var(--lf-border)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[var(--lf-text)] flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              Search Bar
            </p>
            <Toggle
              checked={!!settings.enableSearch}
              onCheckedChange={(v) => updateSettings({ enableSearch: v })}
              id="search-toggle"
            />
          </div>
          {settings.enableSearch && (
            <p className="text-[10px] text-[var(--lf-muted)]">
              Visitors can filter links by typing in a search bar above your link list.
            </p>
          )}
        </div>

        {/* ── PWA Install & Offline ── */}
        <div className="space-y-3 p-3.5 rounded-xl bg-[var(--lf-bg)] border border-[var(--lf-border)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[var(--lf-text)] flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              App Install (PWA)
            </p>
            <Toggle
              checked={!!settings.pwaEnabled}
              onCheckedChange={(v) => updateSettings({ pwaEnabled: v })}
              id="pwa-toggle"
            />
          </div>

          {settings.pwaEnabled && (
            <div className="space-y-2 pt-1">
              <Input
                label="App Short Name (max 12 chars)"
                value={settings.pwaShortName || ""}
                onChange={(e) => updateSettings({ pwaShortName: e.target.value.slice(0, 12) })}
                placeholder={profile.name?.slice(0, 12) || "VoltBio"}
              />
              <p className="text-[10px] text-[var(--lf-muted)]">
                Exported site can be installed as an app on mobile devices. Works offline!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
