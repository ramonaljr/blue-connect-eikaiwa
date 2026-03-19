# Push to 9/10 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Elevate Blue Connect from 6.5/10 to 9/10 with SEO foundation, emotional copywriting, bolder visual design, and dashboard polish.

**Architecture:** Update SEO meta in layout, rewrite all i18n copy, upgrade CSS utilities for stronger glassmorphism and animated gradients, enhance all landing page components and the dashboard with richer visuals and i18n copy.

**Tech Stack:** Next.js 15, Tailwind CSS v4, Framer Motion, next-intl, Noto Sans JP

---

## Task 1: Add Noto Sans JP Font + Upgrade Typography

**Files:**
- Modify: `src/app/[locale]/layout.tsx`
- Modify: `src/app/globals.css`

**Step 1: Install Noto Sans JP via Next.js font optimization**

In `src/app/[locale]/layout.tsx`, add the font import and apply it:

```typescript
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import '@/app/globals.css'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI英会話・オンライン英語学習 | Blue Connect Eikaiwa',
  description: 'AIパートナーとリアル講師で英語力アップ。24時間練習OK、月額¥2,980から。小学生からビジネスまで。無料で始めよう。',
  openGraph: {
    title: 'AI英会話・オンライン英語学習 | Blue Connect Eikaiwa',
    description: 'AIパートナーとリアル講師で英語力アップ。24時間練習OK、月額¥2,980から。',
    type: 'website',
    siteName: 'Blue Connect Eikaiwa',
  },
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} className={notoSansJP.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

**Step 2: Upgrade CSS utilities — strengthen glassmorphism, add animated gradient**

In `src/app/globals.css`, replace the existing utility classes inside `@layer utilities`:

Replace `.glass` with:
```css
  .glass {
    @apply backdrop-blur-xl bg-white/70 ring-1 ring-white/30;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  }
```

Replace `.bg-gradient-mesh` with animated version:
```css
  .bg-gradient-mesh {
    background:
      radial-gradient(ellipse 60% 40% at 10% 0%, oklch(0.55 0.2 250 / 0.12), transparent),
      radial-gradient(ellipse 50% 50% at 90% 20%, oklch(0.75 0.18 75 / 0.08), transparent),
      radial-gradient(ellipse 70% 30% at 50% 100%, oklch(0.55 0.2 250 / 0.06), transparent);
    animation: mesh-shift 20s ease-in-out infinite;
  }
  @keyframes mesh-shift {
    0%, 100% { background-position: 0% 0%, 100% 0%, 50% 100%; }
    50% { background-position: 20% 10%, 80% 30%, 40% 90%; }
  }
```

Replace `.shadow-elevated` with:
```css
  .shadow-elevated {
    box-shadow: 0 1px 3px oklch(0.55 0.2 250 / 0.06), 0 8px 24px oklch(0.55 0.2 250 / 0.08);
  }
```

**Step 3: Commit**

```bash
git add src/app/[locale]/layout.tsx src/app/globals.css
git commit -m "feat: add Noto Sans JP font, SEO meta tags, stronger glassmorphism and animated gradient"
```

---

## Task 2: Rewrite All i18n Copy (SEO + Emotional Storytelling)

**Files:**
- Modify: `src/messages/ja.json`
- Modify: `src/messages/en.json`

**Step 1: Update Japanese copy**

Replace these keys in `ja.json` under `"landing"`:

```json
"hero": {
  "title": "AIと一緒に、英語がもっと楽しくなる",
  "subtitle": "小学生からビジネスパーソンまで。AI英会話パートナーとプロ講師が、あなたの「話したい」を叶えます。24時間、いつでも、どこでも。",
  "cta": "無料で始める",
  "secondaryCta": "3分で分かる使い方",
  "socialProof": "⭐ 4.9/5 — 5,000人以上が利用中"
},
```

Replace `"transform"`:
```json
"transform": {
  "title": "こんな経験、ありませんか？",
  "subtitle": "日本での英語学習には、こんな壁があります"
},
```

Replace `"problem"`:
```json
"problem": {
  "title": "こんな経験、ありませんか？",
  "subtitle": "日本での英語学習には、こんな壁があります",
  "cost": {
    "title": "英会話スクールは高すぎる",
    "description": "年間30万円、テキスト代も別。「もっと安く学べたら...」"
  },
  "schedule": {
    "title": "忙しくてレッスンに通えない",
    "description": "仕事、学校、部活。「空いた時間で練習できたら...」"
  },
  "confidence": {
    "title": "間違えるのが恥ずかしい",
    "description": "人前で英語を話すのが怖い。「誰にも笑われずに練習できたら...」"
  }
},
```

Replace `"solution"`:
```json
"solution": {
  "title": "Blue Connectがすべて解決します",
  "cost": {
    "title": "月¥2,980から、始められる",
    "description": "無料プランもあり。従来のスクールの1/10の費用で、もっと質の高い学習を"
  },
  "schedule": {
    "title": "朝5時でも深夜2時でも",
    "description": "AIは24時間対応。講師レッスンも好きな時間に予約。通学時間ゼロ"
  },
  "confidence": {
    "title": "AIは絶対に笑わない",
    "description": "何度間違えても大丈夫。自信がついたら、講師との実践レッスンへ"
  }
},
```

Replace `"features"` descriptions:
```json
"features": {
  "ai": {
    "title": "AI英会話パートナー",
    "description": "24時間、あなた専用の英語コーチ。テキスト・音声・ロールプレイで、ビジネス英語も日常会話もあなたのレベルに合わせて対応します。"
  },
  "courses": {
    "title": "英語コース",
    "description": "TOEIC・英検・日常会話まで。CEFR準拠のA1〜C2レベル別カリキュラムで、小学生の英語入門からTOEIC900点対策まで体系的に学べます。"
  },
  "tutors": {
    "title": "オンライン英会話レッスン",
    "description": "プロ講師とマンツーマン。認定講師やネイティブ講師とのマンツーマンビデオレッスン。月4回から、好きな時間に予約できます。"
  }
},
```

Replace `"howItWorks"`:
```json
"howItWorks": {
  "title": "使い方",
  "step1": {
    "title": "30秒で無料登録",
    "description": "メールアドレスだけでOK。クレジットカード不要です"
  },
  "step2": {
    "title": "AIがレベルを診断",
    "description": "5分の会話でAIがあなたの強みと弱みを分析"
  },
  "step3": {
    "title": "自分だけの学習プランで開始",
    "description": "AI練習・コース・ライブレッスンをあなた好みにミックス"
  },
  "step4": {
    "title": "成長を実感しよう！",
    "description": "毎週の進捗レポートで、上達が目に見える"
  }
},
```

Replace `"testimonials"` title — add subtitle:
```json
"testimonials": {
  "title": "学習者の声",
  "subtitle": "Blue Connectで英語力を伸ばした学習者の声をご紹介します",
```
(keep existing 1, 2, 3 testimonial entries unchanged)

Replace `"finalCta"`:
```json
"finalCta": {
  "title": "あなたの英語の旅、今日から始めませんか？",
  "subtitle": "5,000人以上が選んだ英語学習プラットフォーム。無料プランで今すぐ体験。",
  "cta": "無料で始める — たった30秒",
  "trustLine": "クレジットカード不要 ・ いつでもキャンセルOK"
}
```

Add `"chatMockup"` under `"landing"`:
```json
"chatMockup": {
  "header": "AI英会話チャット",
  "userMessage": "ビジネス会議での自己紹介の仕方を教えてください",
  "aiMessage": "いい質問ですね！自然な言い方はこちらです：「Hello, I'm [名前] from [会社名]. It's a pleasure to meet you.」",
  "badge": "24時間対応"
}
```

Add dashboard motivational messages under `"dashboard"`:
```json
"welcome": {
  "morning": "おはようございます",
  "afternoon": "こんにちは",
  "evening": "こんばんは",
  "morningMotivation": "今日も一緒にがんばりましょう！",
  "afternoonMotivation": "午後も英語の練習、続けましょう！",
  "eveningMotivation": "お疲れさまです。少しだけ英語に触れてみませんか？"
},
```

Add `"quickActionDescriptions"` under `"dashboard"`:
```json
"quickActionDescriptions": {
  "aiChat": "AIとの英会話を練習",
  "findTutor": "あなたに合った講師を見つける",
  "browseCourses": "レベル別コースを探す"
}
```

**Step 2: Update English copy with equivalent changes**

Replace in `en.json` under `"landing"`:

```json
"hero": {
  "title": "English Made Fun — With AI by Your Side",
  "subtitle": "From elementary school to the boardroom. Your AI conversation partner and expert tutors turn \"I wish I could speak English\" into \"I just did.\" Practice 24/7, at your own pace.",
  "cta": "Start Free",
  "secondaryCta": "See How It Works",
  "socialProof": "⭐ 4.9/5 — Trusted by 5,000+ learners"
},
```

Replace `"transform"`:
```json
"transform": {
  "title": "Have you experienced this?",
  "subtitle": "Learning English in Japan comes with real challenges"
},
```

Replace `"problem"`:
```json
"problem": {
  "title": "Have you experienced this?",
  "subtitle": "Learning English in Japan comes with real challenges",
  "cost": {
    "title": "English school fees are brutal",
    "description": "¥300,000+/year, textbooks extra. \"If only I could learn for less...\""
  },
  "schedule": {
    "title": "Too busy for fixed lesson times",
    "description": "Work, school, club activities. \"If I could practice in my free time...\""
  },
  "confidence": {
    "title": "Making mistakes feels embarrassing",
    "description": "Speaking English in front of others is scary. \"If I could practice without being judged...\""
  }
},
```

Replace `"solution"`:
```json
"solution": {
  "title": "Blue Connect solves all three",
  "cost": {
    "title": "From ¥2,980/month. Yes, really.",
    "description": "Free plan available too. 1/10th the cost of traditional schools, better learning outcomes"
  },
  "schedule": {
    "title": "5am or 2am — we're ready",
    "description": "AI available 24/7. Book tutor lessons whenever. Zero commute time"
  },
  "confidence": {
    "title": "AI never judges your mistakes",
    "description": "Make errors freely. Build confidence first, then try live lessons when you're ready"
  }
},
```

Replace `"features"`:
```json
"features": {
  "ai": {
    "title": "AI Conversation Partner",
    "description": "Your personal English coach, available 24/7. Practice with text, voice, and roleplay — from business English to casual conversation, adapted to your level."
  },
  "courses": {
    "title": "English Courses",
    "description": "TOEIC, Eiken, and daily conversation. CEFR-aligned A1-C2 curriculum, from elementary English basics to TOEIC 900+ prep."
  },
  "tutors": {
    "title": "Online English Lessons",
    "description": "One-on-one with pro tutors. Video lessons with certified and native tutors. Book from 4 lessons/month, whenever it suits you."
  }
},
```

Replace `"howItWorks"`:
```json
"howItWorks": {
  "title": "How It Works",
  "step1": {
    "title": "Sign up in 30 seconds",
    "description": "Email only. No credit card needed"
  },
  "step2": {
    "title": "AI checks your level",
    "description": "5-minute chat analyzes your strengths and weaknesses"
  },
  "step3": {
    "title": "Start your personal plan",
    "description": "Mix AI practice, courses, and live lessons your way"
  },
  "step4": {
    "title": "Watch yourself grow!",
    "description": "Weekly progress reports make your growth visible"
  }
},
```

Add `"testimonials"` subtitle:
```json
"testimonials": {
  "title": "Loved by Learners",
  "subtitle": "Hear from learners who improved their English with Blue Connect",
```

Replace `"finalCta"`:
```json
"finalCta": {
  "title": "Why not start your English journey today?",
  "subtitle": "The English learning platform chosen by 5,000+ people. Try it now with our free plan.",
  "cta": "Start Free — Just 30 Seconds",
  "trustLine": "No credit card required. Cancel anytime."
}
```

Add `"chatMockup"`:
```json
"chatMockup": {
  "header": "AI English Chat",
  "userMessage": "How do I introduce myself at a business meeting?",
  "aiMessage": "Great question! Here's a natural way: \"Hello, I'm [name] from [company]. It's a pleasure to meet you.\"",
  "badge": "Available 24/7"
}
```

Add dashboard motivational messages:
```json
"welcome": {
  "morning": "Good morning",
  "afternoon": "Good afternoon",
  "evening": "Good evening",
  "morningMotivation": "Let's do our best together today!",
  "afternoonMotivation": "Let's keep practicing this afternoon!",
  "eveningMotivation": "Great work today. How about a little English practice?"
},
```

Add `"quickActionDescriptions"`:
```json
"quickActionDescriptions": {
  "aiChat": "Practice English with AI",
  "findTutor": "Find the right tutor for you",
  "browseCourses": "Explore courses by level"
}
```

**Step 3: Commit**

```bash
git add src/messages/ja.json src/messages/en.json
git commit -m "content: rewrite all copy with emotional storytelling and SEO keywords"
```

---

## Task 3: Upgrade ChatMockup with i18n + Visual Polish

**Files:**
- Modify: `src/components/landing/chat-mockup.tsx`

**Step 1: Rewrite with i18n, larger size, floating badge, tilt**

```typescript
'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

export function ChatMockup() {
  const t = useTranslations('landing.chatMockup')

  return (
    <div className="relative">
      {/* Floating badge */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-2 -top-3 z-10 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-lg"
      >
        {t('badge')}
      </motion.div>

      <div className="glass rounded-2xl p-5 shadow-elevated rotate-1 transition-transform duration-500 hover:rotate-0">
        <div className="mb-3 flex items-center gap-2 border-b border-border/50 pb-3">
          <div className="size-3 rounded-full bg-destructive/60" />
          <div className="size-3 rounded-full bg-accent/60" />
          <div className="size-3 rounded-full bg-[oklch(0.65_0.18_155)]/60" />
          <span className="ml-2 text-xs font-medium text-muted-foreground">{t('header')}</span>
        </div>
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground"
          >
            {t('userMessage')}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm"
          >
            {t('aiMessage')}
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
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/landing/chat-mockup.tsx
git commit -m "feat: upgrade ChatMockup with i18n, floating badge, tilt effect"
```

---

## Task 4: Upgrade Landing Page with New Copy + Visual Enhancements

**Files:**
- Modify: `src/app/[locale]/(public)/page.tsx`

**Step 1: Update the landing page**

Key changes to make (edit existing file, not full rewrite):

1. **Hero h1**: Change `text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl` to `text-5xl font-black tracking-tighter md:text-6xl lg:text-7xl`

2. **Hero subtitle**: Change `text-lg` to `text-base md:text-lg leading-relaxed`

3. **Hero secondary CTA**: Change `{t('footer.cta')}` to `{t('hero.secondaryCta')}` and add `href="#features"` instead of `/pricing`

4. **Add social proof badge after CTAs**: After the CTA div, add:
```tsx
<p className="mt-4 text-sm text-muted-foreground">{t('hero.socialProof')}</p>
```

5. **Chat mockup container**: Change `max-w-md` to `max-w-lg`

6. **Stats bar glass**: Add `border border-white/30` to the glass div

7. **Problem/Solution heading**: Change to use `{t('transform.title')}` (already done) and add subtitle `{t('transform.subtitle')}`

8. **Problem cards**: Add `bg-gradient-to-b from-destructive/8 to-transparent` to Card className

9. **Solution cards**: Add `bg-gradient-to-b from-primary/8 to-transparent` to Card className

10. **Card hover**: Change all `hover:-translate-y-1` to `hover:-translate-y-2` and `hover:shadow-card-hover` to `hover:shadow-xl`

11. **Section h2s**: Change all `text-3xl font-bold md:text-4xl` to `text-3xl font-bold md:text-5xl`

12. **How It Works connecting line**: Change `h-px` and `via-primary/20` to `h-0.5` and `via-primary/30`

13. **Testimonials**: Add subtitle after h2:
```tsx
<p className="mt-3 mb-12 text-center text-lg text-muted-foreground">
  {t('testimonials.subtitle')}
</p>
```
Remove the existing `mb-12` from the h2.

14. **Testimonial cards**: Add unique left accent bars. Change Card className to include:
- 1st card: add `border-l-[3px] border-l-primary`
- 2nd card: add `border-l-[3px] border-l-accent`
- 3rd card: add `border-l-[3px] border-l-[oklch(0.65_0.18_155)]`

To do this, change the testimonials map to pass an accent color array.

15. **Final CTA**: Add trust line after the CTA button:
```tsx
<p className="mt-4 text-sm text-muted-foreground">{t('finalCta.trustLine')}</p>
```

**Step 2: Commit**

```bash
git add "src/app/[locale]/(public)/page.tsx"
git commit -m "feat: upgrade landing page with bolder typography, deeper cards, social proof, trust line"
```

---

## Task 5: Upgrade Feature Tabs with Larger Mockups + Device Frame

**Files:**
- Modify: `src/components/landing/feature-tabs.tsx`

**Step 1: Update the mockup container and add section heading**

Changes:
1. Change mockup container from `max-w-sm` to `max-w-md`
2. Add a device-frame wrapper around the mockup:
```tsx
<div className="w-full max-w-md flex-1">
  <AnimatePresence mode="wait">
    <motion.div
      key={active}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-border/50 bg-background/50 p-2 shadow-elevated"
    >
      <ActiveMockup />
    </motion.div>
  </AnimatePresence>
</div>
```

**Step 2: Commit**

```bash
git add src/components/landing/feature-tabs.tsx
git commit -m "feat: enlarge feature tab mockups with device frame border"
```

---

## Task 6: Upgrade Footer with Social Icons + Newsletter

**Files:**
- Modify: `src/components/landing/footer-nav.tsx`
- Modify: `src/messages/en.json` (add newsletter keys)
- Modify: `src/messages/ja.json` (add newsletter keys)

**Step 1: Add newsletter i18n keys**

In both JSON files, add under `"landing.footerNav"`:
```json
"newsletter": "最新情報を受け取る",
"emailPlaceholder": "メールアドレス"
```
(EN: `"newsletter": "Get updates"`, `"emailPlaceholder": "Your email"`)

**Step 2: Update FooterNav with social icons row and newsletter**

```typescript
'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LanguageToggle } from '@/components/layout/language-toggle'
import { Button } from '@/components/ui/button'

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
            {/* Social icons */}
            <div className="mt-4 flex gap-3">
              {['X', 'IG', 'YT', 'LINE'].map((icon) => (
                <div
                  key={icon}
                  className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {icon}
                </div>
              ))}
            </div>
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

        {/* Newsletter */}
        <div className="mt-8 border-t pt-8">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <span className="text-sm font-medium">{t('footerNav.newsletter')}</span>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={t('footerNav.emailPlaceholder')}
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <Button size="sm" className="bg-primary text-primary-foreground">
                OK
              </Button>
            </div>
          </div>
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

**Step 3: Commit**

```bash
git add src/components/landing/footer-nav.tsx src/messages/en.json src/messages/ja.json
git commit -m "feat: upgrade footer with social icons, newsletter signup"
```

---

## Task 7: Upgrade Dashboard Content — Motivational Messages, Quick Action Descriptions, Timeline Feed

**Files:**
- Modify: `src/app/[locale]/(dashboard)/dashboard/dashboard-content.tsx`

**Step 1: Apply all dashboard visual upgrades**

Key changes:

1. **Add motivational sub-message** after the greeting h1:
```tsx
<p className="mt-1 text-sm text-muted-foreground">
  {t(`welcome.${getGreetingKey()}Motivation`)}
</p>
```

2. **Strengthen welcome gradient**: Change `from-primary/5 to-accent/5` to `from-primary/8 via-primary/3 to-accent/8`

3. **Add description to quick actions**: After the title `<p>`, add:
```tsx
<p className="text-xs text-muted-foreground">{t(`quickActionDescriptions.${key}`)}</p>
```

4. **Activity feed timeline**: Replace `divide-y` with timeline styling. Change each activity item to include a dot + line:
```tsx
<div className="relative pl-6">
  {/* Timeline line */}
  <div className="absolute left-[11px] top-0 h-full w-px bg-border" />

  {[...activities].map((activity, i) => (
    <div key={i} className="relative flex items-start gap-3 pb-4 last:pb-0">
      {/* Timeline dot */}
      <div className={cn('absolute left-[-13px] top-1 size-3 rounded-full border-2 border-background',
        activity.color === 'text-primary' ? 'bg-primary' :
        activity.color === 'text-accent' ? 'bg-accent' : 'bg-[oklch(0.65_0.18_155)]'
      )} />
      <div className={cn('flex size-8 items-center justify-center rounded-lg bg-muted', activity.color)}>
        <activity.icon className="size-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm">{t(activity.textKey)}</p>
      </div>
      <span className="text-xs text-muted-foreground">{t(activity.timeKey)}</span>
    </div>
  ))}
</div>
```

**Step 2: Commit**

```bash
git add "src/app/[locale]/(dashboard)/dashboard/dashboard-content.tsx"
git commit -m "feat: add motivational messages, quick action descriptions, timeline activity feed"
```

---

## Task 8: Final Build Verification + Visual Check

**Step 1: Run build**

Run: `pnpm build`
Expected: Build succeeds

**Step 2: Run lint**

Run: `pnpm lint`
Expected: No new errors from our changes

**Step 3: Visual verification with Playwright**

Navigate to `http://localhost:3001/ja` and verify:
- Hero: bold font-black h1, chat mockup with floating badge and tilt, social proof line
- Stats: stronger glass with visible border
- Problem/Solution: emotional copy, gradient-tinted cards, bigger hover lift
- Features: larger mockups with device frame
- How It Works: visible connecting line
- Testimonials: subtitle text, colored left accent bars
- Final CTA: trust line below button
- Footer: social icons, newsletter input

Navigate to dashboard and verify:
- Motivational sub-message below greeting
- Quick action descriptions
- Timeline-style activity feed with colored dots

**Step 4: Fix any issues and commit**

```bash
git add -A
git commit -m "fix: final polish for push-to-9 redesign"
```
