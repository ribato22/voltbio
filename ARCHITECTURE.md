# VoltBio Architecture Guide

> A technical overview for contributors and maintainers.

---

## Design Principles

1. **No Server Required** — Everything runs client-side. No API routes, no database, no backend.
2. **JSON as the Source of Truth** — A single `profile.json` stores *all* user configuration.
3. **Accessibility by Default** — Every UI primitive is built on [Radix UI](https://www.radix-ui.com/) with ARIA attributes, keyboard navigation, and focus management.
4. **Static Output** — The final bio page is pure HTML/CSS/JS, deployable on any static host.

---

## State Management — Zustand + localStorage

```
┌────────────────────────────────────┐
│          Zustand Store             │
│  ┌──────────┐  ┌────────────────┐  │
│  │  config   │  │  editor state  │  │
│  │ (profile, │  │ (activePanel,  │  │
│  │  links,   │  │  showPreview)  │  │
│  │  theme,   │  │                │  │
│  │  seo,     │  └────────────────┘  │
│  │  settings)│                      │
│  └──────────┘                      │
└───────────┬────────────────────────┘
            │  persist middleware
            ▼
     localStorage
   key: "voltbio-store"
```

### How it works

- **`src/lib/store.ts`** defines the store using `zustand/persist`.
- All user data (`profile`, `links`, `theme`, `seo`, `settings`) lives under `config`.
- Editor-only UI state (`activePanel`, `showPreview`) lives under `editor` and is *also* persisted.
- The `persist` middleware auto-syncs to `localStorage` on every state change.
- On page load, Zustand hydrates from `localStorage` — no loading spinners, no API calls.

### Key Actions

| Action | What it does |
|---|---|
| `addLink()` | Creates a new link with `nanoid` ID, appends to array |
| `reorderLinks(links)` | Replaces link array and recalculates `order` indices |
| `applyPreset(id)` | Finds preset in `themes.ts`, spreads its colors into `config.theme` |
| `importConfig(config)` | Replaces entire `config` object (used by JSON import) |

---

## Styling System — Tailwind CSS v4 (CSS-First)

We use **Tailwind v4's CSS-first configuration**. There is no `tailwind.config.ts`.

### Where config lives: `src/app/globals.css`

```css
@import "tailwindcss";

@theme inline {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --color-brand-500: oklch(0.55 0.22 270);
  /* ... full palette using OKLCH color space */
}
```

### Dynamic Theme Variables

Static Tailwind classes handle layout and structure. **Dynamic theme colors** use CSS custom properties that are set at runtime:

```css
:root {
  --lf-bg: #ffffff;
  --lf-card-bg: #f8fafc;
  --lf-text: #0f172a;
  --lf-accent: oklch(0.55 0.22 270);
  --lf-link-hover: oklch(0.65 0.18 270);
}

[data-theme="dark"] { /* dark overrides */ }
```

Components reference these via Tailwind arbitrary values:

```tsx
<div className="bg-[var(--lf-bg)] text-[var(--lf-text)]">
```

The `useThemeBridge` hook syncs Zustand theme state → CSS custom properties on every change.

### Dark Mode / FOUC Prevention

A blocking `<script>` in `layout.tsx` reads the persisted theme mode from `localStorage` *before* React hydrates, preventing any flash of unstyled content:

```tsx
<script dangerouslySetInnerHTML={{ __html: `
  (function(){ /* reads localStorage, sets data-theme attribute */ })();
`}} />
```

---

## Data Validation — Zod Schemas

**`src/lib/schema.ts`** defines Zod schemas that mirror the TypeScript interfaces in `src/types/index.ts`.

```
TypeScript Interfaces (compile-time)
         ↕ kept in sync manually
Zod Schemas (runtime validation)
```

### When validation runs

| Scenario | Action |
|---|---|
| **JSON Import** | `ProfileConfigSchema.safeParse(data)` validates the uploaded file |
| **Link creation** | `LinkSchema` validates individual link fields |
| **Future: API** | Schemas can be reused for any server-side validation |

### Why both TS + Zod?

TypeScript types vanish at runtime. Zod schemas catch malformed JSON imports, corrupted localStorage data, or invalid user input *at runtime* with descriptive error messages.

---

## Data Flow

```
┌──────────────┐     ┌────────────────┐     ┌──────────────────┐
│  Visual       │────▶│  Zustand Store  │────▶│  Bio Page        │
│  Editor       │     │  (+ localStorage│     │  Preview         │
│  (forms,      │     │   persistence)  │     │  (real-time)     │
│  color picker,│     │                 │     │                  │
│  drag & drop) │     └───────┬─────────┘     └──────────────────┘
└──────────────┘             │
                             │ export
                             ▼
                    ┌─────────────────┐
                    │  profile.json   │
                    │  (download/     │
                    │   import)       │
                    └────────┬────────┘
                             │ static build
                             ▼
                    ┌─────────────────┐
                    │  Static HTML    │
                    │  (ZIP export)   │
                    │  Deploy anywhere│
                    └─────────────────┘
```

### No Database — By Design

- User config = JSON in `localStorage` (and exportable as `profile.json`)
- The exported bio page is self-contained static HTML
- Zero infrastructure requirements = free hosting everywhere

---

## Component Architecture

### UI Primitives (`src/components/ui/`)

All primitives use [Radix UI](https://www.radix-ui.com/) for accessibility:

| Component | Radix Primitive | Key Feature |
|---|---|---|
| Button | `@radix-ui/react-slot` | `asChild` composition pattern |
| Toggle | `@radix-ui/react-switch` | Keyboard accessible toggle |
| Modal | `@radix-ui/react-dialog` | Focus trapping, ESC dismiss |
| Tooltip | `@radix-ui/react-tooltip` | Configurable delay/position |
| Tabs | `@radix-ui/react-tabs` | Arrow-key navigation |
| ColorPicker | `@radix-ui/react-popover` | Popover + react-colorful |

### Social Icons (`src/components/preview/SocialIcon.tsx`)

The `detectSocialIcon(url)` utility pattern-matches URLs against 35+ known platforms. The `SocialIcon` component renders the appropriate SVG from Simple Icons or falls back to a Lucide icon.

---

## Key Files Reference

| File | Responsibility |
|---|---|
| `src/lib/store.ts` | Zustand store with all actions |
| `src/lib/schema.ts` | Zod runtime validation |
| `src/lib/themes.ts` | 7 theme preset definitions |
| `src/lib/utils.ts` | URL detection, sanitization, class merging |
| `src/lib/hooks/useThemeBridge.ts` | Syncs theme state → CSS variables |
| `src/lib/config-io.ts` | JSON import/export utilities |
| `src/types/index.ts` | All TypeScript interfaces |
| `src/app/globals.css` | Tailwind v4 design system + theme variables |
| `src/app/layout.tsx` | Root layout + FOUC prevention script |
| `data/profile.json` | Example user configuration |
