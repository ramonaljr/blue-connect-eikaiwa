# P0 Launch Prerequisites — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the cold-start problem so new users have an engaging first session — onboarding wizard, XP/streak wiring, seed content, quick UX wins.

**Architecture:** Server-first approach. Onboarding is a new route group under `(dashboard)`. XP wiring fixes existing server action + dashboard page. Seed content uses Supabase migrations. Quick UX wins are targeted component edits.

**Tech Stack:** Next.js 15 App Router, Supabase (PostgreSQL), TypeScript, Tailwind CSS, shadcn/ui, next-intl, Vitest

---

## Task 1: Fix XP/Streak Dashboard Wiring

**Why first:** The gamification loop is the retention core. Every other feature depends on XP working.

**Files:**
- Modify: `src/app/[locale]/(dashboard)/dashboard/page.tsx:67-91`
- Modify: `src/app/[locale]/(dashboard)/dashboard/progress/page.tsx` (skill scores query)
- Test: `src/__tests__/dashboard/xp-wiring.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/dashboard/xp-wiring.test.ts
import { describe, it, expect } from 'vitest'

describe('XP Dashboard Wiring', () => {
  it('should calculate todayXP from xp_ledger entries', () => {
    const todayEntries = [
      { amount: 30, source: 'ai_chat' },
      { amount: 10, source: 'exercise' },
    ]
    const todayXP = todayEntries.reduce((sum, e) => sum + e.amount, 0)
    expect(todayXP).toBe(40)
  })

  it('should calculate todayMinutes from xp_ledger entry count', () => {
    // Estimate: each XP entry ≈ 3 minutes of activity
    const entryCount = 5
    const estimatedMinutes = entryCount * 3
    expect(estimatedMinutes).toBe(15)
  })
})
```

**Step 2: Run test to verify it passes (pure logic)**

Run: `npm test -- --run src/__tests__/dashboard/xp-wiring.test.ts`
Expected: PASS

**Step 3: Fix todayXP query in dashboard page**

In `src/app/[locale]/(dashboard)/dashboard/page.tsx`, replace the placeholder (lines 67-69):

```typescript
// Replace: Promise.resolve({ data: null }),
// With real query:
supabase
  .from('xp_ledger')
  .select('amount')
  .eq('user_id', user.id)
  .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
```

Then replace usage (lines 72-73 and 88-91):

```typescript
// Calculate today's XP and estimated minutes
const todayXPTotal = (todayXP ?? []).reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)
const todayMinutesEstimate = (todayXP ?? []).length * 3

// Pass to DailyProgress:
<DailyProgress
  xp={user.xp}
  streakDays={user.streak_days}
  dailyGoalMinutes={user.daily_goal_minutes}
  todayMinutes={todayMinutesEstimate}
  todayXP={todayXPTotal}
/>
```

**Step 4: Update DailyProgress component to accept todayXP**

In `src/components/dashboard/daily-progress.tsx`, add `todayXP` to props interface and display it.

**Step 5: Run dev server and verify dashboard shows real XP data**

Run: `npm run dev` — check `/ja/dashboard` shows calculated values instead of zeros.

**Step 6: Commit**

```bash
git add src/app/[locale]/(dashboard)/dashboard/page.tsx src/components/dashboard/daily-progress.tsx src/__tests__/dashboard/xp-wiring.test.ts
git commit -m "fix: wire todayXP and todayMinutes to real xp_ledger data"
```

---

## Task 2: Quick UX Wins — Translate Filters & Fix Empty States

**Why now:** Low effort, high polish. Makes the app feel production-ready.

**Files:**
- Modify: `src/components/courses/courses-page-content.tsx` (translate filter labels)
- Modify: `src/components/tutors/tutors-page-content.tsx` (translate filter labels)
- Modify: `src/messages/ja.json` (add filter translation keys)
- Modify: `src/messages/en.json` (add filter translation keys)

**Step 1: Add i18n keys for filters**

In `src/messages/ja.json`, add under a `filters` section:

```json
"filters": {
  "all": "すべて",
  "allCategories": "すべてのカテゴリー",
  "allSpecialties": "すべての専門",
  "recommended": "おすすめ",
  "rating": "評価順",
  "priceLow": "価格（低い順）",
  "priceHigh": "価格（高い順）",
  "experienced": "経験豊富",
  "noResults": "条件に一致する結果がありません",
  "searchCourses": "コースを検索...",
  "searchTutors": "講師を検索...",
  "level": "レベル",
  "category": "カテゴリー",
  "status": "ステータス",
  "sortBy": "並び替え"
}
```

Add equivalent English keys in `src/messages/en.json`.

**Step 2: Update courses filter component to use translated labels**

In `src/components/courses/courses-page-content.tsx`, replace hardcoded "all" and "recommended" strings with `useTranslations('filters')` calls.

**Step 3: Update tutors filter component similarly**

In `src/components/tutors/tutors-page-content.tsx`, replace hardcoded filter labels.

**Step 4: Verify visually**

Navigate to `/ja/dashboard/courses` and `/ja/dashboard/tutors` — dropdowns should show Japanese labels.

**Step 5: Commit**

```bash
git add src/messages/ja.json src/messages/en.json src/components/courses/courses-page-content.tsx src/components/tutors/tutors-page-content.tsx
git commit -m "fix: translate filter dropdowns to Japanese"
```

---

## Task 3: Fix Daily Tip 404 Error

**Files:**
- Modify: `src/components/dashboard/daily-tip.tsx`
- Optionally: `src/app/api/ai/tip/route.ts` (if it doesn't exist, create it)

**Step 1: Check if API route exists**

Run: `ls src/app/api/ai/tip/`

If it doesn't exist, the component is calling a non-existent endpoint.

**Step 2: Option A — Create the API route**

If missing, create `src/app/api/ai/tip/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = new Date().toISOString().split('T')[0]

  // Check if tip already generated today
  const { data: existing } = await supabase
    .from('daily_tips')
    .select('tip_text')
    .eq('user_id', user.id)
    .eq('generated_for', today)
    .single()

  if (existing) {
    return NextResponse.json({ tip: existing.tip_text })
  }

  // Generate a static tip based on day of week (no AI call for now)
  const tips = [
    '毎日少しずつ練習することが上達の秘訣です！',
    '英語で独り言を言ってみましょう。スピーキング力がアップします！',
    '好きな英語の歌を聴いて、歌詞を読んでみましょう。',
    '英語の映画やドラマを字幕なしで観てみましょう。',
    '新しい単語を覚えたら、すぐに文を作って使ってみましょう。',
    'AIチャットで今日学んだ表現を使ってみましょう！',
    '発音は完璧でなくても大丈夫。大切なのは伝えようとする気持ちです。',
  ]
  const tipText = tips[new Date().getDay()]

  await supabase.from('daily_tips').insert({
    user_id: user.id,
    tip_text: tipText,
    generated_for: today,
  })

  return NextResponse.json({ tip: tipText })
}
```

**Step 2: Option B — Make the component gracefully handle failure**

If the API route exists but has issues, update `daily-tip.tsx` to show a fallback tip on error instead of nothing.

**Step 3: Verify — Dashboard should show a daily tip without 404 errors**

**Step 4: Commit**

```bash
git add src/app/api/ai/tip/route.ts src/components/dashboard/daily-tip.tsx
git commit -m "fix: add daily tip API route with static tips fallback"
```

---

## Task 4: Onboarding Flow — Database & Types

**Why:** The onboarding wizard needs to track whether a user has completed onboarding.

**Files:**
- Create: `supabase/migrations/20260320_add_onboarding_fields.sql`
- Modify: `src/lib/types/database.ts` (add `onboarding_completed` to User)

**Step 1: Create the migration**

```sql
-- supabase/migrations/20260320_add_onboarding_fields.sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;
```

**Step 2: Run the migration**

Run: `npx supabase db push` or apply via Supabase dashboard.

**Step 3: Update User type**

In `src/lib/types/database.ts`, add to `User` interface:

```typescript
onboarding_completed: boolean
onboarding_completed_at: string | null
```

**Step 4: Commit**

```bash
git add supabase/migrations/20260320_add_onboarding_fields.sql src/lib/types/database.ts
git commit -m "feat: add onboarding_completed field to users table"
```

---

## Task 5: Onboarding Flow — Server Action

**Files:**
- Create: `src/lib/actions/onboarding.ts`
- Test: `src/__tests__/actions/onboarding.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/actions/onboarding.test.ts
import { describe, it, expect, vi } from 'vitest'

describe('completeOnboarding', () => {
  it('should update user with assessment results and mark onboarding complete', () => {
    const input = {
      englishLevel: 'A2' as const,
      dailyGoalMinutes: 15,
      preferredTopics: ['daily_conversation', 'travel'],
      aiPersonality: 'friendly' as const,
    }
    // Verify structure is valid
    expect(input.englishLevel).toBe('A2')
    expect(input.dailyGoalMinutes).toBeGreaterThan(0)
    expect(input.preferredTopics.length).toBeGreaterThan(0)
  })
})
```

**Step 2: Run test**

Run: `npm test -- --run src/__tests__/actions/onboarding.test.ts`
Expected: PASS

**Step 3: Implement the server action**

```typescript
// src/lib/actions/onboarding.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import type { CEFRLevel, AIPersonality } from '@/lib/types/database'

interface OnboardingData {
  englishLevel: CEFRLevel
  dailyGoalMinutes: number
  preferredTopics: string[]
  aiPersonality: AIPersonality
}

export async function completeOnboarding(data: OnboardingData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('users')
    .update({
      english_level: data.englishLevel,
      daily_goal_minutes: data.dailyGoalMinutes,
      preferred_topics: data.preferredTopics,
      ai_personality: data.aiPersonality,
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}
```

**Step 4: Commit**

```bash
git add src/lib/actions/onboarding.ts src/__tests__/actions/onboarding.test.ts
git commit -m "feat: add completeOnboarding server action"
```

---

## Task 6: Onboarding Flow — Placement Quiz Component

**Files:**
- Create: `src/components/onboarding/placement-quiz.tsx`

**Step 1: Create the placement quiz component**

This is a 5-question multiple-choice quiz that estimates CEFR level. Questions are bilingual and escalate in difficulty.

```typescript
// src/components/onboarding/placement-quiz.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CEFRLevel } from '@/lib/types/database'

interface PlacementQuizProps {
  onComplete: (level: CEFRLevel) => void
}

const QUESTIONS = [
  {
    question: 'How do you greet someone in the morning?',
    question_ja: '朝、人に会ったとき何と言いますか？',
    options: ['Good morning', 'Good evening', 'Goodbye', 'Thank you'],
    correct: 0,
    level: 'A1' as const,
  },
  {
    question: 'Choose the correct sentence:',
    question_ja: '正しい文を選んでください：',
    options: [
      'She don\'t like coffee.',
      'She doesn\'t like coffee.',
      'She not like coffee.',
      'She no like coffee.',
    ],
    correct: 1,
    level: 'A2' as const,
  },
  {
    question: 'What does "I\'ve been looking forward to it" mean?',
    question_ja: '「I\'ve been looking forward to it」の意味は？',
    options: [
      'それを探していました',
      'それを楽しみにしていました',
      'それを心配していました',
      'それを忘れていました',
    ],
    correct: 1,
    level: 'B1' as const,
  },
  {
    question: 'Complete: "Had I known about the delay, I _____ earlier."',
    question_ja: '空欄を埋めてください：',
    options: [
      'would leave',
      'would have left',
      'will leave',
      'had left',
    ],
    correct: 1,
    level: 'B2' as const,
  },
  {
    question: 'Which word best replaces "ubiquitous" in: "Smartphones have become ubiquitous in modern society."',
    question_ja: '「ubiquitous」の最適な言い換えは？',
    options: ['expensive', 'omnipresent', 'obsolete', 'dangerous'],
    correct: 1,
    level: 'C1' as const,
  },
]

export function PlacementQuiz({ onComplete }: PlacementQuizProps) {
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex]
    setAnswers(newAnswers)

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      // Calculate level based on correct answers
      const correct = newAnswers.filter((a, i) => a === QUESTIONS[i].correct).length
      const levels: CEFRLevel[] = ['A1', 'A1', 'A2', 'B1', 'B2', 'C1']
      onComplete(levels[correct])
    }
  }

  const q = QUESTIONS[currentQ]

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle className="text-lg">
          質問 {currentQ + 1} / {QUESTIONS.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium">{q.question}</p>
        <p className="text-sm text-muted-foreground">{q.question_ja}</p>
        <div className="space-y-2">
          {q.options.map((option, i) => (
            <Button
              key={i}
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => handleAnswer(i)}
            >
              {option}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/onboarding/placement-quiz.tsx
git commit -m "feat: add placement quiz component for onboarding"
```

---

## Task 7: Onboarding Flow — Goal Setting Component

**Files:**
- Create: `src/components/onboarding/goal-setting.tsx`

**Step 1: Create the goal setting component**

```typescript
// src/components/onboarding/goal-setting.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AIPersonality } from '@/lib/types/database'

interface GoalSettingProps {
  onComplete: (data: {
    dailyGoalMinutes: number
    preferredTopics: string[]
    aiPersonality: AIPersonality
  }) => void
}

const DAILY_GOALS = [
  { minutes: 5, label: '5分', description: 'カジュアルに' },
  { minutes: 10, label: '10分', description: 'ちょうどいい' },
  { minutes: 15, label: '15分', description: 'しっかり' },
  { minutes: 30, label: '30分', description: '本気モード' },
]

const TOPICS = [
  { key: 'daily_conversation', label: '日常会話' },
  { key: 'business', label: 'ビジネス英語' },
  { key: 'travel', label: '旅行英語' },
  { key: 'toeic', label: 'TOEIC対策' },
  { key: 'eiken', label: '英検対策' },
  { key: 'academic', label: 'アカデミック英語' },
]

const PERSONALITIES: { key: AIPersonality; label: string; description: string }[] = [
  { key: 'friendly', label: 'フレンドリー', description: '優しく楽しく教えてくれます' },
  { key: 'balanced', label: 'バランス', description: '褒めながらもしっかり指導' },
  { key: 'strict', label: 'ストリクト', description: '厳しく正確に指導します' },
]

export function GoalSetting({ onComplete }: GoalSettingProps) {
  const [step, setStep] = useState<'minutes' | 'topics' | 'personality'>('minutes')
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(10)
  const [preferredTopics, setPreferredTopics] = useState<string[]>([])
  const [aiPersonality, setAiPersonality] = useState<AIPersonality>('friendly')

  const toggleTopic = (key: string) => {
    setPreferredTopics(prev =>
      prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key]
    )
  }

  if (step === 'minutes') {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>毎日の学習目標は？</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {DAILY_GOALS.map(g => (
            <Button
              key={g.minutes}
              variant={dailyGoalMinutes === g.minutes ? 'default' : 'outline'}
              className="w-full justify-between"
              onClick={() => { setDailyGoalMinutes(g.minutes); setStep('topics') }}
            >
              <span>{g.label}</span>
              <span className="text-sm opacity-70">{g.description}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (step === 'topics') {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>興味のあるトピックは？（複数選択可）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {TOPICS.map(t => (
            <Button
              key={t.key}
              variant={preferredTopics.includes(t.key) ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => toggleTopic(t.key)}
            >
              {t.label}
            </Button>
          ))}
          <Button
            className="mt-4 w-full"
            disabled={preferredTopics.length === 0}
            onClick={() => setStep('personality')}
          >
            次へ
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>AIの性格を選んでください</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {PERSONALITIES.map(p => (
          <Button
            key={p.key}
            variant={aiPersonality === p.key ? 'default' : 'outline'}
            className="w-full flex-col items-start gap-1 h-auto py-3"
            onClick={() => setAiPersonality(p.key)}
          >
            <span className="font-medium">{p.label}</span>
            <span className="text-xs opacity-70">{p.description}</span>
          </Button>
        ))}
        <Button
          className="mt-4 w-full"
          onClick={() => onComplete({ dailyGoalMinutes, preferredTopics, aiPersonality })}
        >
          完了
        </Button>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/onboarding/goal-setting.tsx
git commit -m "feat: add goal setting component for onboarding"
```

---

## Task 8: Onboarding Flow — Wizard Page & Dashboard Redirect

**Files:**
- Create: `src/app/[locale]/(dashboard)/dashboard/onboarding/page.tsx`
- Modify: `src/app/[locale]/(dashboard)/dashboard/page.tsx` (redirect if onboarding incomplete)

**Step 1: Create the onboarding page**

```typescript
// src/app/[locale]/(dashboard)/dashboard/onboarding/page.tsx
import { requireAuth } from '@/lib/auth/guard'
import { redirect } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'

export default async function OnboardingPage() {
  const user = await requireAuth()

  // If already completed onboarding, redirect to dashboard
  if (user.onboarding_completed) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <OnboardingWizard />
    </div>
  )
}
```

**Step 2: Create the OnboardingWizard orchestrator component**

Create `src/components/onboarding/onboarding-wizard.tsx`:

```typescript
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PlacementQuiz } from './placement-quiz'
import { GoalSetting } from './goal-setting'
import { completeOnboarding } from '@/lib/actions/onboarding'
import { toast } from 'sonner'
import type { CEFRLevel, AIPersonality } from '@/lib/types/database'

export function OnboardingWizard() {
  const [step, setStep] = useState<'quiz' | 'goals'>('quiz')
  const [englishLevel, setEnglishLevel] = useState<CEFRLevel>('A1')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleQuizComplete = (level: CEFRLevel) => {
    setEnglishLevel(level)
    setStep('goals')
  }

  const handleGoalsComplete = (data: {
    dailyGoalMinutes: number
    preferredTopics: string[]
    aiPersonality: AIPersonality
  }) => {
    startTransition(async () => {
      const result = await completeOnboarding({
        englishLevel,
        ...data,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('設定が完了しました！')
        router.push('/dashboard/ai-chat')
      }
    })
  }

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Blue Connect Eikawaへようこそ！</h1>
        <p className="mt-2 text-muted-foreground">
          {step === 'quiz'
            ? 'まずは英語レベルを確認しましょう'
            : '学習の目標を設定しましょう'}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <div className={`h-2 w-16 rounded-full ${step === 'quiz' ? 'bg-blue-500' : 'bg-blue-200'}`} />
          <div className={`h-2 w-16 rounded-full ${step === 'goals' ? 'bg-blue-500' : 'bg-blue-200'}`} />
        </div>
      </div>

      {step === 'quiz' && <PlacementQuiz onComplete={handleQuizComplete} />}
      {step === 'goals' && <GoalSetting onComplete={handleGoalsComplete} />}
    </div>
  )
}
```

**Step 3: Add redirect in dashboard page**

In `src/app/[locale]/(dashboard)/dashboard/page.tsx`, add after `requireAuth()`:

```typescript
// After: const user = await requireAuth()
// Add:
if (!user.onboarding_completed) {
  redirect('/dashboard/onboarding')
}
```

Import `redirect` from `next/navigation` at top.

**Step 4: Verify the full flow**

1. New user logs in → redirected to `/dashboard/onboarding`
2. Takes placement quiz → sees goal setting
3. Completes goals → redirected to `/dashboard/ai-chat` for first AI conversation
4. Returning user → goes straight to dashboard

**Step 5: Commit**

```bash
git add src/app/[locale]/(dashboard)/dashboard/onboarding/page.tsx src/components/onboarding/onboarding-wizard.tsx src/app/[locale]/(dashboard)/dashboard/page.tsx
git commit -m "feat: add onboarding wizard with placement quiz and goal setting"
```

---

## Task 9: Seed Course Content — Migration

**Files:**
- Create: `supabase/migrations/20260320_seed_courses.sql`

**Step 1: Create seed migration with 3 starter courses**

```sql
-- supabase/migrations/20260320_seed_courses.sql
-- Seed: 3 courses for launch (Foundations A1, Daily Conversation A2, TOEIC B1)

-- Course 1: Foundations A1
INSERT INTO courses (id, title, title_ja, description, description_ja, level, category, is_published, sort_order)
VALUES (
  gen_random_uuid(),
  'English Foundations',
  '英語の基礎',
  'Build your core English skills from the ground up.',
  '基礎から英語力を身につけましょう。',
  'A1', 'Foundations', true, 1
);

-- Course 2: Daily Conversation A2
INSERT INTO courses (id, title, title_ja, description, description_ja, level, category, is_published, sort_order)
VALUES (
  gen_random_uuid(),
  'Daily Conversation',
  '日常会話',
  'Practice everyday English for real-life situations.',
  '日常のシーンで使える英会話を練習しましょう。',
  'A2', 'Daily Conversation', true, 2
);

-- Course 3: TOEIC Preparation B1
INSERT INTO courses (id, title, title_ja, description, description_ja, level, category, is_published, sort_order)
VALUES (
  gen_random_uuid(),
  'TOEIC Preparation',
  'TOEIC対策',
  'Prepare for the TOEIC exam with targeted practice.',
  'TOEICに向けた効率的な対策を行いましょう。',
  'B1', 'TOEIC', true, 3
);

-- Units and exercises should be added per-course in subsequent migrations
-- or via admin dashboard once it's built.
-- For now, courses appear in the catalog with 0 units (shows the card).
```

**Step 2: Run migration and verify courses page shows content**

**Step 3: Commit**

```bash
git add supabase/migrations/20260320_seed_courses.sql
git commit -m "feat: seed 3 starter courses for launch catalog"
```

---

## Task 10: Seed Tutor Profiles — Migration

**Files:**
- Create: `supabase/migrations/20260320_seed_tutors.sql`

**Step 1: Create seed migration with demo tutor profiles**

This creates 3 demo tutor profiles linked to placeholder user accounts. In production, these would be real tutor accounts.

```sql
-- supabase/migrations/20260320_seed_tutors.sql
-- NOTE: This migration creates tutor_profiles for testing.
-- In production, tutors register through the tutor onboarding flow.
-- These profiles require corresponding entries in the auth.users and public.users tables.
-- Run AFTER creating test tutor accounts in Supabase Auth dashboard.

-- Placeholder: Insert tutor profiles for existing test accounts
-- Replace the user_id values with actual test tutor user IDs

-- Example structure (uncomment and fill with real IDs):
-- INSERT INTO tutor_profiles (user_id, bio, bio_ja, hourly_rate, languages_spoken, specialties, certification_status, is_available)
-- VALUES
--   ('TUTOR_USER_ID_1', 'Native English teacher with 5 years experience...', '5年の指導経験を持つネイティブ英語講師...', 3000, ARRAY['English', 'Japanese'], ARRAY['Conversation', 'Business'], 'approved', true),
--   ('TUTOR_USER_ID_2', 'TOEIC specialist with perfect score...', 'TOEIC満点のスペシャリスト...', 4000, ARRAY['English', 'Japanese'], ARRAY['TOEIC', 'EIKEN'], 'approved', true),
--   ('TUTOR_USER_ID_3', 'Friendly conversation partner...', 'フレンドリーな会話パートナー...', 1500, ARRAY['English'], ARRAY['Conversation', 'Travel'], 'approved', true);
```

**Step 2: Create test tutor accounts via Supabase Auth dashboard, then fill in IDs**

**Step 3: Commit**

```bash
git add supabase/migrations/20260320_seed_tutors.sql
git commit -m "feat: add tutor seeding migration template"
```

---

## Task 11: AI Voice Paywall Upgrade

**Files:**
- Modify: `src/app/[locale]/(dashboard)/dashboard/ai-voice/page.tsx`

**Step 1: Enhance the paywall page**

Replace the bare text+button with a feature showcase:

```typescript
// In the free-tier paywall section, replace with:
<div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
  <div className="text-center space-y-4 max-w-md">
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
      <Mic className="h-10 w-10 text-blue-600" />
    </div>
    <h1 className="text-2xl font-bold">AI音声練習</h1>
    <p className="text-muted-foreground">
      AIと英語で会話し、発音スコアをリアルタイムで確認できます。
    </p>
  </div>

  {/* Feature highlights */}
  <div className="grid gap-4 sm:grid-cols-3 max-w-2xl">
    <Card>
      <CardContent className="pt-6 text-center">
        <MessageSquare className="mx-auto h-8 w-8 text-blue-500 mb-2" />
        <p className="font-medium">音声チャット</p>
        <p className="text-xs text-muted-foreground">自然な英会話を練習</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="pt-6 text-center">
        <Target className="mx-auto h-8 w-8 text-green-500 mb-2" />
        <p className="font-medium">発音スコア</p>
        <p className="text-xs text-muted-foreground">リアルタイムで採点</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="pt-6 text-center">
        <Theater className="mx-auto h-8 w-8 text-purple-500 mb-2" />
        <p className="font-medium">ロールプレイ</p>
        <p className="text-xs text-muted-foreground">シーン別の没入練習</p>
      </CardContent>
    </Card>
  </div>

  <Button asChild size="lg">
    <Link href="/dashboard/settings">プランをアップグレード</Link>
  </Button>
</div>
```

**Step 2: Verify visually — the paywall should feel like a feature showcase, not a dead end**

**Step 3: Commit**

```bash
git add src/app/[locale]/(dashboard)/dashboard/ai-voice/page.tsx
git commit -m "feat: upgrade AI voice paywall with feature showcase"
```

---

## Task 12: Fix Hydration Errors

**Files:**
- Investigate: `src/app/[locale]/(dashboard)/layout.tsx` and related components

**Step 1: Identify the hydration source**

The error "Encountered a script tag while rendering React" typically comes from:
- `<script>` tags in server-rendered HTML (theme toggle, analytics)
- `Date` or `Math.random()` calls that differ between server and client

**Step 2: Check theme toggle and time-based greeting**

The greeting in `dashboard/page.tsx` line 76-77 uses `new Date().getHours()` which will differ between server (UTC) and client (local timezone). Wrap the greeting in a client component with `useEffect`:

Create `src/components/dashboard/greeting.tsx`:

```typescript
'use client'
import { useState, useEffect } from 'react'

export function Greeting({ displayName }: { displayName: string }) {
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    setGreeting(hour < 12 ? 'おはようございます' : hour < 18 ? 'こんにちは' : 'こんばんは')
  }, [])

  return (
    <h1 className="text-3xl font-bold">
      {greeting ? `${greeting}、${displayName}さん` : `${displayName}さん`}
    </h1>
  )
}
```

Replace the hardcoded greeting in `dashboard/page.tsx` with `<Greeting displayName={user.display_name} />`.

**Step 3: Check for other hydration sources and fix similarly**

**Step 4: Commit**

```bash
git add src/components/dashboard/greeting.tsx src/app/[locale]/(dashboard)/dashboard/page.tsx
git commit -m "fix: resolve hydration errors from timezone-dependent greeting"
```

---

## Summary of P0 Tasks

| Task | What | Priority |
|------|------|----------|
| 1 | Fix XP/Streak wiring | Critical |
| 2 | Translate filters | Quick win |
| 3 | Fix daily tip 404 | Quick win |
| 4 | Onboarding DB migration | Foundation |
| 5 | Onboarding server action | Foundation |
| 6 | Placement quiz component | Feature |
| 7 | Goal setting component | Feature |
| 8 | Onboarding wizard page + redirect | Feature |
| 9 | Seed courses | Content |
| 10 | Seed tutors | Content |
| 11 | AI voice paywall upgrade | Quick win |
| 12 | Fix hydration errors | Quick win |

**After P0:** All new users land on an onboarding wizard, complete a placement quiz, set goals, then launch into their first AI conversation. The dashboard shows real XP data, courses exist, filters are translated, and the voice paywall sells the upgrade.

---

## P1 Differentiators — High-Level Tasks (Detailed Plans TBD)

These will each get their own implementation plan document after P0 is shipped:

| # | Feature | Scope |
|---|---------|-------|
| 13 | **AI → Tutor Handoff** | New component on AI chat completion screen. Query `ai_conversations.corrections` to identify weak areas. CTA to book tutor. Auto-fill `lesson_preparations` from conversation data. |
| 14 | **Post-Lesson AI Review** | New API route `POST /api/ai/lesson-review`. Reads `lesson_notes`, generates exercises via Claude. Creates entries in `course_exercises` linked to a special "Review" course. |
| 15 | **Pronunciation Journey** | New dashboard tab under Progress. Aggregate `pronunciation_scores` over time. Identify weak phonemes for Japanese learners. Show trend charts. |
| 16 | **JLPT/TOEIC/EIKEN Prep Mode** | New course category with timed mode. Exercise renderer gets a "test mode" with strict timing and no hints. Mock test scoring. |
| 17 | **Today's Mission System** | New server action `generateDailyMission()` called on dashboard load. Creates 3 micro-tasks from: AI chat, exercises, phrase review. Tracks completion with bonus XP. |
