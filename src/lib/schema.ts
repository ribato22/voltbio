/* ============================================================
   VoltBio — Zod Validation Schemas
   ============================================================ */

import { z } from "zod";

export const LinkSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required").max(100),
  url: z.string().url("Must be a valid URL"),
  icon: z.string().default("link"),
  enabled: z.boolean().default(true),
  order: z.number().int().min(0),
  target: z.enum(["_blank", "_self"]).default("_blank"),
  isEmbed: z.boolean().optional(),
  type: z.enum(["link", "header"]).optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
});

export const ProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  username: z.string().min(1, "Username is required").max(30),
  bio: z.string().max(300).default(""),
  avatar: z.string().default(""),
  location: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().or(z.literal("")).optional(),
});

export const ThemeColorsSchema = z.object({
  background: z.string(),
  cardBackground: z.string(),
  text: z.string(),
  accent: z.string(),
  linkHover: z.string(),
});

export const ThemeSchema = z.object({
  preset: z.string().default("default"),
  mode: z.enum(["light", "dark", "system"]),
  colors: ThemeColorsSchema,
  font: z.string().default("Inter"),
  buttonStyle: z.enum(["rounded", "pill", "square", "outline"]).default("rounded"),
  animation: z.enum(["none", "fade-up", "slide-in", "scale"]).default("fade-up"),
  backgroundPattern: z.enum(["none", "dots", "grid", "gradient", "noise"]).default("none"),
});

export const SeoSchema = z.object({
  title: z.string().min(1),
  description: z.string().max(200),
  ogImage: z.string().optional(),
  favicon: z.string().optional(),
});

export const SettingsSchema = z.object({
  showFooter: z.boolean().default(true),
  footerText: z.string().default("Powered by VoltBio"),
  analyticsId: z.string().optional(),
  locale: z.enum(["en", "id"]).default("en"),
  customCSS: z.string().max(5000).optional(),
});

export const ProfileConfigSchema = z.object({
  version: z.string(),
  profile: ProfileSchema,
  links: z.array(LinkSchema),
  theme: ThemeSchema,
  seo: SeoSchema,
  settings: SettingsSchema,
});

export type ProfileConfigInput = z.infer<typeof ProfileConfigSchema>;
