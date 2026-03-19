# Blue Connect Eikaiwa — UI/UX Redesign Design

**Date:** 2026-03-19
**Approach:** Component-First Upgrade (Approach A)
**Personality:** Warm & Inviting
**Animation level:** Expressive & Playful

---

## 1. Color Palette & Design Tokens

### Primary (Blue family)
- Primary: `oklch(0.55 0.2 250)` — Rich, trustworthy blue
- Primary Light: `oklch(0.70 0.15 250)` — Hover states, subtle backgrounds
- Primary Dark: `oklch(0.40 0.22 250)` — Active states, emphasis

### Accent (Warm Amber/Orange)
- Accent: `oklch(0.75 0.18 75)` — Warm amber for CTAs, highlights, achievements
- Accent Light: `oklch(0.88 0.12 75)` — Badges, soft backgrounds
- Accent Dark: `oklch(0.62 0.20 75)` — Hover on accent buttons

### Supporting Colors
- Success: `oklch(0.65 0.18 155)` — Green for progress, completions
- Info: `oklch(0.70 0.12 230)` — Soft blue for tips, info badges
- Warning: `oklch(0.78 0.15 85)` — Yellow-amber for alerts

### Surfaces
- Background: `oklch(0.985 0.005 250)` — Very faint blue-tinted white
- Card: Pure white with soft blue-tinted shadow
- Sidebar: `oklch(0.97 0.01 250)` — Barely-there blue tint
- Dashboard background: `oklch(0.965 0.008 250)` — Subtle warmth

### Dark Mode
Same hue angles, adjusted lightness/chroma for comfortable dark reading.

### Typography
- Primary font: Inter (clean, readable, great for Japanese mixed with English)
- Hero titles: Bold, text-5xl to text-7xl on desktop
- Body: Relaxed line-height for readability

---

## 2. Landing Page — Full Storytelling Flow

### 2.1 Navbar (upgraded)
- Sticky with backdrop blur + subtle bottom border on scroll
- Logo with blue accent mark
- Nav links with animated underline on hover
- Amber CTA button always visible
- Mobile: hamburger -> slide-in sheet with staggered animation

### 2.2 Hero
- Left: Large headline with key phrase in blue gradient text. Subtitle. Two CTAs: primary amber "Start Free" + outline "Watch Demo"
- Right: Illustrated mockup of AI chat interface with floating message bubbles that animate in
- Background: Subtle radial gradient (blue -> transparent) + soft floating shapes
- Animated counter stats below: "5,000+ learners", "50+ tutors", "98% satisfaction"

### 2.3 Problem Statement ("The Challenge")
- Empathetic copy: "You want to learn English, but..."
- 3 pain point cards with icons, staggered fade-in: cost, scheduling, confidence
- Warm, slightly darker background for contrast

### 2.4 Solution ("Blue Connect solves it")
- Transition back to light background
- 3 solution cards answering each pain point
- Icon + title + description + hover lift effect
- Connected with visual flow motif

### 2.5 Features Deep Dive
- 3 feature blocks, alternating layout (image left/right):
  - AI English Partner — chat interface preview
  - Structured Courses — course card grid preview
  - Live Tutoring — video call mockup, tutor profiles
- Each block fades/slides in on scroll

### 2.6 How It Works
- Horizontal stepper (vertical on mobile), 4 steps
- Numbered circles connected by animated progress line
- Sequential reveal on scroll

### 2.7 Social Proof
- Testimonial carousel with photos, quotes, star ratings
- Soft blue gradient background
- Auto-rotating, pausable

### 2.8 Final CTA + Footer
- Bold headline CTA
- Large amber button with hover glow
- Footer: links, copyright, social icons

---

## 3. Dashboard — Full Overhaul

### 3.1 Sidebar (redesigned)
- Collapsible: full width with labels or icon-only with tooltips
- User profile section at top: avatar, name, plan badge
- Grouped navigation:
  - Learn: Dashboard, AI Chat, AI Voice, Courses
  - Connect: Lessons, Tutors
  - Track: Progress, Settings
- Active state: blue left border + blue-tinted background
- Bottom: streak counter or daily goal indicator
- Mobile: slide-in sheet with overlay

### 3.2 Header (redesigned)
- Breadcrumb trail
- Right side: notification bell, streak fire icon, language toggle, avatar dropdown
- Expandable search bar

### 3.3 Dashboard Overview Page
**2-column on desktop, single column mobile**

**Top row — Welcome + Daily Goal:**
- Time-aware personalized greeting
- Daily goal ring (circular progress)
- Current streak with fire icon

**Stats row — 4 metric cards:**
- Study time (mini sparkline)
- Lessons completed (vs last week)
- Words learned (animated counter)
- Next lesson countdown (tutor avatar)
- Colored top border accents (blue, green, amber, purple)

**Main content area:**
- Continue Learning: horizontal scroll of in-progress courses
- Upcoming Lessons: next 2-3 with tutor info + join button
- Recent Activity Feed: timeline of actions
- Quick Actions: "Start AI Chat", "Find a Tutor", "Browse Courses"

**Right sidebar (desktop):**
- Achievements: recent badges
- Weekly Goal Progress: bar/ring chart
- Recommended: 1-2 suggested courses/tutors

---

## 4. Shared Components

### New Components
- **AnimatedCounter** — count-up on scroll into view
- **ProgressRing** — circular SVG with animated fill
- **StatCard** — colored border, icon, metric, label, trend
- **SectionReveal** — Framer Motion scroll-triggered reveal wrapper
- **TestimonialCarousel** — auto-rotating with fade transitions
- **StepperTimeline** — horizontal/vertical stepper with animated line
- **FeatureBlock** — alternating image/text layout
- **QuickActionCard** — large tappable card with hover lift
- **ActivityFeed** — timeline with icons and timestamps

### Animation Stack
- **Framer Motion** as sole animation library
- `motion.div` with `initial`, `whileInView`, `transition` for scroll reveals
- `useInView` hook for triggering counters
- `AnimatePresence` for page/modal transitions
- `stagger` (0.1s) for card grid reveals
- `spring` physics for hover lifts and bounces

### Responsive Strategy
- Mobile-first throughout
- Sidebar -> sheet overlay on mobile
- Stats: 2x2 mobile, 4-column desktop
- Features: stacked mobile, alternating desktop
- Hero: stacked mobile (text above, mockup below)
- Testimonials: full-width swipeable on mobile

---

## 5. Dependencies to Add
- `framer-motion` — animation library
- `@fontsource/inter` or Next.js font optimization for Inter
