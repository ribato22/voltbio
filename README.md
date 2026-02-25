<div align="center">

# ⚡ VoltBio

### The most powerful zero-backend link-in-bio builder on the planet.

**Build → Customize → Export → Deploy. No server. No database. No limits.**

[![v2.0.0](https://img.shields.io/badge/Release-v2.0.0-a78bfa?style=flat-square)](https://github.com/ribato22/voltbio/releases/tag/v2.0.0)
[![MIT License](https://img.shields.io/badge/License-MIT-violet.svg?style=flat-square)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](#-pwa-install--offline-mode)

<br />

**🎬 [Live Demo](https://ribato22.github.io/voltbio/)** · **[Open Editor](https://ribato22.github.io/voltbio/editor)** · **[Download Latest](https://github.com/ribato22/voltbio/releases/tag/v2.0.0)**

<br />

</div>

---

## 💡 Why VoltBio?

Most link-in-bio tools lock you into monthly subscriptions, track your visitors, and own your data. **VoltBio takes a radically different approach:**

- 🔒 **Your data stays in your browser** — all config lives in `localStorage`, never on a server
- 📦 **Export a fully self-contained ZIP** — `index.html` + PWA files, ready to deploy anywhere
- 💰 **Zero cost forever** — no subscriptions, no premium tiers, no hidden fees
- 🚀 **Serverless architecture** — the exported site is pure static HTML/CSS with minimal vanilla JS

> **Think of VoltBio as Figma for link-in-bio pages** — design visually, export the production-ready artifact.

---

## 🌟 Key Features

### 🎨 Visual Editor
A split-pane editor with a live phone-frame preview. Every change reflects instantly — no save button, no reload.

### 🔗 Smart Link Management
- **Drag & Drop** with touch, mouse, and keyboard support (dnd-kit)
- **8 Block Types:** Regular Links, Section Headers, Smart Actions (WhatsApp template), Donation/QRIS, Portfolio Grid, Lead Forms, Countdown Timers, FAQ Accordion
- **Scheduled Links** with valid-from/valid-until date ranges
- **Password-Protected Links** with AES-256 client-side encryption

### 🎭 Themes & Customization
- **7 Curated Presets** — Midnight Violet, Deep Ocean, Emerald Forest, Golden Sunset, Neon Nights, Minimal Light, Clean Slate
- **Full Color Control** — 5 color pickers (background, text, accent, card, hover)
- **4 Button Styles** — Rounded, Pill, Square, Outline
- **8 Background Patterns** — Gradient, Dots, Grid, Circuit, Waves, Topography, Hexagons
- **Custom CSS Injection** — power-user styling scoped to the bio page
- **20+ Google Fonts** with smart fallback stacks

### 📱 PWA Install & Offline Mode
Exported sites can be **installed as native apps** on mobile home screens. The generated ZIP includes:
- `manifest.json` with themed colors and avatar icons
- `service-worker.js` with Cache-first strategy for offline access
- Apple `meta` tags for iOS home screen support

### ❓ Interactive FAQ Accordion
Add expandable Q&A sections using pure `<details>/<summary>` HTML — **zero JavaScript**, ultra-lightweight, works everywhere.

### 🔍 Smart Search Bar
A real-time search filter for visitors with many links. Powered by a ~10-line vanilla JS inline script in the export. Searches link titles and FAQ content.

### ☕ Donation & Tip Jar
Support your audience with:
- **QRIS** code display (Indonesia's universal payment QR)
- **Saweria, Trakteer, Ko-fi, Patreon, Buy Me a Coffee** integration
- Custom CTA text with themed styling

### 🖼️ Portfolio / Image Grid
Masonry-style image gallery with:
- **Canvas API compression** for optimal file size
- Configurable **2/3/4 column** layouts with adjustable gap
- **Lightbox viewer** with caption overlay

### ✉️ Lead Capture Forms
Collect leads without a backend:
- **FormSubmit.co** and **Web3Forms** provider support
- Configurable fields (name, email, phone, message)
- Custom submit CTA and thank-you message

### ⏰ Countdown Timer
Event countdowns with 3 visual styles:
- **Minimal** — clean text-based
- **Card** — bordered digit boxes
- **Flip** — retro flip-clock aesthetic

### ⚡ Smart Action Buttons
WhatsApp template messages with dynamic form fields. Visitors fill in a mini-form → VoltBio generates the pre-filled `wa.me` link automatically.

### 📇 vCard Contact Download
One-tap `.vcf` file generation — visitors can save your contact info directly to their phone.

### 🔑 Password-Protected Links
Client-side **AES-GCM 256-bit encryption** via the Web Crypto API. Zero backend, zero key transmission — the password never leaves the visitor's browser.

### 📊 Analytics Ready
Optional **Umami** analytics integration — privacy-friendly, open-source tracking with a single ID.

### 🌐 Multi-Page Hub
Organize links into tabbed pages — create separate sections for "Social", "Portfolio", "Shop", etc.

### 💬 Floating Action Button
A fixed-position contact button (WhatsApp, Email, Phone, or URL) with hover animation and themed styling.

### ⭐ Testimonials
Social proof section with star ratings and customer reviews.

### 🔍 SEO Optimization
- Open Graph & Twitter Card meta tags
- Customizable title, description, and OG image
- Content Security Policy headers
- Live WhatsApp & Twitter social preview cards in the editor

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Static Export) |
| **Language** | [TypeScript 5](https://typescriptlang.org) |
| **UI Library** | [React 19](https://react.dev) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) (CSS-first config) |
| **State** | [Zustand 5](https://github.com/pmndrs/zustand) + localStorage persist |
| **UI Primitives** | [Radix UI](https://radix-ui.com) (Switch, Dialog, Tabs, Tooltip, Popover) |
| **Animations** | [Framer Motion 12](https://motion.dev) |
| **Drag & Drop** | [dnd-kit](https://dndkit.com) |
| **Validation** | [Zod 4](https://zod.dev) |
| **Export** | [JSZip](https://stuk.github.io/jszip/) + [FileSaver](https://github.com/eligrey/FileSaver.js) |
| **Encryption** | Web Crypto API (AES-GCM 256-bit) |
| **QR Code** | [qrcode](https://www.npmjs.com/package/qrcode) |

---

## 📋 How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  1. DESIGN  │ ──▶ │ 2. CUSTOMIZE │ ──▶ │  3. EXPORT  │ ──▶ │  4. DEPLOY   │
│             │     │              │     │             │     │              │
│ Visual      │     │ Themes,      │     │ Download    │     │ Drag & drop  │
│ editor with │     │ colors,      │     │ ZIP with    │     │ to Vercel,   │
│ live phone  │     │ fonts,       │     │ index.html  │     │ Netlify, or  │
│ preview     │     │ patterns     │     │ + PWA files │     │ GitHub Pages │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
```

**The exported ZIP contains:**
- `index.html` — self-contained page with inline CSS, fonts, SEO tags, and all content
- `manifest.json` — PWA manifest with themed colors and avatar icons *(when PWA enabled)*
- `service-worker.js` — offline-first caching strategy *(when PWA enabled)*

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18+
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/ribato22/voltbio.git
cd voltbio

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page, then navigate to `/editor` to start building.

### Build for Production

```bash
# Generate static export → out/
npm run build

# Preview the static build locally
npx serve out
```

---

## 🌍 Deployment

VoltBio exports as a **fully static site** — deploy it anywhere for free:

### Option A: Deploy the Editor (for yourself)

| Platform | Instructions |
|----------|-------------|
| **Vercel** | Push to GitHub → [vercel.com/new](https://vercel.com/new) → Import repo → Done |
| **GitHub Pages** | Push to GitHub → Settings → Pages → main branch (GitHub Actions handles the rest) |

### Option B: Deploy an Exported Bio Page (for your audience)

| Platform | Instructions |
|----------|-------------|
| **Netlify Drop** | [app.netlify.com/drop](https://app.netlify.com/drop) → Drag the exported ZIP contents |
| **Vercel Upload** | [vercel.com/new](https://vercel.com/new) → Upload → Drag the unzipped folder |
| **GitHub Pages** | Create a repo → Push the exported files → Enable Pages |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── editor/page.tsx          # Split-pane visual editor
│   ├── preview/page.tsx         # Full-screen bio preview
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Tailwind v4 design system
├── components/
│   ├── editor/
│   │   ├── ProfileEditor.tsx    # Name, bio, avatar management
│   │   ├── LinkEditor.tsx       # Drag & drop link management (8 block types)
│   │   ├── ThemeEditor.tsx      # Presets, colors, fonts, patterns
│   │   ├── SeoEditor.tsx        # SEO, analytics, FAB, search, PWA config
│   │   └── DeployModal.tsx      # Export + deployment instructions
│   ├── preview/
│   │   ├── BioPage.tsx          # Animated bio page renderer
│   │   └── SocialIcon.tsx       # Auto-detected social platform icons
│   └── ui/                      # Radix UI primitive wrappers
├── lib/
│   ├── store.ts                 # Zustand store with localStorage persistence
│   ├── export.ts                # Static site ZIP generator (HTML + PWA)
│   ├── crypto.ts                # AES-256 link encryption/decryption
│   ├── vcard.ts                 # vCard 3.0 contact file generator
│   ├── config-io.ts             # JSON import/export/clipboard
│   ├── schema.ts                # Zod validation for all config shapes
│   ├── themes.ts                # 7 curated theme presets
│   ├── patterns.ts              # 8 SVG background patterns
│   ├── embed.ts                 # YouTube/Spotify/SoundCloud embed detection
│   ├── fonts.ts                 # Google Fonts URL builder + fallbacks
│   ├── image-utils.ts           # Canvas API image compression
│   └── hooks/useThemeBridge.ts  # Live CSS variable synchronization
└── types/index.ts               # TypeScript interfaces (19 types)
```

---

## 🏷️ Version History

| Version | Codename | Highlights |
|---------|----------|-----------|
| **v2.0.0** | The App & Discovery Update | PWA Install & Offline, FAQ Accordion, Smart Search Bar |
| **v1.9.0** | — | Floating Action Button, lead form fix, countdown fix |
| **v1.8.0** | The Creator's Toolkit | Countdown Timer, Lead Form, Portfolio Grid, QR Code |
| **v1.5.0** | The Discovery Update | Social preview cards, embed detection, custom CSS |
| **v1.0.0** | Initial Release | Visual editor, 7 themes, ZIP export, SEO, deploy modal |

---

## 🤝 Contributing

Contributions are what make the open-source community amazing! Whether it's a bug report, feature request, or code contribution — **every bit helps** 💜

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — use it, modify it, share it freely.

---

<div align="center">

**Built with 💜 for creators, by creators.**

**⭐ Star this repo** if VoltBio helped you build something awesome!

[Report Bug](https://github.com/ribato22/voltbio/issues) · [Request Feature](https://github.com/ribato22/voltbio/issues) · [Live Demo](https://ribato22.github.io/voltbio/)

</div>
