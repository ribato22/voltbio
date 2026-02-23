# Contributing to VoltBio

Thank you for your interest in contributing to VoltBio! 💜 This document provides guidelines and steps for contributing.

---

## 📋 Code of Conduct

By participating in this project, you agree to uphold the following principles:

- **Be respectful** — Treat everyone with dignity and kindness
- **Be constructive** — Provide helpful, actionable feedback
- **Be inclusive** — Welcome people of all backgrounds and skill levels
- **Be patient** — Remember that everyone is volunteering their time

Harassment, trolling, and discrimination of any kind will not be tolerated.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** (comes with Node.js)
- **Git**

### Setting Up the Development Environment

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/link-in-bio.git
cd link-in-bio

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open http://localhost:3000 in your browser
```

### Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build static export to `out/` |
| `npm run lint` | Run ESLint |
| `npm run lint -- --fix` | Auto-fix linting issues |

---

## 🔧 How to Contribute

### Reporting Bugs

1. Search [existing issues](../../issues) to avoid duplicates
2. Open a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs. actual behavior
   - Browser and OS information
   - Screenshots if applicable

### Suggesting Features

1. Open a new [issue](../../issues/new) with the `enhancement` label
2. Describe the feature and why it would be useful
3. Include mockups or examples if possible

### Submitting Code

#### Workflow

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Make your changes** following the style guide below
4. **Test** your changes:
   ```bash
   npm run build    # Ensure it compiles
   npm run lint     # Ensure no lint errors
   ```
5. **Commit** with a clear message:
   ```bash
   git commit -m "feat: add new theme preset"
   ```
6. **Push** and open a **Pull Request**

#### Branch Naming

| Prefix | Use |
|--------|-----|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation |
| `refactor/` | Code refactoring |
| `style/` | Styling changes |

#### Commit Messages

Follow [Conventional Commits](https://conventionalcommits.org):

```
feat: add sunrise theme preset
fix: correct avatar upload size validation
docs: update deployment instructions
refactor: simplify theme bridge logic
```

---

## 🎨 Style Guide

- **TypeScript** — All code must be typed. Avoid `any`.
- **Tailwind CSS v4** — Use CSS custom properties via `var(--lf-*)` for theme-aware styling
- **Radix UI** — Use Radix primitives for interactive components (accessibility built-in)
- **Framer Motion** — Use for animations. Prefer `whileHover`/`whileTap` for interactions
- **Zustand** — All state changes go through the store. No prop drilling.
- **Naming** — PascalCase for components, camelCase for functions/variables
- **File organization** — One component per file, colocate related files

---

## 📁 Project Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for a detailed overview of:
- State management (Zustand + localStorage)
- Styling system (Tailwind v4 + CSS custom properties)
- Data flow and validation (Zod schemas)

---

## 💜 Thank You!

Every contribution, no matter how small, makes VoltBio better. Whether you're fixing a typo or adding a major feature — **you're awesome** and we appreciate your time.

Questions? Open an issue and we'll help you get started!
