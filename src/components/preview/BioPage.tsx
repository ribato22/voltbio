"use client";

import { motion } from "framer-motion";
import { MapPin, Sparkles, UserPlus, Lock } from "lucide-react";
import { useStore } from "@/lib/store";
import { trackClick } from "@/lib/analytics";
import { SocialIcon } from "@/components/preview/SocialIcon";
import { detectSocialIcon, sanitizeUrl, getAvatarFallback, cn } from "@/lib/utils";
import { downloadVCard } from "@/lib/vcard";
import { detectEmbed, getSpotifyHeight } from "@/lib/embed";
import { decryptUrl } from "@/lib/crypto";

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
