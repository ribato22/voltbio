"use client";

import { motion } from "framer-motion";
import { MapPin, Sparkles, UserPlus, Lock, MessageCircle, ChevronDown } from "lucide-react";
import { useState as useReactState } from "react";
import { useStore } from "@/lib/store";
import { trackClick } from "@/lib/analytics";
import { SocialIcon } from "@/components/preview/SocialIcon";
import { detectSocialIcon, sanitizeUrl, getAvatarFallback, cn, detectPdfUrl } from "@/lib/utils";
import { downloadVCard } from "@/lib/vcard";
import { detectEmbed, getSpotifyHeight } from "@/lib/embed";
import { decryptUrl } from "@/lib/crypto";
import type { LinkItem, ThemeConfig } from "@/types";

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
        borderRadius: buttonRadius,
        border: isOutline ? `1.5px solid ${theme.colors.accent}` : `1px solid ${theme.colors.cardBackground}`,
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
export function BioPage({ embedded = false }: { embedded?: boolean }) {
  const { profile, links, theme, settings } = useStore((s) => s.config);

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

        {/* ── Links ── */}
        <div className="links-container w-full mt-8 space-y-3">
          {enabledLinks.map((link) => {
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
  );
}
