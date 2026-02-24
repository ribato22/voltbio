"use client";

import { motion } from "framer-motion";
import { MapPin, Sparkles, UserPlus, Lock, MessageCircle, ChevronDown } from "lucide-react";
import { useState as useReactState, useEffect, useSyncExternalStore } from "react";
import { useStore } from "@/lib/store";
import { trackClick } from "@/lib/analytics";
import { SocialIcon } from "@/components/preview/SocialIcon";
import { detectSocialIcon, sanitizeUrl, getAvatarFallback, cn, detectPdfUrl } from "@/lib/utils";
import { downloadVCard } from "@/lib/vcard";
import { detectEmbed, getSpotifyHeight } from "@/lib/embed";
import { decryptUrl } from "@/lib/crypto";
import { getCardEffectStyles } from "@/lib/theme-effects";
import { Lightbox } from "@/components/preview/Lightbox";
import type { LinkItem, ThemeConfig, PortfolioImage } from "@/types";

/* ─────────────────────────────────────────────
   Action Card Component (WhatsApp Template Form)
   ───────────────────────────────────────────── */

function ActionCard({ link, theme, buttonRadius, isOutline }: {
  link: LinkItem;
  theme: ThemeConfig;
  buttonRadius: string;
  isOutline: boolean;
}) {
  const [open, setOpen] = useReactState(false);
  const [values, setValues] = useReactState<Record<string, string>>({});
  const cfg = link.actionConfig!;

  const handleSend = () => {
    let msg = cfg.messageTemplate;
    cfg.fields.forEach((f) => {
      const val = values[f.id] || "";
      msg = msg.replaceAll(`{${f.label}}`, val).replaceAll(`{${f.label.toLowerCase()}}`, val);
    });
    const num = cfg.whatsappNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } },
      }}
      className="action-card link-card w-full overflow-hidden"
      style={{
        background: isOutline ? "transparent" : theme.colors.cardBackground,
        color: theme.colors.text,
        borderRadius: open ? "1.25rem" : buttonRadius,
        border: isOutline ? `1.5px solid ${theme.colors.accent}` : `1px solid ${theme.colors.cardBackground}`,
        transition: "border-radius 0.2s ease",
      }}
    >
      {/* Header Button */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-3 w-full px-5 py-3.5 text-sm font-medium cursor-pointer"
      >
        <MessageCircle className="w-4 h-4 link-icon" style={{ color: theme.colors.accent }} />
        <span className="link-title flex-1 text-left">{link.title}</span>
        <ChevronDown
          className="w-4 h-4 transition-transform duration-200"
          style={{ color: theme.colors.accent, transform: open ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>

      {/* Expandable Form */}
      {open && (
        <div className="px-5 pb-5 pt-3 space-y-3" style={{ borderTop: `1px solid ${theme.colors.accent}20` }}>
          {cfg.fields.map((field) => (
            <div key={field.id}>
              <label className="text-[11px] font-medium opacity-70 mb-1.5 block">{field.label}</label>
              {field.type === "date" ? (
                <input
                  type="date"
                  value={values[field.id] || ""}
                  onChange={(e) => setValues((v) => ({ ...v, [field.id]: e.target.value }))}
                  className="w-full text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2"
                  style={{ background: `${theme.colors.cardBackground}`, color: theme.colors.text, border: `1px solid ${theme.colors.accent}30`, boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)" }}
                />
              ) : field.type === "select" && field.options?.length ? (
                <select
                  value={values[field.id] || ""}
                  onChange={(e) => setValues((v) => ({ ...v, [field.id]: e.target.value }))}
                  className="w-full text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 cursor-pointer appearance-none"
                  style={{ background: `${theme.colors.cardBackground}`, color: theme.colors.text, border: `1px solid ${theme.colors.accent}30`, boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)" }}
                >
                  <option value="">{field.placeholder || "Select..."}</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={values[field.id] || ""}
                  onChange={(e) => setValues((v) => ({ ...v, [field.id]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2"
                  style={{ background: `${theme.colors.cardBackground}`, color: theme.colors.text, border: `1px solid ${theme.colors.accent}30`, boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)" }}
                />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleSend}
            className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all hover:brightness-110 hover:shadow-lg mt-1"
            style={{ background: "#25D366" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Send via WhatsApp
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Stagger Animation Variants
   ───────────────────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const avatarVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 18 },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1.0] as const },
  },
};

const linkCardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1.0] as const },
  },
};

/**
 * The bio page preview — rendered both in the editor split-pane
 * and on the public /preview page.
 *
 * Features:
 * - Spring-animated avatar entrance
 * - Staggered fade-up for name, bio, links
 * - whileHover scale + glow shadow on link cards
 * - whileTap press-down feedback
 */

/* ──────────────────────────────────────────────────────────
 * CountdownTimer — standalone component (fixes Rules of Hooks)
 * ────────────────────────────────────────────────────────── */
interface CountdownTimerProps {
  targetDate: string;
  timerLabel: string;
  timerStyle: "minimal" | "card" | "flip";
  title: string;
  accentColor: string;
  textColor: string;
}

function CountdownTimer({ targetDate, timerLabel, timerStyle, title, accentColor, textColor }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useReactState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const target = new Date(targetDate).getTime();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  const digitBoxStyle: React.CSSProperties = timerStyle === "card"
    ? { background: `${accentColor}15`, borderRadius: "0.75rem", padding: "0.75rem 0.5rem", minWidth: "3.5rem", border: `1.5px solid ${accentColor}25`, textAlign: "center" }
    : timerStyle === "flip"
    ? { background: accentColor, borderRadius: "0.5rem", padding: "0.75rem 0.5rem", minWidth: "3.5rem", textAlign: "center" }
    : { padding: "0.5rem", textAlign: "center" as const };

  const digitColor = timerStyle === "flip" ? "#fff" : accentColor;
  const labelColor = timerStyle === "flip" ? "#fff" : textColor;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 text-center"
      style={{
        background: timerStyle === "flip"
          ? `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`
          : `linear-gradient(135deg, ${accentColor}10, transparent)`,
        border: `1.5px solid ${accentColor}25`,
      }}
    >
      <p className="text-xs font-semibold mb-3 opacity-70" style={{ color: textColor }}>
        {timerLabel}
      </p>
      {title && (
        <p className="text-base font-bold mb-4" style={{ color: textColor }}>
          {title}
        </p>
      )}
      {timeLeft.expired ? (
        <div className="py-4">
          <p className="text-lg font-bold" style={{ color: accentColor }}>
            🎉 Time&apos;s Up!
          </p>
        </div>
      ) : (
        <div className="flex justify-center gap-2">
          {units.map((u) => (
            <div key={u.label} style={digitBoxStyle}>
              <p className="text-2xl font-bold tabular-nums" style={{ color: digitColor }}>
                {String(u.value).padStart(2, "0")}
              </p>
              <p className="text-[9px] font-medium uppercase mt-0.5 opacity-60" style={{ color: labelColor }}>
                {u.label}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BioPage({ embedded = false }: { embedded?: boolean }) {
  // Hydration guard: prevent WSOD from server/client localStorage mismatch
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const { profile, links, testimonials, pages, theme, settings, floatingButton } = useStore((s) => s.config);
  const [activeTab, setActiveTab] = useReactState<string | null>(null);
  const [lightboxState, setLightboxState] = useReactState<{ images: PortfolioImage[]; index: number } | null>(null);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0f0f" }}>
        <Sparkles className="w-6 h-6 animate-pulse" style={{ color: "#a78bfa" }} />
      </div>
    );
  }

  const enabledLinks = links
    .filter((l) => l.enabled)
    .filter((l) => {
      const now = new Date();
      if (l.validFrom && new Date(l.validFrom) > now) return false;
      if (l.validUntil && new Date(l.validUntil) < now) return false;
      return true;
    })
    .sort((a, b) => a.order - b.order);

  const buttonRadius =
    theme.buttonStyle === "pill"
      ? "9999px"
      : theme.buttonStyle === "square"
        ? "8px"
        : "12px";

  const isOutline = theme.buttonStyle === "outline";

  return (
    <>
    <div
      id="voltbio-page"
      className={cn(
        "flex flex-col items-center min-h-full w-full",
        embedded ? "py-8 px-4" : "min-h-screen py-16 px-4"
      )}
      style={{ background: theme.colors.background, color: theme.colors.text }}
    >
      {/* Custom CSS injection (scoped to #voltbio-page) */}
      {settings.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: settings.customCSS }} />
      )}
      <motion.div
        className="profile-container w-full max-w-md mx-auto flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Avatar ── */}
        <motion.div variants={avatarVariants} className="profile-avatar mb-4">
          {profile.avatar ? (
            <motion.img
              src={profile.avatar}
              alt={profile.name || "Profile avatar"}
              loading="lazy"
              className="w-24 h-24 rounded-full object-cover border-2 shadow-lg"
              style={{ borderColor: theme.colors.accent }}
              whileHover={{ scale: 1.08, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            />
          ) : (
            <motion.div
              className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg"
              style={{
                background: theme.colors.accent + "22",
                color: theme.colors.accent,
                border: `2px solid ${theme.colors.accent}`,
              }}
              role="img"
              aria-label={`Avatar for ${profile.name || "user"}`}
              whileHover={{ scale: 1.08, rotate: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {getAvatarFallback(profile.name)}
            </motion.div>
          )}
        </motion.div>

        {/* ── Name ── */}
        <motion.h1
          variants={fadeUpVariants}
          className="profile-name text-2xl font-bold text-center"
          style={{ color: theme.colors.text }}
        >
          {profile.name || "Your Name"}
        </motion.h1>

        {/* ── Location ── */}
        {profile.location && (
          <motion.p
            variants={fadeUpVariants}
            className="profile-location flex items-center gap-1 text-sm mt-1 opacity-60"
          >
            <MapPin className="w-3 h-3" aria-hidden="true" />
            {profile.location}
          </motion.p>
        )}

        {/* ── Bio ── */}
        <motion.p
          variants={fadeUpVariants}
          className="profile-bio text-sm text-center mt-2 opacity-75 max-w-xs leading-relaxed"
          style={{ color: theme.colors.text }}
        >
          {profile.bio || "Welcome to my link page"}
        </motion.p>

        {/* ── Save Contact Button ── */}
        {(profile.phone || profile.email) && (
          <motion.button
            variants={fadeUpVariants}
            type="button"
            onClick={() => {
              const pageUrl = profile.username
                ? `https://${profile.username}.github.io/voltbio`
                : undefined;
              downloadVCard(profile, pageUrl);
            }}
            className="save-contact-btn mt-3 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer"
            style={{
              background: theme.colors.accent + "18",
              color: theme.colors.accent,
              border: `1.5px solid ${theme.colors.accent}40`,
            }}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Save Contact
          </motion.button>
        )}

        {/* ── Tab Navigation ── */}
        {(pages || []).length > 0 && (
          <motion.div variants={fadeUpVariants} className="w-full mt-6 mb-2">
            <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              <button
                type="button"
                onClick={() => setActiveTab(null)}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
                style={{
                  background: activeTab === null ? theme.colors.accent : `${theme.colors.accent}15`,
                  color: activeTab === null ? "#fff" : theme.colors.text,
                  opacity: activeTab === null ? 1 : 0.7,
                }}
              >
                All
              </button>
              {(pages || []).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
                  style={{
                    background: activeTab === tab.id ? theme.colors.accent : `${theme.colors.accent}15`,
                    color: activeTab === tab.id ? "#fff" : theme.colors.text,
                    opacity: activeTab === tab.id ? 1 : 0.7,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Links ── */}
        <div className="links-container w-full mt-8 space-y-3">
          {enabledLinks.filter((link) => {
            if (!activeTab || !(pages || []).length) return true;
            const activePage = (pages || []).find((p) => p.id === activeTab);
            if (!activePage) return true;
            // Strict: only show links explicitly assigned to this tab
            return activePage.linkIds.includes(link.id);
          }).map((link) => {
            // ── Section Header ──
            if (link.type === "header") {
              return (
                <motion.div
                  key={link.id}
                  variants={linkCardVariants}
                  className="section-header w-full pt-4 pb-1"
                >
                  <p
                    className="text-xs font-bold uppercase tracking-widest opacity-60"
                    style={{ color: theme.colors.text }}
                  >
                    {link.title}
                  </p>
                  <div
                    className="mt-1.5 h-px w-8 rounded-full opacity-30"
                    style={{ background: theme.colors.accent }}
                  />
                </motion.div>
              );
            }

            // ── Donation Block ──
            if (link.type === "donation") {
              const platformLabels: Record<string, string> = {
                qris: "📱 QRIS", saweria: "🪙 Saweria", trakteer: "☕ Trakteer",
                kofi: "☕ Ko-fi", buymeacoffee: "☕ Buy Me a Coffee", patreon: "🎨 Patreon",
              };
              const platformLabel = platformLabels[link.donationPlatform || "qris"];
              const isQris = link.donationPlatform === "qris";

              return (
                <motion.div
                  key={link.id}
                  variants={linkCardVariants}
                  className="donation-card w-full"
                >
                  <div
                    className="relative overflow-hidden rounded-2xl p-5 text-center"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.accent}22, ${theme.colors.accent}08)`,
                      border: `1.5px solid ${theme.colors.accent}40`,
                    }}
                  >
                    {/* Platform badge */}
                    <div
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold mb-3"
                      style={{ background: `${theme.colors.accent}20`, color: theme.colors.accent }}
                    >
                      {platformLabel}
                    </div>

                    {/* Title */}
                    <p className="text-base font-bold mb-1" style={{ color: theme.colors.text }}>
                      {link.title || "Support Me"}
                    </p>

                    {/* CTA */}
                    <p className="text-sm opacity-70 mb-4" style={{ color: theme.colors.text }}>
                      {link.donationCta || ""}
                    </p>

                    {/* QRIS barcode display */}
                    {isQris && link.qrisImage && (
                      <div className="inline-block p-3 bg-white rounded-xl mb-3 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={link.qrisImage}
                          alt="Scan QRIS"
                          className="w-40 h-40 object-contain"
                        />
                      </div>
                    )}
                    {isQris && link.qrisImage && (
                      <p className="text-[10px] opacity-50" style={{ color: theme.colors.text }}>
                        Scan dengan aplikasi e-wallet kamu
                      </p>
                    )}

                    {/* Link button for non-QRIS */}
                    {!isQris && link.url && (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-transform hover:scale-105"
                        style={{ background: theme.colors.accent }}
                      >
                        {link.donationCta || `Donate via ${platformLabel}`}
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            }

            // ── Portfolio / Image Grid Block ──
            if (link.type === "portfolio") {
              const images = link.portfolioImages || [];
              const cols = link.portfolioColumns || 3;
              const gapMap = { sm: "4px", md: "8px", lg: "12px" };
              const gap = gapMap[link.portfolioGap || "md"];

              if (images.length === 0) return null;

              return (
                <motion.div
                  key={link.id}
                  variants={linkCardVariants}
                  className="portfolio-block w-full"
                >
                  {/* Title */}
                  {link.title && (
                    <p
                      className="text-sm font-semibold mb-2 opacity-80"
                      style={{ color: theme.colors.text }}
                    >
                      {link.title}
                    </p>
                  )}
                  {/* Masonry grid via CSS columns */}
                  <div
                    style={{
                      columnCount: cols,
                      columnGap: gap,
                    }}
                  >
                    {images.map((img, imgIdx) => (
                      <div
                        key={img.id}
                        className="mb-[var(--portfolio-gap)] break-inside-avoid cursor-pointer group relative overflow-hidden rounded-lg"
                        style={{
                          // @ts-expect-error CSS custom property
                          "--portfolio-gap": gap,
                          marginBottom: gap,
                        }}
                        onClick={() => setLightboxState({ images, index: imgIdx })}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.dataUrl}
                          alt={img.caption || `Portfolio image ${imgIdx + 1}`}
                          className="w-full h-auto block rounded-lg transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        {/* Caption overlay */}
                        {img.caption && (
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white text-[10px] font-medium truncate">{img.caption}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            }

            // ── Countdown Timer Block ──
            if (link.type === "countdown") {
              return (
                <motion.div
                  key={link.id}
                  variants={linkCardVariants}
                  className="countdown-block w-full"
                >
                  <CountdownTimer
                    targetDate={link.targetDate || new Date().toISOString()}
                    timerLabel={link.timerLabel || "Countdown"}
                    timerStyle={link.timerStyle || "card"}
                    title={link.title || ""}
                    accentColor={theme.colors.accent}
                    textColor={theme.colors.text}
                  />
                </motion.div>
              );
            }

            // ── Lead Form / Contact Form Block ──
            if (link.type === "lead-form") {
              const fields = link.formFields || ["name", "email", "message"];
              const provider = link.formProvider || "formsubmit";
              const actionUrl =
                provider === "formsubmit"
                  ? `https://formsubmit.co/${link.formEmail || ""}`
                  : "https://api.web3forms.com/submit";

              const inputStyle: React.CSSProperties = {
                width: "100%",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.5rem",
                border: `1px solid ${theme.colors.accent}30`,
                background: `${theme.colors.accent}08`,
                color: theme.colors.text,
                fontSize: "0.875rem",
                outline: "none",
              };

              return (
                <motion.div
                  key={link.id}
                  variants={linkCardVariants}
                  className="lead-form-block w-full"
                >
                  <div
                    className="relative overflow-hidden rounded-2xl p-5"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.accent}15, ${theme.colors.accent}05)`,
                      border: `1.5px solid ${theme.colors.accent}30`,
                    }}
                  >
                    {/* Header */}
                    <div className="text-center mb-4">
                      <div
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold mb-2"
                        style={{ background: `${theme.colors.accent}20`, color: theme.colors.accent }}
                      >
                        ✉️ Contact Form
                      </div>
                      <p className="text-base font-bold" style={{ color: theme.colors.text }}>
                        {link.title || "Contact Me"}
                      </p>
                    </div>

                    {/* Form */}
                    <form
                      action={actionUrl}
                      method="POST"
                      target="_blank"
                      className="space-y-3"
                    >
                      {/* Hidden fields */}
                      {provider === "formsubmit" && (
                        <>
                          <input type="hidden" name="_captcha" value="false" />
                          <input type="hidden" name="_subject" value={`New message from ${link.title || "VoltBio"}`} />
                          <input type="hidden" name="_next" value={typeof window !== "undefined" ? window.location.href : ""} />
                        </>
                      )}
                      {provider === "web3forms" && (
                        <input type="hidden" name="access_key" value={link.formAccessKey || ""} />
                      )}

                      {fields.includes("name") && (
                        <input
                          type="text"
                          name="name"
                          placeholder="Your Name"
                          required
                          style={inputStyle}
                        />
                      )}
                      {fields.includes("email") && (
                        <input
                          type="email"
                          name="email"
                          placeholder="Your Email"
                          required
                          style={inputStyle}
                        />
                      )}
                      {fields.includes("phone") && (
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Phone Number"
                          style={inputStyle}
                        />
                      )}
                      {fields.includes("message") && (
                        <textarea
                          name="message"
                          placeholder="Your Message..."
                          rows={3}
                          required
                          style={{ ...inputStyle, resize: "vertical" as const }}
                        />
                      )}

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-full text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        style={{ background: theme.colors.accent }}
                      >
                        {link.formCta || "Send Message ✉️"}
                      </button>
                    </form>

                    <p className="text-[9px] text-center mt-3 opacity-40" style={{ color: theme.colors.text }}>
                      Powered by {provider === "formsubmit" ? "FormSubmit.co" : "Web3Forms"} · No backend needed
                    </p>
                  </div>
                </motion.div>
              );
            }

            const iconKey = detectSocialIcon(link.url);
            const safeUrl = sanitizeUrl(link.url);
            const embedInfo = link.isEmbed ? detectEmbed(link.url) : null;

            // ── Render PDF Document ──
            if (link.isPdfEmbed) {
              const pdfSrc = detectPdfUrl(link.url);
              if (pdfSrc) {
                return (
                  <motion.div
                    key={link.id}
                    variants={linkCardVariants}
                    className="embed-card pdf-card w-full overflow-hidden rounded-xl"
                    style={{ border: `1px solid ${theme.colors.cardBackground}` }}
                  >
                    {link.title && (
                      <p className="text-xs font-medium px-4 py-2.5 opacity-70 flex items-center gap-1.5"
                        style={{ color: theme.colors.text }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        {link.title}
                      </p>
                    )}
                    <iframe
                      src={pdfSrc}
                      title={link.title || "PDF Document"}
                      className="w-full border-none"
                      style={{ height: "500px" }}
                      loading="lazy"
                      allow="autoplay"
                    />
                  </motion.div>
                );
              }
            }

            // ── Render Embed iframe ──
            if (link.isEmbed && embedInfo) {
              return (
                <motion.div
                  key={link.id}
                  variants={linkCardVariants}
                  className="embed-card w-full overflow-hidden rounded-xl"
                  style={{
                    border: `1px solid ${theme.colors.cardBackground}`,
                  }}
                >
                  {link.title && (
                    <p
                      className="text-xs font-medium px-3 py-2 opacity-70"
                      style={{ color: theme.colors.text }}
                    >
                      {link.title}
                    </p>
                  )}
                  <iframe
                    src={embedInfo.embedUrl}
                    title={link.title || "Embedded media"}
                    className={cn(
                      "w-full border-0",
                      embedInfo.platform === "youtube"
                        ? "aspect-video"
                        : ""
                    )}
                    style={
                      embedInfo.platform === "spotify"
                        ? { height: getSpotifyHeight(embedInfo.type) }
                        : undefined
                    }
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </motion.div>
              );
            }

            // ── Render Action Card ──
            if (link.type === "action" && link.actionConfig) {
              return <ActionCard key={link.id} link={link} theme={theme} buttonRadius={buttonRadius} isOutline={isOutline} />;
            }

            // ── Render Locked Link Button ──
            if (link.isLocked && link.encryptedUrl) {
              return (
                <motion.button
                  key={link.id}
                  variants={linkCardVariants}
                  type="button"
                  onClick={async () => {
                    const pw = window.prompt(`🔒 "${link.title}" is password-protected.\nEnter password to unlock:`);
                    if (!pw) return;
                    const url = await decryptUrl(link.encryptedUrl!, pw);
                    if (url) {
                      window.open(url, link.target);
                    } else {
                      window.alert("❌ Wrong password. Please try again.");
                    }
                  }}
                  className="link-card link-locked group flex items-center gap-3 w-full px-5 py-3.5 text-sm font-medium transition-shadow duration-200 cursor-pointer"
                  style={{
                    background: isOutline ? "transparent" : theme.colors.cardBackground,
                    color: theme.colors.text,
                    borderRadius: buttonRadius,
                    border: isOutline
                      ? `1.5px solid ${theme.colors.accent}`
                      : `1px solid ${theme.colors.cardBackground}`,
                  }}
                  whileHover={{
                    scale: 1.03,
                    y: -2,
                    borderColor: theme.colors.accent,
                    boxShadow: `0 8px 24px ${theme.colors.accent}25`,
                  }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Lock className="w-4 h-4 link-icon" style={{ color: theme.colors.accent }} />
                  <span className="link-title flex-1 text-center">{link.title}</span>
                  <span className="w-[18px]" aria-hidden="true" />
                </motion.button>
              );
            }

            // ── Render Standard Link Button ──
            return (
              <motion.a
                key={link.id}
                variants={linkCardVariants}
                href={safeUrl || "#"}
                target={link.target}
                rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
                onClick={() => trackClick(link.id)}
                aria-label={`${link.title}${link.target === "_blank" ? " (opens in new tab)" : ""}`}
                className="link-card group flex items-center gap-3 w-full px-5 py-3.5 text-sm font-medium transition-shadow duration-200"
                style={{
                  background: isOutline ? "transparent" : theme.colors.cardBackground,
                  color: theme.colors.text,
                  borderRadius: buttonRadius,
                  border: isOutline
                    ? `1.5px solid ${theme.colors.accent}`
                    : `1px solid ${theme.colors.cardBackground}`,
                  ...getCardEffectStyles(theme.themeEffect, theme.colors.accent),
                }}
                whileHover={{
                  scale: 1.03,
                  y: -2,
                  backgroundColor: isOutline
                    ? theme.colors.accent + "15"
                    : theme.colors.linkHover + "20",
                  borderColor: theme.colors.accent,
                  boxShadow: `0 8px 24px ${theme.colors.accent}25`,
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <SocialIcon iconKey={iconKey} size={18} className="link-icon" />
                <span className="link-title flex-1 text-center">{link.title}</span>
                <span className="w-[18px]" aria-hidden="true" />
              </motion.a>
            );
          })}

          {enabledLinks.length === 0 && (
            <motion.p
              variants={fadeUpVariants}
              className="text-center text-sm opacity-50 py-8"
            >
              No links yet. Add some in the editor!
            </motion.p>
          )}
        </div>

        {/* ── Testimonials Carousel ── */}
        {(testimonials || []).filter((t) => t.name && t.text).length > 0 && (
          <motion.div variants={fadeUpVariants} className="w-full mt-6">
            <p className="text-xs font-semibold mb-3 opacity-60 tracking-wide uppercase" style={{ color: theme.colors.text }}>
              ★ Reviews
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
              {(testimonials || []).filter((t) => t.name && t.text).map((t) => (
                <motion.div
                  key={t.id}
                  variants={linkCardVariants}
                  className="snap-start flex-shrink-0 w-[240px] p-4 rounded-xl"
                  style={{
                    background: theme.colors.cardBackground,
                    border: `1px solid ${theme.colors.cardBackground}`,
                  }}
                >
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <svg key={n} width="14" height="14" viewBox="0 0 24 24" fill={n <= t.rating ? "#facc15" : "none"} stroke={n <= t.rating ? "#facc15" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed opacity-80 line-clamp-4" style={{ color: theme.colors.text }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <p className="text-[11px] font-semibold mt-2 opacity-60" style={{ color: theme.colors.text }}>
                    — {t.name}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Footer ── */}
        {settings.showFooter && (
          <motion.footer
            variants={fadeUpVariants}
            className="page-footer mt-12 flex items-center gap-1.5 text-xs opacity-40"
            role="contentinfo"
          >
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            <span>{settings.footerText}</span>
          </motion.footer>
        )}
      </motion.div>
    </div>

    {/* ── Floating Action Button ── */}
    {floatingButton?.enabled && floatingButton.url && (() => {
      const fb = floatingButton;
      const href =
        fb.icon === "whatsapp" ? `https://wa.me/${fb.url.replace(/\D/g, "")}` :
        fb.icon === "email" ? `mailto:${fb.url}` :
        fb.icon === "phone" ? `tel:${fb.url}` :
        fb.url;

      const svgIcon =
        fb.icon === "whatsapp" ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        ) : fb.icon === "email" ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        ) : fb.icon === "phone" ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        );

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={fb.label || "Contact"}
          className="group"
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 9999,
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: theme.colors.accent,
            color: "#fff",
            boxShadow: `0 4px 20px ${theme.colors.accent}60`,
            transition: "transform 0.2s, box-shadow 0.2s",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {svgIcon}
        </a>
      );
    })()}

    {/* Portfolio Lightbox */}
    {lightboxState && (
      <Lightbox
        images={lightboxState.images}
        initialIndex={lightboxState.index}
        onClose={() => setLightboxState(null)}
      />
    )}
    </>
  );
}
