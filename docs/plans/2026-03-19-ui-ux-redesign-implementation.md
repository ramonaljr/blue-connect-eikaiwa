# UI/UX Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Blue Connect Eikaiwa from a grayscale MVP to a warm, inviting, animation-rich platform with a storytelling landing page and fully overhauled dashboard.

**Architecture:** Component-First Upgrade — inject color into existing CSS variables, add Framer Motion for animations, build new composite components on top of existing shadcn/ui primitives, and rewrite landing page and dashboard pages with the new design language.

**Tech Stack:** Next.js 15, Tailwind CSS v4, shadcn/ui, Framer Motion, lucide-react, next-intl

---

## Task 1: Install Framer Motion

**Files:**
- Modify: `package.json`

**Step 1: Install framer-motion**

Run: `pnpm add framer-motion`

**Step 2: Verify installation**

Run: `pnpm ls framer-motion`
Expected: framer-motion version listed

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add framer-motion dependency"
```

---

## Task 2: Update Color Palette & Design Tokens

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Replace the `:root` CSS variables with the new blue-focused warm palette**

Replace the `:root` block in `src/app/globals.css` with:

```css
:root {
  --background: oklch(0.985 0.005 250);
  --foreground: oklch(0.15 0.02 250);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.15 0.02 250);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.15 0.02 250);
  --primary: oklch(0.55 0.2 250);
  --primary-foreground: oklch(0.985 0.005 250);
  --secondary: oklch(0.95 0.01 250);
  --secondary-foreground: oklch(0.25 0.05 250);
  --muted: oklch(0.95 0.01 250);
  --muted-foreground: oklch(0.50 0.03 250);
  --accent: oklch(0.75 0.18 75);
  --accent-foreground: oklch(0.25 0.05 75);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.90 0.01 250);
  --input: oklch(0.90 0.01 250);
  --ring: oklch(0.55 0.2 250);
  --chart-1: oklch(0.55 0.2 250);
  --chart-2: oklch(0.65 0.18 155);
  --chart-3: oklch(0.75 0.18 75);
  --chart-4: oklch(0.70 0.12 230);
  --chart-5: oklch(0.40 0.22 250);
  --radius: 0.625rem;
  --sidebar: oklch(0.97 0.01 250);
  --sidebar-foreground: oklch(0.15 0.02 250);
  --sidebar-primary: oklch(0.55 0.2 250);
  --sidebar-primary-foreground: oklch(0.985 0.005 250);
  --sidebar-accent: oklch(0.93 0.02 250);
  --sidebar-accent-foreground: oklch(0.25 0.05 250);
  --sidebar-border: oklch(0.90 0.01 250);
  --sidebar-ring: oklch(0.55 0.2 250);
}
```

**Step 2: Replace the `.dark` block with updated dark mode**

```css
.dark {
  --background: oklch(0.15 0.02 250);
  --foreground: oklch(0.95 0.01 250);
  --card: oklch(0.20 0.03 250);
  --card-foreground: oklch(0.95 0.01 250);
  --popover: oklch(0.20 0.03 250);
  --popover-foreground: oklch(0.95 0.01 250);
  --primary: oklch(0.65 0.18 250);
  --primary-foreground: oklch(0.15 0.02 250);
  --secondary: oklch(0.25 0.03 250);
  --secondary-foreground: oklch(0.95 0.01 250);
  --muted: oklch(0.25 0.03 250);
  --muted-foreground: oklch(0.65 0.03 250);
  --accent: oklch(0.70 0.16 75);
  --accent-foreground: oklch(0.15 0.02 75);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.65 0.18 250);
  --chart-1: oklch(0.65 0.18 250);
  --chart-2: oklch(0.65 0.18 155);
  --chart-3: oklch(0.70 0.16 75);
  --chart-4: oklch(0.70 0.12 230);
  --chart-5: oklch(0.50 0.15 250);
  --sidebar: oklch(0.18 0.02 250);
  --sidebar-foreground: oklch(0.95 0.01 250);
  --sidebar-primary: oklch(0.65 0.18 250);
  --sidebar-primary-foreground: oklch(0.15 0.02 250);
  --sidebar-accent: oklch(0.25 0.03 250);
  --sidebar-accent-foreground: oklch(0.95 0.01 250);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.65 0.18 250);
}
```

**Step 3: Add custom utility classes at the end of globals.css (before the closing of @layer base or after it)**

Add after the existing `@layer base` block:

```css
@layer utilities {
  .text-gradient-blue {
    @apply bg-gradient-to-r from-[oklch(0.55_0.2_250)] to-[oklch(0.65_0.18_230)] bg-clip-text text-transparent;
  }
  .bg-gradient-hero {
    background: radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.55 0.2 250 / 0.15), transparent);
  }
  .bg-gradient-section {
    background: linear-gradient(to bottom, oklch(0.95 0.02 250), oklch(0.985 0.005 250));
  }
  .shadow-card-hover {
    box-shadow: 0 8px 30px oklch(0.55 0.2 250 / 0.12);
  }
  .shadow-card {
    box-shadow: 0 2px 12px oklch(0.55 0.2 250 / 0.06);
  }
}
```

**Step 4: Verify the dev server still works**

Run: `pnpm dev`
Expected: No CSS compilation errors, site loads with blue-tinted colors

**Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "style: apply blue-focused warm color palette with accent tokens"
```

---

## Task 3: Add New i18n Strings

**Files:**
- Modify: `src/messages/en.json`
- Modify: `src/messages/ja.json`

**Step 1: Add new landing page sections to en.json**

Add these new keys under the `"landing"` object, alongside existing keys:

```json
"stats": {
  "learners": "5,000+",
  "learnersLabel": "Active Learners",
  "tutors": "50+",
  "tutorsLabel": "Expert Tutors",
  "satisfaction": "98%",
  "satisfactionLabel": "Satisfaction Rate"
},
"problem": {
  "title": "Sound familiar?",
  "subtitle": "Learning English in Japan comes with real challenges",
  "cost": {
    "title": "Too Expensive",
    "description": "Traditional English schools charge ¥300,000+ per year"
  },
  "schedule": {
    "title": "No Time",
    "description": "Fixed lesson times don't fit your busy schedule"
  },
  "confidence": {
    "title": "Too Nervous",
    "description": "Fear of making mistakes holds you back"
  }
},
"solution": {
  "title": "Blue Connect solves all three",
  "cost": {
    "title": "Affordable Plans",
    "description": "Start free. Pro from just ¥2,980/month — fraction of traditional schools"
  },
  "schedule": {
    "title": "Learn Anytime",
    "description": "AI partner available 24/7. Book tutors when it suits you"
  },
  "confidence": {
    "title": "Judgment-Free Practice",
    "description": "Practice with AI first, build confidence, then try live lessons"
  }
},
"testimonials": {
  "title": "Loved by Learners",
  "1": {
    "name": "Yuki T.",
    "role": "Office Worker, Tokyo",
    "quote": "I was too shy to speak English at work. After 3 months with Blue Connect's AI, I gave my first presentation in English!"
  },
  "2": {
    "name": "Kenji M.",
    "role": "University Student, Osaka",
    "quote": "The mix of AI practice and real tutor lessons is perfect. My TOEIC score jumped 150 points."
  },
  "3": {
    "name": "Sakura H.",
    "role": "Freelancer, Fukuoka",
    "quote": "I love that I can practice at 2am when inspiration hits. The AI never judges my mistakes."
  }
},
"finalCta": {
  "title": "Start your English journey today",
  "subtitle": "Join thousands of Japanese learners building real English confidence",
  "cta": "Get Started Free"
}
```

Also add new dashboard keys under a new `"dashboard"` object at the root level:

```json
"dashboard": {
  "welcome": {
    "morning": "Good morning",
    "afternoon": "Good afternoon",
    "evening": "Good evening"
  },
  "dailyGoal": "Daily Goal",
  "activitiesCompleted": "{count}/{total} activities",
  "streak": "day streak",
  "stats": {
    "studyTime": "Study Time",
    "thisWeek": "this week",
    "lessonsCompleted": "Lessons Done",
    "wordsLearned": "Words Learned",
    "nextLesson": "Next Lesson"
  },
  "sections": {
    "continueLearning": "Continue Learning",
    "upcomingLessons": "Upcoming Lessons",
    "recentActivity": "Recent Activity",
    "quickActions": "Quick Actions",
    "achievements": "Achievements",
    "weeklyProgress": "Weekly Progress",
    "recommended": "Recommended For You"
  },
  "quickActions": {
    "aiChat": "Start AI Chat",
    "findTutor": "Find a Tutor",
    "browseCourses": "Browse Courses"
  },
  "noUpcoming": "No upcoming lessons",
  "joinLesson": "Join",
  "viewAll": "View All"
}
```

**Step 2: Add corresponding Japanese translations to ja.json**

Add under `"landing"`:

```json
"stats": {
  "learners": "5,000+",
  "learnersLabel": "アクティブな学習者",
  "tutors": "50+",
  "tutorsLabel": "経験豊富な講師",
  "satisfaction": "98%",
  "satisfactionLabel": "満足度"
},
"problem": {
  "title": "こんな悩み、ありませんか？",
  "subtitle": "日本での英語学習には、こんな壁があります",
  "cost": {
    "title": "費用が高すぎる",
    "description": "従来の英会話スクールは年間30万円以上かかります"
  },
  "schedule": {
    "title": "時間がない",
    "description": "固定のレッスン時間は忙しいスケジュールに合いません"
  },
  "confidence": {
    "title": "自信がない",
    "description": "間違いを恐れて、話せなくなってしまう"
  }
},
"solution": {
  "title": "Blue Connectがすべて解決します",
  "cost": {
    "title": "手頃な料金",
    "description": "無料から始められます。Proプランは月額¥2,980 — 従来のスクールの一部の費用"
  },
  "schedule": {
    "title": "いつでも学習",
    "description": "AIパートナーは24時間対応。講師も好きな時間に予約"
  },
  "confidence": {
    "title": "安心して練習",
    "description": "まずAIで練習して自信をつけ、それからライブレッスンに挑戦"
  }
},
"testimonials": {
  "title": "学習者の声",
  "1": {
    "name": "田中 ゆき",
    "role": "会社員・東京",
    "quote": "職場で英語を話すのが恥ずかしかったのですが、Blue ConnectのAIと3ヶ月練習した後、初めて英語でプレゼンができました！"
  },
  "2": {
    "name": "村田 健二",
    "role": "大学生・大阪",
    "quote": "AI練習とリアル講師レッスンの組み合わせが最高です。TOEICスコアが150点上がりました。"
  },
  "3": {
    "name": "花田 さくら",
    "role": "フリーランス・福岡",
    "quote": "夜2時にインスピレーションが湧いた時も練習できるのが嬉しい。AIは間違いを絶対に笑わない。"
  }
},
"finalCta": {
  "title": "今日から英語の旅を始めましょう",
  "subtitle": "何千人もの日本人学習者と一緒に、本物の英語力を身につけよう",
  "cta": "無料で始める"
}
```

Add root-level `"dashboard"`:

```json
"dashboard": {
  "welcome": {
    "morning": "おはようございます",
    "afternoon": "こんにちは",
    "evening": "こんばんは"
  },
  "dailyGoal": "今日の目標",
  "activitiesCompleted": "{count}/{total} アクティビティ完了",
  "streak": "日連続",
  "stats": {
    "studyTime": "学習時間",
    "thisWeek": "今週",
    "lessonsCompleted": "完了レッスン",
    "wordsLearned": "習得単語",
    "nextLesson": "次のレッスン"
  },
  "sections": {
    "continueLearning": "学習を続ける",
    "upcomingLessons": "今後のレッスン",
    "recentActivity": "最近のアクティビティ",
    "quickActions": "クイックアクション",
    "achievements": "実績",
    "weeklyProgress": "週間の進捗",
    "recommended": "おすすめ"
  },
  "quickActions": {
    "aiChat": "AI英会話を始める",
    "findTutor": "講師を探す",
    "browseCourses": "コースを見る"
  },
  "noUpcoming": "予定されたレッスンはありません",
  "joinLesson": "参加",
  "viewAll": "すべて見る"
}
```

**Step 3: Commit**

```bash
git add src/messages/en.json src/messages/ja.json
git commit -m "content: add i18n strings for landing page storytelling and dashboard overhaul"
```

---

## Task 4: Create Animation Utility Components

**Files:**
- Create: `src/components/ui/motion.tsx`

**Step 1: Create the motion utilities file**

```typescript
'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

// Reusable scroll-triggered reveal wrapper
export function SectionReveal({
  children,
  className,
  direction = 'up',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  direction?: 'up' | 'left' | 'right'
  delay?: number
}) {
  const initial = {
    opacity: 0,
    ...(direction === 'up' && { y: 40 }),
    ...(direction === 'left' && { x: -40 }),
    ...(direction === 'right' && { x: 40 }),
  }

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Staggered children container
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
}: {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Child item for use inside StaggerContainer
export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Animated counter that counts up when in view
export function AnimatedCounter({
  target,
  suffix = '',
  className,
}: {
  target: number
  suffix?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [isInView, target])

  return (
    <span ref={ref} className={className}>
      {isInView ? count.toLocaleString() : '0'}
      {suffix}
    </span>
  )
}

// Floating animation for decorative elements
export function FloatingElement({
  children,
  className,
  duration = 6,
  distance = 20,
}: {
  children: React.ReactNode
  className?: string
  duration?: number
  distance?: number
}) {
  return (
    <motion.div
      animate={{ y: [-distance / 2, distance / 2, -distance / 2] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Progress ring (circular SVG progress)
export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
  className,
  children,
}: {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
  children?: React.ReactNode
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const ref = useRef<SVGCircleElement>(null)
  const isInView = useInView(ref as any, { once: true })

  return (
    <div className={className} style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <motion.circle
          ref={ref}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-primary"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={isInView ? { strokeDashoffset: circumference - (progress / 100) * circumference } : {}}
          transition={{ duration: 1.5, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.2 }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}

export { motion }
```

**Step 2: Verify no TypeScript errors**

Run: `pnpm exec tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to motion.tsx

**Step 3: Commit**

```bash
git add src/components/ui/motion.tsx
git commit -m "feat: add reusable animation components (SectionReveal, AnimatedCounter, ProgressRing)"
```

---

## Task 5: Redesign Public Navbar

**Files:**
- Modify: `src/components/layout/public-navbar.tsx`

**Step 1: Rewrite the navbar with animated underlines, scroll-aware border, amber CTA, and mobile sheet**

```typescript
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, buttonVariants } from '@/components/ui/button'
import { LanguageToggle } from './language-toggle'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/pricing', key: 'pricing' },
  { href: '/tutors', key: 'tutors' },
  { href: '/courses', key: 'courses' },
] as const

export function PublicNavbar() {
  const t = useTranslations('nav')
  const tc = useTranslations('common')
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md transition-all duration-300 supports-[backdrop-filter]:bg-background/60',
          scrolled ? 'border-b shadow-sm' : 'border-b border-transparent'
        )}
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <span className="text-primary">Blue Connect</span>
              <span className="text-muted-foreground text-sm font-normal">Eikaiwa</span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map(({ href, key }) => (
                <Link
                  key={key}
                  href={href}
                  className="group relative px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t(key)}
                  <span className="absolute inset-x-3 -bottom-px h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link href="/login" className={cn(buttonVariants({ variant: 'ghost' }), 'hidden md:inline-flex')}>
              {tc('login')}
            </Link>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'hidden bg-accent text-accent-foreground hover:bg-accent/90 md:inline-flex'
              )}
            >
              {tc('signup')}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-background p-6 shadow-xl md:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">Blue Connect</span>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="size-5" />
                </Button>
              </div>
              <nav className="mt-8 flex flex-col gap-1">
                {navLinks.map(({ href, key }, i) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {t(key)}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2">
                <Link href="/login" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                  {tc('login')}
                </Link>
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ size: 'lg' }), 'bg-accent text-accent-foreground hover:bg-accent/90')}
                >
                  {tc('signup')}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
```

**Step 2: Verify the navbar renders**

Run: `pnpm dev` and check the landing page in browser
Expected: Blue logo, animated nav links, amber CTA, mobile hamburger works

**Step 3: Commit**

```bash
git add src/components/layout/public-navbar.tsx
git commit -m "feat: redesign public navbar with scroll effects, animated links, mobile sheet"
```

---

## Task 6: Rewrite Landing Page — Full Storytelling Flow

**Files:**
- Modify: `src/app/[locale]/(public)/page.tsx`

**Step 1: Rewrite the landing page with all 8 sections**

```typescript
'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  MessageSquare, BookOpen, Users, UserPlus, ClipboardCheck, Rocket, TrendingUp,
  Wallet, Clock, ShieldCheck, Sparkles, Video, Star, ArrowRight, Quote,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  SectionReveal, StaggerContainer, StaggerItem, AnimatedCounter, FloatingElement,
} from '@/components/ui/motion'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const features = [
  { key: 'ai' as const, icon: MessageSquare },
  { key: 'courses' as const, icon: BookOpen },
  { key: 'tutors' as const, icon: Users },
]

const steps = [
  { key: 'step1' as const, icon: UserPlus, step: 1 },
  { key: 'step2' as const, icon: ClipboardCheck, step: 2 },
  { key: 'step3' as const, icon: Rocket, step: 3 },
  { key: 'step4' as const, icon: TrendingUp, step: 4 },
]

const painPoints = [
  { key: 'cost' as const, icon: Wallet },
  { key: 'schedule' as const, icon: Clock },
  { key: 'confidence' as const, icon: ShieldCheck },
]

const solutions = [
  { key: 'cost' as const, icon: Wallet },
  { key: 'schedule' as const, icon: Clock },
  { key: 'confidence' as const, icon: ShieldCheck },
]

const featureBlocks = [
  { key: 'ai' as const, icon: Sparkles, direction: 'left' as const },
  { key: 'courses' as const, icon: BookOpen, direction: 'right' as const },
  { key: 'tutors' as const, icon: Video, direction: 'left' as const },
]

const testimonials = ['1', '2', '3'] as const

export default function HomePage() {
  const t = useTranslations('landing')
  const tc = useTranslations('common')
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <main className="flex flex-col overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center gap-8 px-4 py-24 text-center md:py-36">
        <div className="bg-gradient-hero absolute inset-0 -z-10" />

        {/* Floating decorative shapes */}
        <FloatingElement className="absolute left-[10%] top-[20%] -z-10 hidden md:block" duration={8}>
          <div className="size-20 rounded-full bg-primary/5" />
        </FloatingElement>
        <FloatingElement className="absolute right-[15%] top-[30%] -z-10 hidden md:block" duration={10} distance={30}>
          <div className="size-14 rounded-full bg-accent/10" />
        </FloatingElement>

        <SectionReveal>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-5xl lg:text-7xl">
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
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            {t('hero.subtitle')}
          </p>
        </SectionReveal>

        <SectionReveal delay={0.3}>
          <div className="flex flex-col gap-3 sm:flex-row">
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

        {/* Stats counters */}
        <SectionReveal delay={0.45}>
          <div className="mt-8 flex flex-wrap justify-center gap-8 md:gap-16">
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
        </SectionReveal>
      </section>

      {/* Problem Statement */}
      <section className="bg-gradient-section px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-5xl">
          <SectionReveal>
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold md:text-4xl">{t('problem.title')}</h2>
              <p className="mt-3 text-lg text-muted-foreground">{t('problem.subtitle')}</p>
            </div>
          </SectionReveal>
          <StaggerContainer className="grid gap-6 md:grid-cols-3">
            {painPoints.map(({ key, icon: Icon }) => (
              <StaggerItem key={key}>
                <Card className="border-none bg-background/70 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                  <CardHeader>
                    <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-destructive/10">
                      <Icon className="size-6 text-destructive" />
                    </div>
                    <CardTitle>{t(`problem.${key}.title`)}</CardTitle>
                    <CardDescription>{t(`problem.${key}.description`)}</CardDescription>
                  </CardHeader>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Solution */}
      <section className="px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-5xl">
          <SectionReveal>
            <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
              {t('solution.title')}
            </h2>
          </SectionReveal>
          <StaggerContainer className="grid gap-6 md:grid-cols-3">
            {solutions.map(({ key, icon: Icon }) => (
              <StaggerItem key={key}>
                <Card className="border-none shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                  <CardHeader>
                    <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <CardTitle>{t(`solution.${key}.title`)}</CardTitle>
                    <CardDescription>{t(`solution.${key}.description`)}</CardDescription>
                  </CardHeader>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="bg-gradient-section px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-6xl space-y-20 md:space-y-28">
          {featureBlocks.map(({ key, icon: Icon, direction }, i) => (
            <SectionReveal key={key} direction={direction}>
              <div
                className={cn(
                  'flex flex-col items-center gap-8 md:flex-row md:gap-12',
                  i % 2 === 1 && 'md:flex-row-reverse'
                )}
              >
                <div className="flex-1">
                  <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Icon className="size-7 text-primary" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold md:text-3xl">
                    {t(`features.${key}.title`)}
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    {t(`features.${key}.description`)}
                  </p>
                </div>
                <div className="flex-1">
                  <div className="aspect-video rounded-2xl bg-muted/50 ring-1 ring-border" />
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-5xl">
          <SectionReveal>
            <h2 className="mb-16 text-center text-3xl font-bold md:text-4xl">
              {t('howItWorks.title')}
            </h2>
          </SectionReveal>
          <StaggerContainer className="grid gap-8 md:grid-cols-4" staggerDelay={0.15}>
            {steps.map(({ key, icon: Icon, step }) => (
              <StaggerItem key={key}>
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-lg"
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
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-section px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-4xl">
          <SectionReveal>
            <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
              {t('testimonials.title')}
            </h2>
          </SectionReveal>
          <div className="relative">
            <div className="overflow-hidden">
              {testimonials.map((id, i) => (
                <motion.div
                  key={id}
                  initial={false}
                  animate={{
                    opacity: activeTestimonial === i ? 1 : 0,
                    scale: activeTestimonial === i ? 1 : 0.95,
                  }}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    'flex flex-col items-center text-center',
                    activeTestimonial !== i && 'pointer-events-none absolute inset-0'
                  )}
                >
                  <Quote className="mb-4 size-10 text-primary/20" />
                  <blockquote className="mb-6 max-w-2xl text-lg italic text-foreground md:text-xl">
                    &ldquo;{t(`testimonials.${id}.quote`)}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="size-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="mt-2 font-semibold">{t(`testimonials.${id}.name`)}</p>
                  <p className="text-sm text-muted-foreground">{t(`testimonials.${id}.role`)}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 flex justify-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={cn(
                    'size-2.5 rounded-full transition-all duration-300',
                    activeTestimonial === i ? 'w-8 bg-primary' : 'bg-primary/30'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative px-4 py-24 text-center md:py-32">
        <div className="bg-gradient-hero absolute inset-0 -z-10" />
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
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        {t('footer.copyright')}
      </footer>
    </main>
  )
}
```

**Step 2: Verify the landing page renders**

Run: `pnpm dev` and check
Expected: Full storytelling page with 8 sections, animations, blue palette

**Step 3: Commit**

```bash
git add src/app/[locale]/(public)/page.tsx
git commit -m "feat: rewrite landing page with full storytelling flow and animations"
```

---

## Task 7: Redesign Dashboard Sidebar

**Files:**
- Modify: `src/components/layout/dashboard-sidebar.tsx`

**Step 1: Rewrite sidebar with grouped navigation, user profile area, collapsible mode**

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, MessageSquare, Mic, BookOpen,
  Calendar, Users, TrendingUp, Settings,
  ChevronLeft, Flame,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navGroups = [
  {
    labelKey: null,
    label: 'Learn',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
      { href: '/dashboard/ai-chat', icon: MessageSquare, labelKey: 'aiChat' },
      { href: '/dashboard/ai-voice', icon: Mic, labelKey: 'aiVoice' },
      { href: '/dashboard/courses', icon: BookOpen, labelKey: 'courses' },
    ],
  },
  {
    label: 'Connect',
    items: [
      { href: '/dashboard/lessons', icon: Calendar, labelKey: 'lessons' },
      { href: '/dashboard/tutors', icon: Users, labelKey: 'tutors' },
    ],
  },
  {
    label: 'Track',
    items: [
      { href: '/dashboard/progress', icon: TrendingUp, labelKey: 'progress' },
      { href: '/dashboard/settings', icon: Settings, labelKey: 'settings' },
    ],
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const tc = useTranslations('common')
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/dashboard" className="text-lg font-bold text-primary">
            {tc('appName')}
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(collapsed && 'mx-auto')}
        >
          <ChevronLeft className={cn('size-4 transition-transform', collapsed && 'rotate-180')} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {navGroups.map((group, gi) => (
          <div key={gi} className={cn(gi > 0 && 'mt-4')}>
            {!collapsed && group.label && (
              <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                {group.label}
              </p>
            )}
            {collapsed && gi > 0 && (
              <div className="mx-auto my-2 h-px w-8 bg-border" />
            )}
            <div className="space-y-0.5">
              {group.items.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== '/dashboard' && pathname.startsWith(link.href + '/'))
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    title={collapsed ? t(link.labelKey) : undefined}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
                      collapsed && 'justify-center px-0',
                      isActive
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      />
                    )}
                    <link.icon className="size-4 shrink-0" />
                    {!collapsed && <span>{t(link.labelKey)}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Streak indicator */}
      {!collapsed && (
        <div className="border-t p-4">
          <div className="flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2">
            <Flame className="size-5 text-accent" />
            <div>
              <p className="text-sm font-semibold text-accent">7</p>
              <p className="text-xs text-muted-foreground">day streak</p>
            </div>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="border-t p-2">
          <div className="flex items-center justify-center rounded-lg bg-accent/10 p-2" title="7 day streak">
            <Flame className="size-5 text-accent" />
          </div>
        </div>
      )}
    </aside>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/layout/dashboard-sidebar.tsx
git commit -m "feat: redesign dashboard sidebar with grouped nav, collapsible mode, streak indicator"
```

---

## Task 8: Redesign Dashboard Header

**Files:**
- Modify: `src/components/layout/dashboard-header.tsx`

**Step 1: Rewrite header with breadcrumbs, notification bell, and improved layout**

```typescript
import { requireAuth } from '@/lib/auth/guard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LanguageToggle } from './language-toggle'
import { signOut } from '@/lib/actions/auth'
import { Bell, Flame, LogOut } from 'lucide-react'

export async function DashboardHeader() {
  const user = await requireAuth()

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Dashboard</span>
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
          <Button variant="ghost" size="icon-sm" type="submit" title="Log out">
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
git commit -m "feat: redesign dashboard header with notification bell and cleaner layout"
```

---

## Task 9: Rewrite Dashboard Overview Page

**Files:**
- Modify: `src/app/[locale]/(dashboard)/dashboard/page.tsx`
- Create: `src/app/[locale]/(dashboard)/dashboard/dashboard-content.tsx`

**Step 1: Create the client component with rich dashboard content**

Create `src/app/[locale]/(dashboard)/dashboard/dashboard-content.tsx`:

```typescript
'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  MessageSquare, Users, BookOpen, Calendar,
  Flame, Clock, GraduationCap, ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { ProgressRing, AnimatedCounter, StaggerContainer, StaggerItem, SectionReveal } from '@/components/ui/motion'
import { cn } from '@/lib/utils'

const statCards = [
  { key: 'studyTime', icon: Clock, value: 12, suffix: 'h', color: 'text-primary', borderColor: 'border-t-primary' },
  { key: 'lessonsCompleted', icon: GraduationCap, value: 24, suffix: '', color: 'text-[oklch(0.65_0.18_155)]', borderColor: 'border-t-[oklch(0.65_0.18_155)]' },
  { key: 'wordsLearned', icon: BookOpen, value: 340, suffix: '', color: 'text-accent', borderColor: 'border-t-accent' },
  { key: 'nextLesson', icon: Calendar, value: 0, suffix: '', color: 'text-[oklch(0.55_0.15_300)]', borderColor: 'border-t-[oklch(0.55_0.15_300)]' },
]

const quickActions = [
  { key: 'aiChat', icon: MessageSquare, href: '/dashboard/ai-chat', color: 'bg-primary/10 text-primary' },
  { key: 'findTutor', icon: Users, href: '/dashboard/tutors', color: 'bg-accent/10 text-accent' },
  { key: 'browseCourses', icon: BookOpen, href: '/dashboard/courses', color: 'bg-[oklch(0.65_0.18_155)]/10 text-[oklch(0.65_0.18_155)]' },
]

function getGreetingKey(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

export function DashboardContent({ userName }: { userName: string }) {
  const t = useTranslations('dashboard')

  return (
    <div className="space-y-6">
      {/* Welcome + Daily Goal */}
      <SectionReveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              {t(`welcome.${getGreetingKey()}`)}
              <span className="text-primary">、{userName}</span>
              さん
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ProgressRing progress={60} size={64} strokeWidth={5}>
              <span className="text-xs font-semibold">3/5</span>
            </ProgressRing>
            <div>
              <p className="text-sm font-medium">{t('dailyGoal')}</p>
              <p className="text-xs text-muted-foreground">{t('activitiesCompleted', { count: 3, total: 5 })}</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5">
              <Flame className="size-4 text-accent" />
              <span className="text-sm font-bold text-accent">7</span>
              <span className="text-xs text-muted-foreground">{t('streak')}</span>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* Stat Cards */}
      <StaggerContainer className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ key, icon: Icon, value, suffix, color, borderColor }) => (
          <StaggerItem key={key}>
            <Card className={cn('border-t-2', borderColor)}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <Icon className={cn('size-5', color)} />
                  {key === 'studyTime' && (
                    <span className="text-xs text-muted-foreground">{t('stats.thisWeek')}</span>
                  )}
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {value > 0 ? <AnimatedCounter target={value} suffix={suffix} /> : '—'}
                </p>
                <p className="text-xs text-muted-foreground">{t(`stats.${key}`)}</p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Quick Actions */}
      <SectionReveal>
        <h2 className="mb-3 text-lg font-semibold">{t('sections.quickActions')}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickActions.map(({ key, icon: Icon, href, color }) => (
            <Link key={key} href={href}>
              <Card className="cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className={cn('flex size-10 items-center justify-center rounded-xl', color)}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t(`quickActions.${key}`)}</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </SectionReveal>

      {/* Upcoming Lessons */}
      <SectionReveal>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('sections.upcomingLessons')}</h2>
          <Link
            href="/dashboard/lessons"
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            {t('viewAll')}
          </Link>
        </div>
        <Card className="mt-3">
          <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
            <Calendar className="mr-2 size-4" />
            <span className="text-sm">{t('noUpcoming')}</span>
          </CardContent>
        </Card>
      </SectionReveal>

      {/* Recent Activity */}
      <SectionReveal>
        <h2 className="mb-3 text-lg font-semibold">{t('sections.recentActivity')}</h2>
        <Card>
          <CardContent className="divide-y">
            {[
              { icon: MessageSquare, text: 'Completed AI conversation practice', time: '2h ago', color: 'text-primary' },
              { icon: BookOpen, text: 'Finished Course: Basic Greetings', time: '1d ago', color: 'text-[oklch(0.65_0.18_155)]' },
              { icon: GraduationCap, text: 'Earned badge: First Steps', time: '2d ago', color: 'text-accent' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 py-3 first:pt-4 last:pb-4">
                <div className={cn('flex size-8 items-center justify-center rounded-lg bg-muted', activity.color)}>
                  <activity.icon className="size-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.text}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </SectionReveal>
    </div>
  )
}
```

**Step 2: Update the server page component to use the client content**

Rewrite `src/app/[locale]/(dashboard)/dashboard/page.tsx`:

```typescript
import { requireAuth } from '@/lib/auth/guard'
import { DashboardContent } from './dashboard-content'

export default async function DashboardPage() {
  const user = await requireAuth()

  return <DashboardContent userName={user.display_name} />
}
```

**Step 3: Commit**

```bash
git add src/app/[locale]/(dashboard)/dashboard/page.tsx src/app/[locale]/(dashboard)/dashboard/dashboard-content.tsx
git commit -m "feat: rewrite dashboard overview with stats, progress ring, quick actions, activity feed"
```

---

## Task 10: Update Dashboard Layout Background

**Files:**
- Modify: `src/app/[locale]/(dashboard)/layout.tsx`

**Step 1: Update the layout to use the new surface color**

```typescript
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-[oklch(0.965_0.008_250)]">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/[locale]/(dashboard)/layout.tsx
git commit -m "style: apply warm blue-tinted background to dashboard layout"
```

---

## Task 11: Upgrade Pricing Page

**Files:**
- Modify: `src/app/[locale]/(public)/pricing/page.tsx`

**Step 1: Enhance the pricing page with animations and improved visual hierarchy**

```typescript
'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { SectionReveal, StaggerContainer, StaggerItem } from '@/components/ui/motion'

const plans = [
  { key: 'free' as const, featureCount: 3, cta: 'cta' as const, highlighted: false },
  { key: 'pro' as const, featureCount: 5, cta: 'ctaPro' as const, highlighted: true },
  { key: 'premium' as const, featureCount: 6, cta: 'ctaPremium' as const, highlighted: false },
]

export default function PricingPage() {
  const t = useTranslations('pricing')

  return (
    <main className="flex flex-col items-center px-4 py-16 md:py-24">
      <SectionReveal>
        <h1 className="text-center text-4xl font-bold tracking-tight md:text-5xl">{t('title')}</h1>
        <p className="mt-4 text-center text-lg text-muted-foreground">{t('subtitle')}</p>
      </SectionReveal>

      <StaggerContainer className="mt-12 grid w-full max-w-5xl gap-6 md:grid-cols-3" staggerDelay={0.15}>
        {plans.map(({ key, featureCount, cta, highlighted }) => (
          <StaggerItem key={key}>
            <Card
              className={cn(
                'relative flex flex-col transition-all duration-300 hover:-translate-y-1',
                highlighted
                  ? 'border-primary shadow-card-hover ring-2 ring-primary'
                  : 'hover:shadow-card-hover'
              )}
            >
              {highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-accent text-accent-foreground">{t('recommended')}</Badge>
                </div>
              )}
              <CardHeader className="items-center text-center">
                <CardTitle className="text-xl">{t(`${key}.name`)}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">{t(`${key}.price`)}</span>
                  {key !== 'free' && (
                    <span className="text-muted-foreground">{t('monthly')}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="flex-1 space-y-3">
                  {Array.from({ length: featureCount }, (_, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-sm">{t(`${key}.features.${i + 1}`)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link
                    href="/signup"
                    className={cn(
                      buttonVariants({
                        variant: highlighted ? 'default' : 'outline',
                        size: 'lg',
                      }),
                      'w-full',
                      highlighted && 'bg-accent text-accent-foreground hover:bg-accent/90'
                    )}
                  >
                    {t(cta)}
                    {highlighted && <ArrowRight className="ml-1 size-4" />}
                  </Link>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </main>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/[locale]/(public)/pricing/page.tsx
git commit -m "feat: enhance pricing page with animations and improved visual design"
```

---

## Task 12: Final Verification

**Step 1: Run linting**

Run: `pnpm lint`
Expected: No errors

**Step 2: Run build**

Run: `pnpm build`
Expected: Build succeeds with no errors

**Step 3: Visual check**

Run: `pnpm dev`
Check these pages in browser:
- Landing page: all 8 sections visible, animations working, blue palette applied
- Pricing page: cards animate in, amber CTA on recommended plan
- Dashboard: collapsible sidebar, stats with animated counters, progress ring, quick actions
- Mobile: navbar hamburger works, dashboard responsive

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: final adjustments for UI/UX redesign"
```
