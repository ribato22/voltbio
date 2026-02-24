/* ============================================================
   VoltBio — VCard Generator

   Generates standard vCard 3.0 format string for contact download.
   100% client-side, no backend required.
   ============================================================ */

import type { Profile } from "@/types";

/**
 * Generate a vCard 3.0 string from profile data.
 *
 * Spec: https://www.rfc-editor.org/rfc/rfc6350
 *
 * @param profile - User profile data
 * @param pageUrl - Optional URL to include as the profile page
 * @returns vCard formatted string
 */
export function generateVCard(profile: Profile, pageUrl?: string): string {
  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
  ];

  // Full name (required)
  const name = profile.name || "Unknown";
  lines.push(`FN:${escapeVCard(name)}`);
  lines.push(`N:${escapeVCard(name)};;;;`);

  // Organization / Title — use bio as note
  if (profile.bio) {
    lines.push(`NOTE:${escapeVCard(profile.bio)}`);
  }

  // Phone
  if (profile.phone) {
    lines.push(`TEL;TYPE=CELL:${profile.phone.trim()}`);
  }

  // Email
  if (profile.email) {
    lines.push(`EMAIL;TYPE=INTERNET:${profile.email.trim()}`);
  }

  // Location
  if (profile.location) {
    lines.push(`ADR;TYPE=WORK:;;${escapeVCard(profile.location)};;;;`);
  }

  // Profile page URL
  if (pageUrl) {
    lines.push(`URL:${pageUrl}`);
  }

  // Avatar photo (if available and is a URL, not base64 for file size)
  // For base64 avatars, skip embedding to keep vcf small

  lines.push("END:VCARD");

  return lines.join("\r\n");
}

/**
 * Download a vCard file (.vcf) to the user's device.
 */
export function downloadVCard(profile: Profile, pageUrl?: string): void {
  const vcf = generateVCard(profile, pageUrl);
  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${profile.username || profile.name || "contact"}.vcf`;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Escape special characters for vCard format.
 */
function escapeVCard(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}
