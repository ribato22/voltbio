/* ============================================================
   VoltBio — Zustand Store
   ============================================================ */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { ProfileConfig, LinkItem, ThemeConfig, Profile, SeoConfig, AppSettings, EditorPanel, Testimonial } from "@/types";
import { themePresets } from "@/lib/themes";

const defaultConfig: ProfileConfig = {
  version: "1.0.0",
  profile: {
    name: "Your Name",
    username: "username",
    bio: "Welcome to my link page ✨",
    avatar: "",
    location: "",
  },
  links: [
    {
      id: nanoid(10),
      title: "My Website",
      url: "https://example.com",
      icon: "globe",
      enabled: true,
      order: 0,
      target: "_blank",
    },
  ],
  theme: {
    preset: "midnight",
    mode: "dark",
    colors: { ...themePresets[1].colors },
    font: "Inter",
    buttonStyle: "rounded",
    animation: "fade-up",
    backgroundPattern: "none",
  },
  seo: {
    title: "My Links",
    description: "All my important links in one place.",
    ogImage: "",
    favicon: "",
  },
  settings: {
    showFooter: true,
    footerText: "Powered by VoltBio",
    analyticsId: "",
    locale: "en",
  },
};

interface EditorState {
  activePanel: EditorPanel;
  showPreview: boolean;
}

interface VoltBioStore {
  config: ProfileConfig;
  editor: EditorState;

  // Profile actions
  updateProfile: (profile: Partial<Profile>) => void;

  // Link actions
  addLink: (link?: Partial<LinkItem>) => void;
  addSection: (title?: string) => void;
  addAction: (title?: string) => void;
  updateLink: (id: string, updates: Partial<LinkItem>) => void;
  removeLink: (id: string) => void;
  reorderLinks: (links: LinkItem[]) => void;
  toggleLink: (id: string) => void;

  // Theme actions
  setTheme: (theme: Partial<ThemeConfig>) => void;
  applyPreset: (presetId: string) => void;

  // SEO actions
  updateSeo: (seo: Partial<SeoConfig>) => void;

  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Testimonial actions
  addTestimonial: () => void;
  updateTestimonial: (id: string, updates: Partial<Testimonial>) => void;
  removeTestimonial: (id: string) => void;

  // Editor UI actions
  setActivePanel: (panel: EditorPanel) => void;
  togglePreview: () => void;

  // Import / Export
  importConfig: (config: ProfileConfig) => void;
  resetConfig: () => void;
}

export const useStore = create<VoltBioStore>()(
  persist(
    (set) => ({
      config: defaultConfig,
      editor: {
        activePanel: "links",
        showPreview: true,
      },

      // ── Profile ──
      updateProfile: (profile) =>
        set((state) => ({
          config: {
            ...state.config,
            profile: { ...state.config.profile, ...profile },
          },
        })),

      // ── Links ──
      addLink: (link) =>
        set((state) => {
          const newLink: LinkItem = {
            id: nanoid(10),
            title: link?.title ?? "New Link",
            url: link?.url ?? "https://",
            icon: link?.icon ?? "link",
            enabled: link?.enabled ?? true,
            order: state.config.links.length,
            target: link?.target ?? "_blank",
          };
          return {
            config: {
              ...state.config,
              links: [...state.config.links, newLink],
            },
          };
        }),

      addSection: (title) =>
        set((state) => {
          const section: LinkItem = {
            id: nanoid(10),
            title: title ?? "Section",
            url: "",
            icon: "folder",
            enabled: true,
            order: state.config.links.length,
            target: "_blank",
            type: "header",
          };
          return {
            config: {
              ...state.config,
              links: [...state.config.links, section],
            },
          };
        }),

      addAction: (title?: string) =>
        set((state) => {
          const action: LinkItem = {
            id: nanoid(10),
            title: title ?? "Book Consultation",
            url: "",
            icon: "message-circle",
            enabled: true,
            order: state.config.links.length,
            target: "_blank",
            type: "action",
            actionConfig: {
              whatsappNumber: "",
              messageTemplate: "Halo, saya {nama}.\nSaya ingin booking {layanan}.\nTerima kasih!",
              fields: [
                { id: nanoid(6), label: "Nama", placeholder: "Nama lengkap", type: "text" },
                { id: nanoid(6), label: "Layanan", placeholder: "Pilih layanan", type: "text" },
              ],
            },
          };
          return {
            config: {
              ...state.config,
              links: [...state.config.links, action],
            },
          };
        }),

      updateLink: (id, updates) =>
        set((state) => ({
          config: {
            ...state.config,
            links: state.config.links.map((link) =>
              link.id === id ? { ...link, ...updates } : link
            ),
          },
        })),

      removeLink: (id) =>
        set((state) => ({
          config: {
            ...state.config,
            links: state.config.links
              .filter((link) => link.id !== id)
              .map((link, index) => ({ ...link, order: index })),
          },
        })),

      reorderLinks: (links) =>
        set((state) => ({
          config: {
            ...state.config,
            links: links.map((link, index) => ({ ...link, order: index })),
          },
        })),

      toggleLink: (id) =>
        set((state) => ({
          config: {
            ...state.config,
            links: state.config.links.map((link) =>
              link.id === id ? { ...link, enabled: !link.enabled } : link
            ),
          },
        })),

      // ── Theme ──
      setTheme: (theme) =>
        set((state) => ({
          config: {
            ...state.config,
            theme: { ...state.config.theme, ...theme },
          },
        })),

      applyPreset: (presetId) =>
        set((state) => {
          const preset = themePresets.find((p) => p.id === presetId);
          if (!preset) return state;
          return {
            config: {
              ...state.config,
              theme: {
                ...state.config.theme,
                preset: presetId,
                colors: { ...preset.colors },
                font: preset.font,
                buttonStyle: preset.buttonStyle,
              },
            },
          };
        }),

      // ── SEO ──
      updateSeo: (seo) =>
        set((state) => ({
          config: {
            ...state.config,
            seo: { ...state.config.seo, ...seo },
          },
        })),

      // ── Settings ──
      updateSettings: (settings) =>
        set((state) => ({
          config: {
            ...state.config,
            settings: { ...state.config.settings, ...settings },
          },
        })),

      // ── Testimonials ──
      addTestimonial: () =>
        set((state) => ({
          config: {
            ...state.config,
            testimonials: [
              ...(state.config.testimonials || []),
              { id: nanoid(8), name: "", text: "", rating: 5 as const },
            ],
          },
        })),

      updateTestimonial: (id, updates) =>
        set((state) => ({
          config: {
            ...state.config,
            testimonials: (state.config.testimonials || []).map((t) =>
              t.id === id ? { ...t, ...updates } : t
            ),
          },
        })),

      removeTestimonial: (id) =>
        set((state) => ({
          config: {
            ...state.config,
            testimonials: (state.config.testimonials || []).filter(
              (t) => t.id !== id
            ),
          },
        })),

      // ── Editor UI ──
      setActivePanel: (panel) =>
        set((state) => ({
          editor: { ...state.editor, activePanel: panel },
        })),

      togglePreview: () =>
        set((state) => ({
          editor: { ...state.editor, showPreview: !state.editor.showPreview },
        })),

      // ── Import / Export ──
      importConfig: (config) => set({ config }),
      resetConfig: () => set({ config: defaultConfig }),
    }),
    {
      name: "voltbio-store",
      version: 1,
    }
  )
);
