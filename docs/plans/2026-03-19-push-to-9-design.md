# Push to 9/10 — Visual, Copy, SEO Design Document

**Date:** 2026-03-19
**Roles:** Senior UI/UX Specialist, Senior Web Designer, SEO Expert, Copywriter
**Goal:** Elevate from 6.5/10 to 9/10 across landing page and dashboard

---

## 1. SEO Foundation

### Meta Tags
- Title: `AI英会話・オンライン英語学習 | Blue Connect Eikaiwa`
- Description: `AIパートナーとリアル講師で英語力アップ。24時間練習OK、月額¥2,980から。小学生からビジネスまで。無料で始めよう。`
- OG tags: title, description, image, type=website
- Structured data: EducationalOrganization + Product schema
- Semantic HTML: proper heading hierarchy, landmark roles
- hreflang tags for ja/en

### Performance SEO
- SSR fallback for animated counters (show final values server-side)
- Preconnect for Supabase, fonts
- Lazy loading for below-fold content

### Keyword Strategy
- H1: "AI英会話" (primary)
- H2s: "オンライン英語学習", "英語コース", "英会話講師"
- Body: "TOEIC", "英検", "ビジネス英語", "小学生英語"

---

## 2. Copywriting Overhaul

### Hero
- JA H1: `AIと一緒に、英語がもっと楽しくなる`
- JA Subtitle: `小学生からビジネスパーソンまで。AI英会話パートナーとプロ講師が、あなたの「話したい」を叶えます。24時間、いつでも、どこでも。`
- EN H1: `English Made Fun — With AI by Your Side`
- EN Subtitle: `From elementary school to the boardroom. Your AI conversation partner and expert tutors turn "I wish I could speak English" into "I just did." Practice 24/7, at your own pace.`
- Primary CTA: `無料で始める` / `Start Free`
- Secondary CTA: `3分で分かる使い方` / `See How It Works` (scroll anchor)
- Social proof badge below CTA: `⭐ 4.9/5 — 5,000人以上が利用中`

### Problem/Solution (Emotional Storytelling)
- Section heading: `こんな経験、ありませんか？` / `Have you experienced this?`
- Pain points rewritten with "if only" pattern:
  - Cost: `英会話スクールは高すぎる` → `月¥2,980から、始められる`
  - Time: `忙しくてレッスンに通えない` → `朝5時でも深夜2時でも`
  - Confidence: `間違えるのが恥ずかしい` → `AIは絶対に笑わない`

### Feature Tabs (SEO-Rich)
- AI: `AI英会話パートナー — 24時間、あなた専用の英語コーチ`
- Courses: `英語コース — TOEIC・英検・日常会話まで`
- Tutors: `オンライン英会話レッスン — プロ講師とマンツーマン`

### How It Works (More Energetic)
1. `30秒で無料登録` — メールアドレスだけでOK
2. `AIがレベルを診断` — 5分の会話で分析
3. `自分だけの学習プランで開始` — AI・コース・レッスンをミックス
4. `成長を実感しよう！` — 毎週の進捗レポート

### Final CTA (Urgency + Trust)
- Heading: `あなたの英語の旅、今日から始めませんか？`
- Subtitle: `5,000人以上が選んだ英語学習プラットフォーム。無料プランで今すぐ体験。`
- CTA: `無料で始める — たった30秒`
- Trust line: `クレジットカード不要 ・ いつでもキャンセルOK`

---

## 3. Visual Design Push

### Typography
- Add Noto Sans JP weight 900 for display headings
- Hero h1: text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter
- Section h2s: text-3xl md:text-5xl font-bold
- Body: text-base md:text-lg leading-relaxed

### Hero Visual
- Stronger gradient mesh with CSS @keyframes slow hue shift
- Chat mockup: larger (max-w-lg), subtle rotate-2 tilt
- i18n chat bubbles (Japanese when locale=ja)
- Floating "24時間対応" badge with pulse animation

### Card Depth
- Glass: bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)]
- Problem cards: red-tinted top gradient
- Solution cards: blue-tinted top gradient
- Testimonial cards: left accent bar (3px, unique colors)
- Hover: -translate-y-2 shadow-xl (more dramatic)

### Stats Bar
- Icons before each stat
- Stronger border: border border-white/30
- SSR final values, animate on client

### How It Works Line
- Visible h-0.5 bg-primary/30 gradient line
- Dots at connection points

### Feature Tabs
- Larger mockup: max-w-md
- Device frame border around mockups

### Footer
- Social icons: Twitter/X, Instagram, YouTube, LINE
- Newsletter: email input + "最新情報を受け取る"

---

## 4. Dashboard Elevation

### Welcome Area
- Motivational sub-messages (time-aware)
- Stronger gradient: from-primary/8 via-primary/3 to-accent/8

### Stat Cards
- Mini SVG sparkline charts (5-point trend)
- "vs last week" arrow indicators
- Stronger glassmorphism

### Quick Actions
- Larger icons (size-12 in size-14 container)
- Per-card gradient background on hover
- Description subtitle per action

### Activity Feed
- Proper timeline: vertical line + colored dots
- Detailed timestamps

### Sidebar Streak
- Mini achievement card with gradient background
- Progress bar to next milestone
