# UI/UX Audit Redesign — Design Document

**Date:** 2026-03-19
**Approach:** Structural Redesign + Visual Polish + i18n Fixes
**Scope:** Landing page restructure, dashboard elevation, shared component upgrades

---

## 1. Landing Page — Structural Redesign

### 1.1 Hero (reworked)
- Split layout: left headline + CTAs, right CSS-only chat mockup with animated message bubbles
- Floating glassmorphism stats bar below hero bridging to next section
- Animated gradient mesh background

### 1.2 Problem + Solution (merged)
- 3-column "before/after" layout: pain point card (red) on top, arrow, solution card (blue) below
- Single heading: "Blue Connect transforms your learning"
- Halves vertical space, doubles impact

### 1.3 Features (interactive tabbed preview)
- 3 tabs: AI Partner | Courses | Live Tutoring
- Left: text content with bullet points
- Right: CSS-only mockup per tab (chat interface, course grid, video call)
- Animated tab transitions via Framer Motion

### 1.4 How It Works (connected stepper)
- Keep 4 steps, add connecting line between numbered circles
- Line animates as user scrolls
- Glassmorphism step cards

### 1.5 Testimonials (card grid)
- Replace carousel with 3-column card grid showing all testimonials
- Each card: quote, avatar initials, name, role, stars
- Glassmorphism styling with hover lift

### 1.6 Footer (full redesign)
- 4-column layout: Logo+tagline+socials | Product | Company | Support
- Bottom bar: copyright + language toggle

---

## 2. Dashboard — Fixes & Visual Elevation

### 2.1 i18n Fixes
- Sidebar group labels: "Learn"/"Connect"/"Track" → "学ぶ"/"つながる"/"記録"
- Streak text: "day streak" → "日連続" (already done in translations, fix component)
- Header: "Dashboard" → i18n'd
- Activity feed: all entries i18n'd

### 2.2 Visual Elevation
- Stat cards: glassmorphism effect (backdrop-blur, bg-white/70, ring-white/20)
- Quick action cards: colored left border matching icon color
- Welcome section: subtle gradient banner background
- Activity feed: timeline-style dots with connecting vertical line
- Cards overall: layered shadows (shadow-sm + ring-1 ring-black/5)

### 2.3 Sidebar Polish
- Group labels i18n'd
- Smoother collapse animation with Framer Motion layout
- Collapsed dividers: dot separator instead of h-px line

---

## 3. New Shared Components

- **ChatMockup** — CSS-only chat UI with animated message bubbles
- **CourseMockup** — CSS-only course card grid with progress bars
- **VideoMockup** — CSS-only video call layout with avatars
- **FeatureTabs** — Tabbed interface with animated content swap
- **GlassCard** — Reusable glassmorphism wrapper
- **FooterNav** — 4-column footer with link groups
- **TimelineItem** — Activity feed item with dot + line

### CSS Additions
- `.glass` utility for glassmorphism
- `.bg-gradient-mesh` for animated hero background
- `.shadow-elevated` for layered card depth
- Colored left-border variants for quick action cards

### i18n Additions
- Sidebar group labels (ja/en)
- Activity feed entries (ja/en)
- Dashboard header label (ja/en)
- Footer link labels (ja/en)
