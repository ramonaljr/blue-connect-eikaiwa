# UI/UX Audit Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix critical visual gaps (empty placeholders, i18n issues) and elevate visual quality (glassmorphism, CSS mockups, structural redesign) across landing page and dashboard.

**Architecture:** Structural redesign of landing page (merged problem/solution, tabbed features, CSS mockups, full footer), dashboard visual elevation (glassmorphism cards, i18n fixes, timeline activity feed), and new CSS utilities.

**Tech Stack:** Next.js 15, Tailwind CSS v4, shadcn/ui, Framer Motion, next-intl, lucide-react

---

## Task 1: Add CSS Utilities for Glassmorphism & Elevated Shadows

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add new utility classes after the existing `@layer utilities` block content (inside it)**

Add these classes inside the existing `@layer utilities { ... }` block in `src/app/globals.css`, after the `.shadow-card` class:

```css
  .glass {
    @apply backdrop-blur-md bg-white/60 ring-1 ring-white/20;
  }
  .dark .glass {
    @apply bg-white/5 ring-white/10;
  }
  .shadow-elevated {
    box-shadow: 0 1px 3px oklch(0.55 0.2 250 / 0.04), 0 4px 16px oklch(0.55 0.2 250 / 0.06);
  }
  .bg-gradient-mesh {
    background:
      radial-gradient(ellipse 60% 40% at 10% 0%, oklch(0.55 0.2 250 / 0.08), transparent),
      radial-gradient(ellipse 50% 50% at 90% 20%, oklch(0.75 0.18 75 / 0.06), transparent),
      radial-gradient(ellipse 70% 30% at 50% 100%, oklch(0.55 0.2 250 / 0.04), transparent);
  }
```

**Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "style: add glass, shadow-elevated, and gradient-mesh CSS utilities"
```

---

## Task 2: Add i18n Strings for Sidebar Groups, Activity Feed, Footer, Feature Tabs

**Files:**
- Modify: `src/messages/en.json`
- Modify: `src/messages/ja.json`

**Step 1: Add new keys to en.json**

Add under `"nav"` object:
```json
"sidebarGroups": {
  "learn": "Learn",
  "connect": "Connect",
  "track": "Track"
}
```

Add under `"dashboard"` object:
```json
"activity": {
  "aiPractice": "Completed AI conversation practice",
  "courseFinished": "Finished Course: Basic Greetings",
  "badgeEarned": "Earned badge: First Steps",
  "timeAgo2h": "2h ago",
  "timeAgo1d": "1d ago",
  "timeAgo2d": "2d ago"
}
```

Add under `"landing"` object:
```json
"transform": {
  "title": "Your challenges, solved"
},
"featureTabs": {
  "ai": {
    "bullets": {
      "1": "24/7 conversation practice",
      "2": "Real-time pronunciation feedback",
      "3": "Roleplay scenarios for real situations",
      "4": "Adapts to your level automatically"
    }
  },
  "courses": {
    "bullets": {
      "1": "CEFR-aligned A1 to C2 levels",
      "2": "Interactive exercises and quizzes",
      "3": "Track progress with completion badges",
      "4": "Learn at your own pace"
    }
  },
  "tutors": {
    "bullets": {
      "1": "Certified and community tutors",
      "2": "Video calls powered by Daily.co",
      "3": "Book lessons that fit your schedule",
      "4": "Get personalized feedback"
    }
  }
}
```

Add under `"landing"` object:
```json
"footerNav": {
  "tagline": "Learn English with AI and real tutors",
  "product": "Product",
  "productLinks": {
    "features": "Features",
    "pricing": "Pricing",
    "courses": "Courses",
    "tutors": "Tutors"
  },
  "company": "Company",
  "companyLinks": {
    "about": "About",
    "blog": "Blog",
    "contact": "Contact"
  },
  "support": "Support",
  "supportLinks": {
    "help": "Help Center",
    "faq": "FAQ",
    "terms": "Terms of Service",
    "privacy": "Privacy Policy"
  }
}
```

**Step 2: Add corresponding Japanese translations to ja.json**

Add under `"nav"`:
```json
"sidebarGroups": {
  "learn": "学ぶ",
  "connect": "つながる",
  "track": "記録"
}
```

Add under `"dashboard"`:
```json
"activity": {
  "aiPractice": "AI英会話練習を完了",
  "courseFinished": "コース完了: 基本の挨拶",
  "badgeEarned": "バッジ獲得: はじめの一歩",
  "timeAgo2h": "2時間前",
  "timeAgo1d": "1日前",
  "timeAgo2d": "2日前"
}
```

Add under `"landing"`:
```json
"transform": {
  "title": "あなたの悩み、すべて解決"
},
"featureTabs": {
  "ai": {
    "bullets": {
      "1": "24時間いつでも英会話練習",
      "2": "リアルタイムの発音フィードバック",
      "3": "実際の場面を想定したロールプレイ",
      "4": "あなたのレベルに自動適応"
    }
  },
  "courses": {
    "bullets": {
      "1": "CEFR準拠のA1〜C2レベル",
      "2": "インタラクティブな演習とクイズ",
      "3": "達成バッジで進捗を追跡",
      "4": "自分のペースで学習"
    }
  },
  "tutors": {
    "bullets": {
      "1": "認定講師とコミュニティ講師",
      "2": "Daily.coによるビデオ通話",
      "3": "スケジュールに合わせて予約",
      "4": "パーソナライズされたフィードバック"
    }
  }
},
"footerNav": {
  "tagline": "AIとリアル講師で英語を学ぼう",
  "product": "プロダクト",
  "productLinks": {
    "features": "機能",
    "pricing": "料金",
    "courses": "コース",
    "tutors": "講師"
  },
  "company": "会社情報",
  "companyLinks": {
    "about": "会社概要",
    "blog": "ブログ",
    "contact": "お問い合わせ"
  },
  "support": "サポート",
  "supportLinks": {
    "help": "ヘルプセンター",
    "faq": "よくある質問",
    "terms": "利用規約",
    "privacy": "プライバシーポリシー"
  }
}
```

**Step 3: Commit**

```bash
git add src/messages/en.json src/messages/ja.json
git commit -m "content: add i18n strings for sidebar groups, activity feed, footer, feature tabs"
```

---

## Task 3: Create CSS-Only Mockup Components

**Files:**
- Create: `src/components/landing/chat-mockup.tsx`
- Create: `src/components/landing/course-mockup.tsx`
- Create: `src/components/landing/video-mockup.tsx`

**Step 1: Create ChatMockup component**

Create `src/components/landing/chat-mockup.tsx`:

```typescript
'use client'

import { motion } from 'framer-motion'

export function ChatMockup() {
  return (
    <div className="glass rounded-2xl p-4 shadow-elevated">
      <div className="mb-3 flex items-center gap-2 border-b border-border/50 pb-3">
        <div className="size-3 rounded-full bg-destructive/60" />
        <div className="size-3 rounded-full bg-accent/60" />
        <div className="size-3 rounded-full bg-[oklch(0.65_0.18_155)]/60" />
        <span className="ml-2 text-xs font-medium text-muted-foreground">AI English Chat</span>
      </div>
      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="ml-auto max-w-[75%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground"
        >
          How do I introduce myself at a business meeting?
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="max-w-[80%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm"
        >
          Great question! Here&apos;s a natural way: &ldquo;Hello, I&apos;m [name] from [company]. It&apos;s a pleasure to meet you.&rdquo;
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.3, duration: 0.3 }}
          className="flex gap-1.5 px-2"
        >
          <span className="size-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: '0ms' }} />
          <span className="size-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: '150ms' }} />
          <span className="size-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: '300ms' }} />
        </motion.div>
      </div>
    </div>
  )
}
```

**Step 2: Create CourseMockup component**

Create `src/components/landing/course-mockup.tsx`:

```typescript
export function CourseMockup() {
  const courses = [
    { title: 'Business English', level: 'B1', progress: 72, color: 'bg-primary' },
    { title: 'Daily Conversation', level: 'A2', progress: 45, color: 'bg-[oklch(0.65_0.18_155)]' },
    { title: 'TOEIC Prep', level: 'B2', progress: 30, color: 'bg-accent' },
  ]

  return (
    <div className="glass rounded-2xl p-4 shadow-elevated">
      <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-3">
        <span className="text-xs font-medium text-muted-foreground">My Courses</span>
        <span className="text-xs text-primary">3 active</span>
      </div>
      <div className="space-y-3">
        {courses.map((course) => (
          <div key={course.title} className="rounded-xl bg-background/60 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-medium">{course.title}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{course.level}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full ${course.color}`} style={{ width: `${course.progress}%` }} />
            </div>
            <span className="mt-1 text-xs text-muted-foreground">{course.progress}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 3: Create VideoMockup component**

Create `src/components/landing/video-mockup.tsx`:

```typescript
export function VideoMockup() {
  return (
    <div className="glass rounded-2xl p-4 shadow-elevated">
      <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-3">
        <span className="text-xs font-medium text-muted-foreground">Live Lesson</span>
        <span className="flex items-center gap-1.5 text-xs text-destructive">
          <span className="size-2 animate-pulse rounded-full bg-destructive" />
          LIVE
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex aspect-video flex-col items-center justify-center rounded-xl bg-primary/10">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary">
            S
          </div>
          <span className="mt-1.5 text-xs font-medium">Sarah T.</span>
          <span className="text-xs text-muted-foreground">Tutor</span>
        </div>
        <div className="flex aspect-video flex-col items-center justify-center rounded-xl bg-accent/10">
          <div className="flex size-12 items-center justify-center rounded-full bg-accent/20 text-lg font-bold text-accent">
            Y
          </div>
          <span className="mt-1.5 text-xs font-medium">You</span>
          <span className="text-xs text-muted-foreground">Learner</span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs">🎤</div>
        <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs">📹</div>
        <div className="flex size-8 items-center justify-center rounded-full bg-destructive/80 text-xs text-white">✕</div>
      </div>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add src/components/landing/
git commit -m "feat: add CSS-only mockup components (ChatMockup, CourseMockup, VideoMockup)"
```

---

## Task 4: Create FeatureTabs Component

**Files:**
- Create: `src/components/landing/feature-tabs.tsx`

**Step 1: Create the tabbed feature preview**

```typescript
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Sparkles, BookOpen, Video, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ChatMockup } from './chat-mockup'
import { CourseMockup } from './course-mockup'
import { VideoMockup } from './video-mockup'

const tabs = [
  { key: 'ai' as const, icon: Sparkles, mockup: ChatMockup },
  { key: 'courses' as const, icon: BookOpen, mockup: CourseMockup },
  { key: 'tutors' as const, icon: Video, mockup: VideoMockup },
] as const

export function FeatureTabs() {
  const [active, setActive] = useState(0)
  const t = useTranslations('landing')

  const ActiveMockup = tabs[active].mockup

  return (
    <div>
      {/* Tab buttons */}
      <div className="mb-8 flex justify-center gap-2">
        {tabs.map(({ key, icon: Icon }, i) => (
          <button
            key={key}
            onClick={() => setActive(i)}
            className={cn(
              'relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300',
              active === i
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {active === i && (
              <motion.div
                layoutId="feature-tab-bg"
                className="absolute inset-0 rounded-full bg-primary/10"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
            <Icon className="relative size-4" />
            <span className="relative">{t(`features.${key}.title`)}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="mb-3 text-2xl font-bold md:text-3xl">
                {t(`features.${tabs[active].key}.title`)}
              </h3>
              <p className="mb-6 text-lg text-muted-foreground">
                {t(`features.${tabs[active].key}.description`)}
              </p>
              <ul className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <li key={n} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="size-3 text-primary" />
                    </div>
                    <span className="text-sm">{t(`featureTabs.${tabs[active].key}.bullets.${n}`)}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="w-full max-w-sm flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <ActiveMockup />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/landing/feature-tabs.tsx
git commit -m "feat: add FeatureTabs component with animated tab switching and mockup previews"
```

---

## Task 5: Create FooterNav Component

**Files:**
- Create: `src/components/landing/footer-nav.tsx`

**Step 1: Create the 4-column footer**

```typescript
'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LanguageToggle } from '@/components/layout/language-toggle'

export function FooterNav() {
  const t = useTranslations('landing')
  const tc = useTranslations('common')

  const columns = [
    {
      title: t('footerNav.product'),
      links: [
        { label: t('footerNav.productLinks.features'), href: '/#features' },
        { label: t('footerNav.productLinks.pricing'), href: '/pricing' },
        { label: t('footerNav.productLinks.courses'), href: '/courses' },
        { label: t('footerNav.productLinks.tutors'), href: '/tutors' },
      ],
    },
    {
      title: t('footerNav.company'),
      links: [
        { label: t('footerNav.companyLinks.about'), href: '/about' },
        { label: t('footerNav.companyLinks.blog'), href: '/blog' },
        { label: t('footerNav.companyLinks.contact'), href: '/contact' },
      ],
    },
    {
      title: t('footerNav.support'),
      links: [
        { label: t('footerNav.supportLinks.help'), href: '/help' },
        { label: t('footerNav.supportLinks.faq'), href: '/faq' },
        { label: t('footerNav.supportLinks.terms'), href: '/terms' },
        { label: t('footerNav.supportLinks.privacy'), href: '/privacy' },
      ],
    },
  ]

  return (
    <footer className="border-t bg-[oklch(0.97_0.01_250)]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div>
            <Link href="/" className="text-lg font-bold text-primary">
              {tc('appName')}
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('footerNav.tagline')}
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <p className="text-xs text-muted-foreground">{t('footer.copyright')}</p>
          <LanguageToggle />
        </div>
      </div>
    </footer>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/landing/footer-nav.tsx
git commit -m "feat: add FooterNav component with 4-column layout and language toggle"
```

---

## Task 6: Rewrite Landing Page with Structural Redesign

**Files:**
- Modify: `src/app/[locale]/(public)/page.tsx`

**Step 1: Replace the entire landing page**

Replace the entire content of `src/app/[locale]/(public)/page.tsx` — this merges problem/solution, replaces features with tabbed preview, shows all testimonials as grid, adds hero chat mockup, uses FooterNav:

```typescript
'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  UserPlus, ClipboardCheck, Rocket, TrendingUp,
  Wallet, Clock, ShieldCheck, Star, ArrowRight, ArrowDown, Check,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  SectionReveal, StaggerContainer, StaggerItem, AnimatedCounter,
} from '@/components/ui/motion'
import { motion } from 'framer-motion'
import { ChatMockup } from '@/components/landing/chat-mockup'
import { FeatureTabs } from '@/components/landing/feature-tabs'
import { FooterNav } from '@/components/landing/footer-nav'

const steps = [
  { key: 'step1' as const, icon: UserPlus, step: 1 },
  { key: 'step2' as const, icon: ClipboardCheck, step: 2 },
  { key: 'step3' as const, icon: Rocket, step: 3 },
  { key: 'step4' as const, icon: TrendingUp, step: 4 },
]

const transformPairs = [
  { key: 'cost' as const, icon: Wallet },
  { key: 'schedule' as const, icon: Clock },
  { key: 'confidence' as const, icon: ShieldCheck },
]

const testimonials = ['1', '2', '3'] as const

export default function HomePage() {
  const t = useTranslations('landing')

  return (
    <main className="flex flex-col overflow-x-hidden">
      {/* Hero — Split Layout */}
      <section className="relative px-4 py-20 md:py-32">
        <div className="bg-gradient-mesh absolute inset-0 -z-10" />
        <div className="container mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row">
          <div className="flex-1 text-center md:text-left">
            <SectionReveal>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                {t('hero.title').split('AI').map((part, i, arr) =>
                  i < arr.length - 1 ? (
                    <span key={i}>
                      {part}
                      <span className="text-gradient-blue">AI</span>
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </h1>
            </SectionReveal>
            <SectionReveal delay={0.15}>
              <p className="mt-4 max-w-lg text-lg text-muted-foreground md:text-xl">
                {t('hero.subtitle')}
              </p>
            </SectionReveal>
            <SectionReveal delay={0.3}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row md:justify-start justify-center">
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'bg-accent px-8 text-accent-foreground hover:bg-accent/90'
                  )}
                >
                  {t('hero.cta')}
                  <ArrowRight className="ml-1 size-4" />
                </Link>
                <Link href="/pricing" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                  {t('footer.cta')}
                </Link>
              </div>
            </SectionReveal>
          </div>
          <SectionReveal delay={0.2} direction="right" className="w-full max-w-md flex-1">
            <ChatMockup />
          </SectionReveal>
        </div>
      </section>

      {/* Stats Bar — Glassmorphism Bridge */}
      <section className="px-4 -mt-8 relative z-10">
        <SectionReveal>
          <div className="container mx-auto max-w-3xl">
            <div className="glass flex flex-wrap items-center justify-center gap-8 rounded-2xl px-8 py-6 shadow-elevated md:gap-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  <AnimatedCounter target={5000} suffix="+" />
                </div>
                <p className="text-sm text-muted-foreground">{t('stats.learnersLabel')}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  <AnimatedCounter target={50} suffix="+" />
                </div>
                <p className="text-sm text-muted-foreground">{t('stats.tutorsLabel')}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  <AnimatedCounter target={98} suffix="%" />
                </div>
                <p className="text-sm text-muted-foreground">{t('stats.satisfactionLabel')}</p>
              </div>
            </div>
          </div>
        </SectionReveal>
      </section>

      {/* Problem + Solution — Merged Before/After */}
      <section className="px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-5xl">
          <SectionReveal>
            <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
              {t('transform.title')}
            </h2>
            <p className="mb-12 text-center text-lg text-muted-foreground">
              {t('problem.subtitle')}
            </p>
          </SectionReveal>
          <StaggerContainer className="grid gap-6 md:grid-cols-3" staggerDelay={0.15}>
            {transformPairs.map(({ key, icon: Icon }) => (
              <StaggerItem key={key}>
                <div className="flex flex-col items-center gap-3">
                  {/* Problem card */}
                  <Card className="w-full border-none bg-destructive/5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                    <CardHeader>
                      <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-destructive/10">
                        <Icon className="size-5 text-destructive" />
                      </div>
                      <CardTitle className="text-base">{t(`problem.${key}.title`)}</CardTitle>
                      <CardDescription>{t(`problem.${key}.description`)}</CardDescription>
                    </CardHeader>
                  </Card>

                  {/* Arrow connector */}
                  <ArrowDown className="size-5 text-primary/40" />

                  {/* Solution card */}
                  <Card className="w-full border-none bg-primary/5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                    <CardHeader>
                      <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <Check className="size-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">{t(`solution.${key}.title`)}</CardTitle>
                      <CardDescription>{t(`solution.${key}.description`)}</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Features — Tabbed Preview */}
      <section id="features" className="bg-gradient-section px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-5xl">
          <FeatureTabs />
        </div>
      </section>

      {/* How It Works — Connected Stepper */}
      <section className="px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-5xl">
          <SectionReveal>
            <h2 className="mb-16 text-center text-3xl font-bold md:text-4xl">
              {t('howItWorks.title')}
            </h2>
          </SectionReveal>
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-1/2 top-8 hidden h-px w-[60%] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/20 to-transparent md:block" />
            <StaggerContainer className="grid gap-8 md:grid-cols-4" staggerDelay={0.15}>
              {steps.map(({ key, icon: Icon, step }) => (
                <StaggerItem key={key}>
                  <div className="flex flex-col items-center text-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="relative z-10 mb-4 flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-lg"
                    >
                      {step}
                    </motion.div>
                    <Icon className="mb-2 size-5 text-muted-foreground" />
                    <h3 className="mb-1 text-lg font-semibold">{t(`howItWorks.${key}.title`)}</h3>
                    <p className="text-sm text-muted-foreground">{t(`howItWorks.${key}.description`)}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* Testimonials — Card Grid */}
      <section className="bg-gradient-section px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-5xl">
          <SectionReveal>
            <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
              {t('testimonials.title')}
            </h2>
          </SectionReveal>
          <StaggerContainer className="grid gap-6 md:grid-cols-3" staggerDelay={0.12}>
            {testimonials.map((id) => (
              <StaggerItem key={id}>
                <Card className="glass border-none shadow-elevated transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                  <CardHeader>
                    <div className="mb-3 flex items-center gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="size-3.5 fill-accent text-accent" />
                      ))}
                    </div>
                    <CardDescription className="text-sm italic text-foreground/80">
                      &ldquo;{t(`testimonials.${id}.quote`)}&rdquo;
                    </CardDescription>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {t(`testimonials.${id}.name`).charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t(`testimonials.${id}.name`)}</p>
                        <p className="text-xs text-muted-foreground">{t(`testimonials.${id}.role`)}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative px-4 py-24 text-center md:py-32">
        <div className="bg-gradient-mesh absolute inset-0 -z-10" />
        <SectionReveal>
          <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">
            {t('finalCta.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            {t('finalCta.subtitle')}
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'bg-accent px-10 text-lg text-accent-foreground shadow-lg transition-all hover:bg-accent/90 hover:shadow-xl'
              )}
            >
              {t('finalCta.cta')}
              <ArrowRight className="ml-2 size-5" />
            </Link>
          </div>
        </SectionReveal>
      </section>

      {/* Footer */}
      <FooterNav />
    </main>
  )
}
```

**Step 2: Commit**

```bash
git add "src/app/[locale]/(public)/page.tsx"
git commit -m "feat: structurally redesign landing page with merged sections, tabbed features, CSS mockups, full footer"
```

---

## Task 7: Fix Dashboard Sidebar i18n

**Files:**
- Modify: `src/components/layout/dashboard-sidebar.tsx`

**Step 1: Replace hardcoded English group labels with i18n keys and fix streak text**

In `src/components/layout/dashboard-sidebar.tsx`:

1. Change the `navGroups` array to use `labelKey` instead of hardcoded `label`:
```typescript
const navGroups = [
  {
    labelKey: 'learn',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
      { href: '/dashboard/ai-chat', icon: MessageSquare, labelKey: 'aiChat' },
      { href: '/dashboard/ai-voice', icon: Mic, labelKey: 'aiVoice' },
      { href: '/dashboard/courses', icon: BookOpen, labelKey: 'courses' },
    ],
  },
  {
    labelKey: 'connect',
    items: [
      { href: '/dashboard/lessons', icon: Calendar, labelKey: 'lessons' },
      { href: '/dashboard/tutors', icon: Users, labelKey: 'tutors' },
    ],
  },
  {
    labelKey: 'track',
    items: [
      { href: '/dashboard/progress', icon: TrendingUp, labelKey: 'progress' },
      { href: '/dashboard/settings', icon: Settings, labelKey: 'settings' },
    ],
  },
]
```

2. Add a new translations hook: `const tg = useTranslations('nav.sidebarGroups')` and `const td = useTranslations('dashboard')`

3. Change group label rendering from `{group.label}` to `{tg(group.labelKey)}`

4. Change streak text from `<p className="text-xs text-muted-foreground">day streak</p>` to `<p className="text-xs text-muted-foreground">{td('streak')}</p>`

5. Change collapsed title from `title="7 day streak"` to `title={`7 ${td('streak')}`}`

**Step 2: Commit**

```bash
git add src/components/layout/dashboard-sidebar.tsx
git commit -m "fix: internationalize sidebar group labels and streak text"
```

---

## Task 8: Fix Dashboard Header i18n

**Files:**
- Modify: `src/components/layout/dashboard-header.tsx`

**Step 1: Replace hardcoded "Dashboard" with i18n**

This is a server component, so use `getTranslations` from `next-intl/server`:

```typescript
import { requireAuth } from '@/lib/auth/guard'
import { getTranslations } from 'next-intl/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LanguageToggle } from './language-toggle'
import { signOut } from '@/lib/actions/auth'
import { Bell, LogOut } from 'lucide-react'

export async function DashboardHeader() {
  const user = await requireAuth()
  const tc = await getTranslations('common')

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{tc('dashboard')}</span>
      </div>
      <div className="flex items-center gap-3">
        <LanguageToggle />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent" />
        </Button>
        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
          <Avatar className="size-8">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {user.display_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium sm:block">{user.display_name}</span>
        </div>
        <form action={signOut}>
          <Button variant="ghost" size="icon-sm" type="submit" title={tc('logout')}>
            <LogOut className="size-4" />
          </Button>
        </form>
      </div>
    </header>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/layout/dashboard-header.tsx
git commit -m "fix: internationalize dashboard header label and logout tooltip"
```

---

## Task 9: Elevate Dashboard Content Visuals + i18n Activity Feed

**Files:**
- Modify: `src/app/[locale]/(dashboard)/dashboard/dashboard-content.tsx`

**Step 1: Update dashboard content**

Key changes:
1. Activity feed entries use i18n keys instead of hardcoded English
2. Stat cards get glassmorphism styling
3. Quick action cards get colored left border
4. Welcome section gets gradient banner background
5. Activity feed gets timeline-style dot indicators

Replace the entire file with the updated version that includes:

- Import `useTranslations` for `'dashboard'` namespace (already done)
- Change activity feed items from hardcoded English to `t('activity.aiPractice')`, etc.
- Add `glass shadow-elevated` to stat cards
- Add `border-l-4` with matching colors to quick action cards
- Wrap welcome section in a gradient banner div
- Add timeline dots to activity items

The activity feed array should become:
```typescript
const activities = [
  { icon: MessageSquare, textKey: 'activity.aiPractice', timeKey: 'activity.timeAgo2h', color: 'text-primary' },
  { icon: BookOpen, textKey: 'activity.courseFinished', timeKey: 'activity.timeAgo1d', color: 'text-[oklch(0.65_0.18_155)]' },
  { icon: GraduationCap, textKey: 'activity.badgeEarned', timeKey: 'activity.timeAgo2d', color: 'text-accent' },
]
```

And render them with:
```typescript
<p className="text-sm">{t(activity.textKey)}</p>
...
<span className="text-xs text-muted-foreground">{t(activity.timeKey)}</span>
```

Stat cards should use: `className={cn('border-t-2 glass shadow-elevated', borderColor)}`

Quick action cards should use: `className="cursor-pointer border-l-4 border-l-primary/0 transition-all duration-200 hover:-translate-y-0.5 hover:border-l-primary hover:shadow-card-hover"` (with matching colors per action)

Welcome section wrap: `<div className="rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 p-6">`

**Step 2: Commit**

```bash
git add "src/app/[locale]/(dashboard)/dashboard/dashboard-content.tsx"
git commit -m "feat: elevate dashboard visuals with glassmorphism, timeline feed, i18n activity"
```

---

## Task 10: Final Build Verification

**Step 1: Run linting**

Run: `pnpm lint`
Expected: No new errors from our changes

**Step 2: Run build**

Run: `pnpm build`
Expected: Build succeeds

**Step 3: Visual check with Playwright**

Navigate to `http://localhost:3001/ja` and verify:
- Hero has chat mockup on right side
- Stats bar is glassmorphism card
- Problem/Solution merged as before/after columns
- Features section has 3 tabs with mockups
- Testimonials show as 3-card grid
- Footer has 4 columns

Navigate to dashboard and verify:
- Sidebar labels are in Japanese
- Activity feed is in Japanese
- Header says "ダッシュボード"
- Cards have glass effect

**Step 4: Fix any issues and commit**

```bash
git add -A
git commit -m "fix: final adjustments for UI/UX audit redesign"
```
