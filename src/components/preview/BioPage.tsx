"use client";

import { motion } from "framer-motion";
import { MapPin, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { trackClick } from "@/lib/analytics";
import { SocialIcon } from "@/components/preview/SocialIcon";
import { detectSocialIcon, sanitizeUrl, getAvatarFallback, cn } from "@/lib/utils";

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
      className={cn(
        "flex flex-col items-center min-h-full w-full",
        embedded ? "py-8 px-4" : "min-h-screen py-16 px-4"
      )}
      style={{ background: theme.colors.background, color: theme.colors.text }}
    >
      <motion.div
        className="w-full max-w-md mx-auto flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Avatar ── */}
        <motion.div variants={avatarVariants} className="mb-4">
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
          className="text-2xl font-bold text-center"
          style={{ color: theme.colors.text }}
        >
          {profile.name || "Your Name"}
        </motion.h1>

        {/* ── Location ── */}
        {profile.location && (
          <motion.p
            variants={fadeUpVariants}
            className="flex items-center gap-1 text-sm mt-1 opacity-60"
          >
            <MapPin className="w-3 h-3" aria-hidden="true" />
            {profile.location}
          </motion.p>
        )}

        {/* ── Bio ── */}
        <motion.p
          variants={fadeUpVariants}
          className="text-sm text-center mt-2 opacity-75 max-w-xs leading-relaxed"
          style={{ color: theme.colors.text }}
        >
          {profile.bio || "Welcome to my link page"}
        </motion.p>

        {/* ── Links ── */}
        <div className="w-full mt-8 space-y-3">
          {enabledLinks.map((link) => {
            const iconKey = detectSocialIcon(link.url);
            const safeUrl = sanitizeUrl(link.url);

            return (
              <motion.a
                key={link.id}
                variants={linkCardVariants}
                href={safeUrl || "#"}
                target={link.target}
                rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
                onClick={() => trackClick(link.id)}
                aria-label={`${link.title}${link.target === "_blank" ? " (opens in new tab)" : ""}`}
                className="group flex items-center gap-3 w-full px-5 py-3.5 text-sm font-medium transition-shadow duration-200"
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
                <SocialIcon iconKey={iconKey} size={18} />
                <span className="flex-1 text-center">{link.title}</span>
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
            className="mt-12 flex items-center gap-1.5 text-xs opacity-40"
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
