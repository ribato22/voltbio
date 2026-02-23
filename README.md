<div align="center">

# ⚡ VoltBio

### Build your Link-in-Bio page in seconds. No backend. No database. Just pure magic.

[![MIT License](https://img.shields.io/badge/License-MIT-violet.svg)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Deploy](https://img.shields.io/badge/Deploy-GitHub_Pages-222?logo=github)](https://github.com)

<br />

<!-- Replace with actual screenshot -->
> **🎬 Live Demo**: _Deploy this project to see it in action!_

<br />

</div>

---

## ✨ What is VoltBio?

VoltBio is a **free, open-source, client-side** link-in-bio builder. Design a stunning personal link page with a visual editor, then export it as a self-contained static site — ready to deploy anywhere in seconds.

**Zero backend. Zero database. Zero cost.**

All your data lives in your browser's `localStorage`. When you're ready to publish, VoltBio generates a single `index.html` file with **inline CSS, SEO tags, and Open Graph metadata** — packaged as a ZIP you can drag-and-drop to any hosting platform.

---

## 🚀 Key Features

| Feature | Description |
|---------|------------|
| 🎨 **Visual Editor** | Split-pane editor with live preview in a phone frame |
| 🔗 **Drag & Drop Links** | Reorder links with touch, mouse, and keyboard support (dnd-kit) |
| 🎭 **7 Theme Presets** | Clean Slate, Midnight Violet, Deep Ocean, Emerald Forest, Golden Sunset, Neon Nights, Minimal Light |
| 🎨 **Custom Colors** | 5 color pickers for background, text, accent, card, and hover |
| 🔘 **4 Button Styles** | Rounded, Pill, Square, Outline |
| ✨ **Micro-Animations** | Spring-animated avatar, staggered link entrances, glow-on-hover |
| 📱 **Fully Responsive** | Works perfectly on desktop, tablet, and mobile |
| 📦 **ZIP Export** | Self-contained HTML with inline CSS — no build tools needed |
| 🔍 **SEO Ready** | Title, description, Open Graph, Twitter Cards injected automatically |
| 🛡️ **CSP Headers** | Content Security Policy for static exports |
| ♿ **Accessible** | Radix UI primitives, ARIA labels, keyboard navigation throughout |
| 🌐 **Deploy Anywhere** | Vercel, Netlify, GitHub Pages — guided instructions included |
| 📥 **Import/Export JSON** | Backup and restore your entire configuration |
| 📊 **Analytics Ready** | Optional Umami analytics integration |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 15](https://nextjs.org) (App Router, Static Export) |
| **Language** | [TypeScript 5](https://typescriptlang.org) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) (CSS-first, OKLCH palette) |
| **State** | [Zustand](https://github.com/pmndrs/zustand) + localStorage persist |
| **UI Primitives** | [Radix UI](https://radix-ui.com) (Switch, Dialog, Tabs) |
| **Animations** | [Framer Motion](https://motion.dev) |
| **Drag & Drop** | [dnd-kit](https://dndkit.com) |
| **Validation** | [Zod](https://zod.dev) |
| **Export** | [JSZip](https://stuk.github.io/jszip/) + [FileSaver](https://github.com/eligrey/FileSaver.js) |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── editor/page.tsx          # Visual editor with split-pane layout
│   ├── preview/page.tsx         # Full-screen bio page preview
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout + CSP + FOUC prevention
│   └── globals.css              # Tailwind v4 design system
├── components/
│   ├── editor/
│   │   ├── ProfileEditor.tsx    # Name, bio, avatar upload
│   │   ├── LinkEditor.tsx       # Drag-and-drop link management
│   │   ├── ThemeEditor.tsx      # Presets, colors, button styles
│   │   ├── SeoEditor.tsx        # SEO & settings
│   │   └── DeployModal.tsx      # Export + deploy instructions
│   ├── preview/
│   │   ├── BioPage.tsx          # Animated bio page renderer
│   │   └── SocialIcon.tsx       # Auto-detected social icons
│   └── ui/                      # 8 Radix UI primitives
├── lib/
│   ├── store.ts                 # Zustand store + localStorage
│   ├── export.ts                # Static site ZIP generator
│   ├── config-io.ts             # JSON import/export/clipboard
│   ├── schema.ts                # Zod validation schemas
│   ├── themes.ts                # 7 theme presets
│   ├── hooks/useThemeBridge.ts  # Live CSS variable sync
│   └── utils.ts                 # URL sanitization, icon detection
└── types/index.ts               # TypeScript interfaces
```

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18+
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/link-in-bio.git
cd link-in-bio

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

VoltBio exports as a static site — deploy it anywhere for free:

### Vercel (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new) → click **Upload**
2. Drag the `out/` folder (after `npm run build`)
3. Live in seconds at `your-project.vercel.app` ✨

### Netlify

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag-and-drop the `out/` folder
3. Live at `your-site.netlify.app` 🚀

### GitHub Pages

Push to GitHub and enable Pages in **Settings → Pages → main branch**. The included GitHub Actions workflow handles the rest automatically.

---

## 🤝 Contributing

Contributions are what make the open-source community amazing! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Whether it's a bug report, feature request, or code contribution — **every bit helps** 💜

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — use it, modify it, share it freely.

---

<div align="center">

**Built with 💜 by the community, for the community.**

⭐ **Star this repo** if you find it useful!

</div>
