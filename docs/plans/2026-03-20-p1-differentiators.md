# P1 Competitive Differentiators — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build 5 features that create a defensible moat — the AI→Tutor→AI flywheel, pronunciation tracking, test prep mode, and daily missions.

**Architecture:** Each feature is a vertical slice (server action + component + page integration). Features 1 & 2 form the flywheel loop. Features 3-5 are independent engagement boosters.

**Tech Stack:** Next.js 15 App Router, Supabase (PostgreSQL), TypeScript, Tailwind CSS, shadcn/ui, Claude API, next-intl, Vitest

---

## Feature 1: AI → Tutor Handoff

The killer differentiator. After an AI conversation, analyze corrections to identify weak areas and suggest booking a tutor session focused on those areas. Auto-fill lesson preparation.

### Task 1: Server Action — Analyze Conversation Weaknesses

**Files:**
- Create: `src/lib/actions/ai-handoff.ts`
- Test: `src/__tests__/actions/ai-handoff.test.ts`

**Step 1: Write the test**

```typescript
// src/__tests__/actions/ai-handoff.test.ts
import { describe, it, expect } from 'vitest'

describe('analyzeConversationWeaknesses', () => {
  it('should categorize corrections by type', () => {
    const corrections = [
      { original: 'I go yesterday', corrected: 'I went yesterday', type: 'grammar', explanation: 'Past tense' },
      { original: 'I eat lunch', corrected: 'I had lunch', type: 'vocabulary', explanation: 'More natural phrasing' },
      { original: 'I go yesterday', corrected: 'I went yesterday', type: 'grammar', explanation: 'Verb conjugation' },
    ]
    const categories: Record<string, number> = {}
    corrections.forEach(c => {
      categories[c.type] = (categories[c.type] || 0) + 1
    })
    expect(categories).toEqual({ grammar: 2, vocabulary: 1 })
  })

  it('should identify the primary weakness', () => {
    const categories = { grammar: 3, vocabulary: 1, pronunciation: 0 }
    const primary = Object.entries(categories).sort(([, a], [, b]) => b - a)[0]
    expect(primary[0]).toBe('grammar')
  })
})
```

**Step 2: Run test**
Run: `npm test -- --run src/__tests__/actions/ai-handoff.test.ts`

**Step 3: Implement the server action**

```typescript
// src/lib/actions/ai-handoff.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import type { AICorrection } from '@/lib/types/database'

interface WeaknessAnalysis {
  primaryWeakness: string
  correctionCount: number
  categories: Record<string, number>
  suggestedTopics: string
  suggestedVocabulary: string[]
  suggestedGoals: string[]
}

export async function analyzeConversationWeaknesses(
  conversationId: string
): Promise<{ error: string } | { data: WeaknessAnalysis }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: conversation } = await supabase
    .from('ai_conversations')
    .select('corrections, scenario, messages')
    .eq('id', conversationId)
    .eq('user_id', user.id)
    .single()

  if (!conversation) return { error: 'Conversation not found' }

  const corrections: AICorrection[] = conversation.corrections ?? []
  const categories: Record<string, number> = {}
  const vocabulary: string[] = []

  corrections.forEach(c => {
    categories[c.type] = (categories[c.type] || 0) + 1
    if (c.type === 'vocabulary') vocabulary.push(c.corrected)
  })

  const sorted = Object.entries(categories).sort(([, a], [, b]) => b - a)
  const primaryWeakness = sorted[0]?.[0] ?? 'general'

  const topicMap: Record<string, string> = {
    grammar: '文法の基礎を復習しましょう',
    vocabulary: '語彙力を強化しましょう',
    pronunciation: '発音を集中的に練習しましょう',
    usage: '自然な表現を身につけましょう',
  }

  return {
    data: {
      primaryWeakness,
      correctionCount: corrections.length,
      categories,
      suggestedTopics: topicMap[primaryWeakness] ?? '英会話の総合力を高めましょう',
      suggestedVocabulary: vocabulary.slice(0, 10),
      suggestedGoals: [`${primaryWeakness}のスキルを向上させる`],
    },
  }
}

export async function createLessonPrepFromConversation(
  conversationId: string,
  lessonId: string
): Promise<{ error: string } | { success: true }> {
  const result = await analyzeConversationWeaknesses(conversationId)
  if ('error' in result) return { error: result.error }

  const supabase = await createClient()
  const { error } = await supabase.from('lesson_preparations').upsert({
    lesson_id: lessonId,
    topics: result.data.suggestedTopics,
    vocabulary: result.data.suggestedVocabulary,
    goals: result.data.suggestedGoals,
  }, { onConflict: 'lesson_id' })

  if (error) return { error: error.message }
  return { success: true }
}
```

**Step 4: Commit**
```bash
git add src/lib/actions/ai-handoff.ts src/__tests__/actions/ai-handoff.test.ts
git commit -m "feat: add AI conversation weakness analysis server action"
```

---

### Task 2: Post-Conversation Handoff Panel Component

**Files:**
- Create: `src/components/ai/tutor-handoff-panel.tsx`

**Step 1: Create the component**

```typescript
// src/components/ai/tutor-handoff-panel.tsx
'use client'

import { useState, useEffect, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, ArrowRight, BookOpen } from 'lucide-react'
import { analyzeConversationWeaknesses } from '@/lib/actions/ai-handoff'
import Link from 'next/link'

interface TutorHandoffPanelProps {
  conversationId: string | null
  correctionCount: number
}

export function TutorHandoffPanel({ conversationId, correctionCount }: TutorHandoffPanelProps) {
  const [analysis, setAnalysis] = useState<{
    primaryWeakness: string
    categories: Record<string, number>
    suggestedTopics: string
  } | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!conversationId || correctionCount === 0) return
    startTransition(async () => {
      const result = await analyzeConversationWeaknesses(conversationId)
      if ('data' in result) setAnalysis(result.data)
    })
  }, [conversationId, correctionCount])

  if (!analysis || correctionCount < 2) return null

  const weaknessLabels: Record<string, string> = {
    grammar: '文法',
    vocabulary: '語彙',
    pronunciation: '発音',
    usage: '表現',
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-blue-600" />
          講師とさらに上達しませんか？
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          今回の会話で{correctionCount}個の修正がありました。
          {analysis.suggestedTopics}
        </p>
        <div className="flex flex-wrap gap-1">
          {Object.entries(analysis.categories).map(([type, count]) => (
            <Badge key={type} variant="secondary">
              {weaknessLabels[type] ?? type}: {count}回
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href="/dashboard/tutors">
              講師を探す <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/courses">
              <BookOpen className="mr-1 h-4 w-4" /> 関連コースを見る
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Commit**
```bash
git add src/components/ai/tutor-handoff-panel.tsx
git commit -m "feat: add tutor handoff panel for post-conversation upsell"
```

---

### Task 3: Integrate Handoff Panel into Chat Interface

**Files:**
- Modify: `src/components/ai/chat-interface.tsx`

**Step 1: Read `src/components/ai/chat-interface.tsx` to find where conversation ends**

**Step 2: Import and render TutorHandoffPanel**

Add import at top:
```typescript
import { TutorHandoffPanel } from './tutor-handoff-panel'
```

At the bottom of the chat interface (after the message list, before input), add:
```typescript
{!isStreaming && messages.length > 4 && (
  <TutorHandoffPanel
    conversationId={conversationId}
    correctionCount={corrections.size}
  />
)}
```

The panel only shows when:
- Not currently streaming
- At least 5 messages exchanged (meaningful conversation)
- Has corrections (checked inside the component)

**Step 3: Commit**
```bash
git add src/components/ai/chat-interface.tsx
git commit -m "feat: integrate tutor handoff panel into AI chat"
```

---

## Feature 2: Post-Lesson AI Review

After a tutor session, AI generates a review with personalized exercises from lesson notes.

### Task 4: Server Action — Generate Lesson Review Exercises

**Files:**
- Create: `src/lib/actions/lesson-ai-review.ts`
- Test: `src/__tests__/actions/lesson-ai-review.test.ts`

**Step 1: Write the test**

```typescript
// src/__tests__/actions/lesson-ai-review.test.ts
import { describe, it, expect } from 'vitest'

describe('generateLessonReviewExercises', () => {
  it('should format lesson data into exercise prompts', () => {
    const lessonData = {
      tutorNotes: 'Student struggles with past participles. Good vocabulary.',
      topics: 'Business meetings',
      vocabulary: ['agenda', 'stakeholder', 'deliverable'],
    }
    const prompt = `Based on lesson notes: ${lessonData.tutorNotes}\nTopic: ${lessonData.topics}\nVocabulary: ${lessonData.vocabulary.join(', ')}`
    expect(prompt).toContain('past participles')
    expect(prompt).toContain('agenda')
  })
})
```

**Step 2: Implement**

```typescript
// src/lib/actions/lesson-ai-review.ts
'use server'

import { createClient } from '@/lib/supabase/server'

interface ReviewExercise {
  type: 'fill_blank' | 'multiple_choice'
  question: string
  question_ja: string
  options: string[]
  correct_answer: string
  explanation: string
  explanation_ja: string
}

export async function generateLessonReviewExercises(
  lessonId: string
): Promise<{ error: string } | { data: ReviewExercise[] }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Fetch lesson + notes + prep
  const [{ data: lesson }, { data: notes }, { data: prep }] = await Promise.all([
    supabase.from('lessons').select('*').eq('id', lessonId).eq('learner_id', user.id).single(),
    supabase.from('lesson_notes').select('*').eq('lesson_id', lessonId).single(),
    supabase.from('lesson_preparations').select('*').eq('lesson_id', lessonId).single(),
  ])

  if (!lesson) return { error: 'Lesson not found' }

  const context = [
    notes?.shared_notes && `Notes: ${notes.shared_notes}`,
    notes?.tutor_private_notes && `Tutor observations: ${notes.tutor_private_notes}`,
    prep?.topics && `Topic: ${prep.topics}`,
    prep?.vocabulary?.length && `Vocabulary: ${prep.vocabulary.join(', ')}`,
  ].filter(Boolean).join('\n')

  if (!context) {
    return { data: [] } // No lesson data to generate from
  }

  // For MVP: Generate static exercises from vocabulary
  // TODO: Replace with Claude API call for dynamic generation
  const exercises: ReviewExercise[] = (prep?.vocabulary ?? []).slice(0, 3).map((word: string) => ({
    type: 'fill_blank' as const,
    question: `Complete the sentence using "${word}": The _____ was discussed in the meeting.`,
    question_ja: `「${word}」を使って文を完成させてください。`,
    options: [word, 'something', 'nothing', 'everything'],
    correct_answer: word,
    explanation: `"${word}" was a key vocabulary item from your lesson.`,
    explanation_ja: `「${word}」はレッスンで学んだ重要な語彙です。`,
  }))

  return { data: exercises }
}
```

**Step 3: Commit**
```bash
git add src/lib/actions/lesson-ai-review.ts src/__tests__/actions/lesson-ai-review.test.ts
git commit -m "feat: add post-lesson AI review exercise generation"
```

---

### Task 5: Lesson Review Exercises Component

**Files:**
- Create: `src/components/lessons/lesson-review-exercises.tsx`

**Step 1: Create the component**

```typescript
// src/components/lessons/lesson-review-exercises.tsx
'use client'

import { useState, useEffect, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, CheckCircle, ArrowRight } from 'lucide-react'
import { generateLessonReviewExercises } from '@/lib/actions/lesson-ai-review'

interface LessonReviewExercisesProps {
  lessonId: string
}

export function LessonReviewExercises({ lessonId }: LessonReviewExercisesProps) {
  const [exercises, setExercises] = useState<Array<{
    type: string; question: string; question_ja: string
    options: string[]; correct_answer: string
    explanation: string; explanation_ja: string
  }>>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const result = await generateLessonReviewExercises(lessonId)
      if ('data' in result) setExercises(result.data)
    })
  }, [lessonId])

  if (exercises.length === 0) return null

  const current = exercises[currentIndex]
  const isCorrect = selectedAnswer === current.correct_answer
  const isComplete = currentIndex >= exercises.length

  if (isComplete) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
          <p className="font-medium">復習完了！</p>
          <p className="text-sm text-muted-foreground mt-1">
            レッスンで学んだことを定着させました
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-5 w-5" />
          レッスン復習 ({currentIndex + 1}/{exercises.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-medium">{current.question}</p>
        <p className="text-sm text-muted-foreground">{current.question_ja}</p>
        <div className="space-y-2">
          {current.options.map((opt) => (
            <Button
              key={opt}
              variant={
                selectedAnswer === opt
                  ? isCorrect ? 'default' : 'destructive'
                  : 'outline'
              }
              className="w-full justify-start"
              disabled={showExplanation}
              onClick={() => {
                setSelectedAnswer(opt)
                setShowExplanation(true)
              }}
            >
              {opt}
            </Button>
          ))}
        </div>
        {showExplanation && (
          <div className="rounded-md bg-muted p-3 text-sm">
            <p>{isCorrect ? '正解！' : '不正解'}</p>
            <p className="text-muted-foreground mt-1">{current.explanation_ja}</p>
            <Button
              size="sm"
              className="mt-2"
              onClick={() => {
                setCurrentIndex(currentIndex + 1)
                setSelectedAnswer(null)
                setShowExplanation(false)
              }}
            >
              次へ <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

**Step 2: Integrate into lesson summary page**

In `src/app/[locale]/(dashboard)/dashboard/lessons/[id]/page.tsx`, add the component after the lesson review section for completed lessons.

**Step 3: Commit**
```bash
git add src/components/lessons/lesson-review-exercises.tsx
git commit -m "feat: add lesson review exercises component"
```

---

## Feature 3: Pronunciation Journey

Track pronunciation scores over time. Identify weak phonemes specific to Japanese learners.

### Task 6: Server Action — Fetch Pronunciation History

**Files:**
- Create: `src/lib/actions/pronunciation.ts`
- Test: `src/__tests__/actions/pronunciation.test.ts`

**Step 1: Write test**

```typescript
// src/__tests__/actions/pronunciation.test.ts
import { describe, it, expect } from 'vitest'

describe('Pronunciation Analysis', () => {
  it('should identify weakest phonemes from scores', () => {
    const phonemeScores = [
      { phoneme: 'l', score: 45 },
      { phoneme: 'r', score: 40 },
      { phoneme: 'th', score: 55 },
      { phoneme: 'v', score: 50 },
      { phoneme: 'b', score: 85 },
    ]
    const weakest = phonemeScores
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
    expect(weakest[0].phoneme).toBe('r')
    expect(weakest[1].phoneme).toBe('l')
  })

  it('should calculate trend from time-series scores', () => {
    const scores = [
      { date: '2026-03-01', score: 60 },
      { date: '2026-03-08', score: 65 },
      { date: '2026-03-15', score: 72 },
    ]
    const trend = scores[scores.length - 1].score - scores[0].score
    expect(trend).toBe(12) // Improving
  })
})
```

**Step 2: Implement**

```typescript
// src/lib/actions/pronunciation.ts
'use server'

import { createClient } from '@/lib/supabase/server'

// Phonemes that Japanese speakers commonly struggle with
const JA_DIFFICULT_PHONEMES = ['l', 'r', 'th', 'v', 'f', 'si', 'zi', 'w', 'dʒ', 'æ']

interface PronunciationHistory {
  overallTrend: Array<{ date: string; score: number }>
  weakPhonemes: Array<{ phoneme: string; averageScore: number; practiceCount: number }>
  totalSessions: number
  averageScore: number
  bestScore: number
}

export async function getPronunciationHistory(): Promise<
  { error: string } | { data: PronunciationHistory }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: scores } = await supabase
    .from('pronunciation_scores')
    .select('overall_score, phoneme_scores, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (!scores || scores.length === 0) {
    return {
      data: {
        overallTrend: [],
        weakPhonemes: [],
        totalSessions: 0,
        averageScore: 0,
        bestScore: 0,
      },
    }
  }

  // Aggregate overall trend by date
  const trendMap = new Map<string, number[]>()
  scores.forEach(s => {
    const date = s.created_at.split('T')[0]
    if (!trendMap.has(date)) trendMap.set(date, [])
    trendMap.get(date)!.push(s.overall_score)
  })
  const overallTrend = Array.from(trendMap.entries()).map(([date, vals]) => ({
    date,
    score: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
  }))

  // Aggregate phoneme scores
  const phonemeMap = new Map<string, number[]>()
  scores.forEach(s => {
    (s.phoneme_scores ?? []).forEach((ps: { phoneme: string; score: number }) => {
      if (!phonemeMap.has(ps.phoneme)) phonemeMap.set(ps.phoneme, [])
      phonemeMap.get(ps.phoneme)!.push(ps.score)
    })
  })

  const weakPhonemes = Array.from(phonemeMap.entries())
    .map(([phoneme, vals]) => ({
      phoneme,
      averageScore: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
      practiceCount: vals.length,
    }))
    .filter(p => JA_DIFFICULT_PHONEMES.includes(p.phoneme))
    .sort((a, b) => a.averageScore - b.averageScore)

  const allScores = scores.map(s => s.overall_score)

  return {
    data: {
      overallTrend,
      weakPhonemes,
      totalSessions: scores.length,
      averageScore: Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length),
      bestScore: Math.max(...allScores),
    },
  }
}
```

**Step 3: Commit**
```bash
git add src/lib/actions/pronunciation.ts src/__tests__/actions/pronunciation.test.ts
git commit -m "feat: add pronunciation history server action with phoneme analysis"
```

---

### Task 7: Pronunciation Journey Tab Component

**Files:**
- Create: `src/components/progress/pronunciation-tab.tsx`
- Modify: `src/components/progress/progress-page-content.tsx` (add tab)

**Step 1: Create the tab component**

```typescript
// src/components/progress/pronunciation-tab.tsx
'use client'

import { useState, useEffect, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Mic, TrendingUp, AlertTriangle } from 'lucide-react'
import { getPronunciationHistory } from '@/lib/actions/pronunciation'

export function PronunciationTab({ userId }: { userId: string }) {
  const [data, setData] = useState<{
    overallTrend: Array<{ date: string; score: number }>
    weakPhonemes: Array<{ phoneme: string; averageScore: number; practiceCount: number }>
    totalSessions: number
    averageScore: number
    bestScore: number
  } | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const result = await getPronunciationHistory()
      if ('data' in result) setData(result.data)
    })
  }, [userId])

  if (!data) return <div className="text-center py-8 text-muted-foreground">読み込み中...</div>

  if (data.totalSessions === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <Mic className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="font-medium">発音データがありません</p>
        <p className="text-sm text-muted-foreground">
          AI音声で練習すると、発音スコアがここに表示されます
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{data.averageScore}</p>
            <p className="text-sm text-muted-foreground">平均スコア</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{data.bestScore}</p>
            <p className="text-sm text-muted-foreground">最高スコア</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{data.totalSessions}</p>
            <p className="text-sm text-muted-foreground">練習回数</p>
          </CardContent>
        </Card>
      </div>

      {/* Weak phonemes */}
      {data.weakPhonemes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              苦手な発音（日本人学習者向け）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.weakPhonemes.slice(0, 5).map(p => (
              <div key={p.phoneme} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">{p.phoneme}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {p.practiceCount}回練習
                    </span>
                  </div>
                  <span className="text-sm font-medium">{p.averageScore}%</span>
                </div>
                <Progress value={p.averageScore} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Trend */}
      {data.overallTrend.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5" />
              スコア推移
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-32">
              {data.overallTrend.slice(-30).map((d, i) => (
                <div
                  key={i}
                  className="flex-1 bg-blue-500 rounded-t"
                  style={{ height: `${d.score}%` }}
                  title={`${d.date}: ${d.score}%`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

**Step 2: Add tab to progress page**

In `src/components/progress/progress-page-content.tsx`:
- Import: `import { PronunciationTab } from './pronunciation-tab'`
- Add TabsTrigger: `<TabsTrigger value="pronunciation">発音</TabsTrigger>`
- Add TabsContent:
```typescript
<TabsContent value="pronunciation">
  <PronunciationTab userId={user.id} />
</TabsContent>
```

**Step 3: Commit**
```bash
git add src/components/progress/pronunciation-tab.tsx src/components/progress/progress-page-content.tsx
git commit -m "feat: add pronunciation journey tab to progress page"
```

---

## Feature 4: Test Prep Mode (TOEIC/EIKEN)

### Task 8: Add Test Mode to Exercise Renderer

**Files:**
- Modify: `src/components/courses/exercise-renderer.tsx`
- Modify: `src/components/courses/exercises/multiple-choice.tsx`

**Step 1: Read both files first**

**Step 2: Add `testMode` prop to ExerciseRenderer**

```typescript
interface ExerciseRendererProps {
  exercise: CourseExercise
  locale: string
  onComplete: (score: number) => void
  testMode?: boolean  // NEW
}
```

Pass `testMode` to each child exercise component.

**Step 3: Update MultipleChoice for test mode behavior**

In test mode:
- Disable hints
- Enforce time limit strictly (auto-submit on timeout)
- No retry attempts (one shot)
- Don't show explanation until all exercises complete

Add prop `testMode?: boolean` and conditionally:
```typescript
if (testMode) {
  // Hide hint button
  // Single attempt only
  // Strict timer
}
```

**Step 4: Commit**
```bash
git add src/components/courses/exercise-renderer.tsx src/components/courses/exercises/multiple-choice.tsx
git commit -m "feat: add test mode to exercise renderer for exam prep"
```

---

### Task 9: Test Prep Page Route

**Files:**
- Create: `src/app/[locale]/(dashboard)/dashboard/courses/[id]/test/page.tsx`

**Step 1: Create the test prep page**

```typescript
// src/app/[locale]/(dashboard)/dashboard/courses/[id]/test/page.tsx
import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { TestPrepMode } from '@/components/courses/test-prep-mode'

export default async function TestPrepPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id, locale } = await params
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('*, units:course_units(*, exercises:course_exercises(*))')
    .eq('id', id)
    .single()

  if (!course) notFound()

  // Collect all exercises across all units
  const allExercises = (course.units ?? [])
    .flatMap((u: { exercises: unknown[] }) => u.exercises ?? [])

  return (
    <TestPrepMode
      courseName={locale === 'ja' ? course.title_ja : course.title}
      exercises={allExercises}
      locale={locale}
    />
  )
}
```

**Step 2: Create TestPrepMode component**

Create `src/components/courses/test-prep-mode.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Timer, CheckCircle } from 'lucide-react'
import { ExerciseRenderer } from './exercise-renderer'
import type { CourseExercise } from '@/lib/types/database'

interface TestPrepModeProps {
  courseName: string
  exercises: CourseExercise[]
  locale: string
}

export function TestPrepMode({ courseName, exercises, locale }: TestPrepModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const [startTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setElapsed(Date.now() - startTime), 1000)
    return () => clearInterval(timer)
  }, [startTime])

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000)
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  }

  if (currentIndex >= exercises.length) {
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    return (
      <div className="mx-auto max-w-lg space-y-6 py-12 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="text-2xl font-bold">テスト完了！</h1>
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{avgScore}%</p>
            <p className="text-xs text-muted-foreground">平均スコア</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{exercises.length}</p>
            <p className="text-xs text-muted-foreground">問題数</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{formatTime(elapsed)}</p>
            <p className="text-xs text-muted-foreground">所要時間</p>
          </CardContent></Card>
        </div>
        <Button onClick={() => { setCurrentIndex(0); setScores([]) }}>
          もう一度
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{courseName} — テストモード</h1>
        <div className="flex items-center gap-3">
          <Badge variant="outline">
            <Timer className="mr-1 h-3 w-3" /> {formatTime(elapsed)}
          </Badge>
          <Badge>{currentIndex + 1} / {exercises.length}</Badge>
        </div>
      </div>
      <ExerciseRenderer
        exercise={exercises[currentIndex]}
        locale={locale}
        testMode={true}
        onComplete={(score) => {
          setScores([...scores, score])
          setCurrentIndex(currentIndex + 1)
        }}
      />
    </div>
  )
}
```

**Step 3: Commit**
```bash
git add src/app/[locale]/(dashboard)/dashboard/courses/[id]/test/page.tsx src/components/courses/test-prep-mode.tsx
git commit -m "feat: add test prep mode page for TOEIC/EIKEN courses"
```

---

## Feature 5: Today's Mission System

Daily personalized micro-challenges with bonus XP.

### Task 10: Server Action — Generate Daily Missions

**Files:**
- Create: `src/lib/actions/missions.ts`
- Test: `src/__tests__/actions/missions.test.ts`

**Step 1: Write test**

```typescript
// src/__tests__/actions/missions.test.ts
import { describe, it, expect } from 'vitest'

describe('Daily Missions', () => {
  it('should generate 3 missions from activity types', () => {
    const activityTypes = ['ai_chat', 'exercise', 'phrases']
    const missions = activityTypes.map(type => ({
      type,
      title: `Complete a ${type} activity`,
      target: 1,
      current: 0,
      xpReward: 25,
    }))
    expect(missions).toHaveLength(3)
    expect(missions[0].xpReward).toBe(25)
  })
})
```

**Step 2: Implement**

```typescript
// src/lib/actions/missions.ts
'use server'

import { createClient } from '@/lib/supabase/server'

interface DailyMission {
  id: string
  type: string
  title: string
  title_ja: string
  target: number
  current: number
  xpReward: number
  completed: boolean
}

export async function getDailyMissions(): Promise<
  { error: string } | { data: DailyMission[] }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const today = new Date().toISOString().split('T')[0]

  // Count today's activities
  const [
    { count: chatCount },
    { count: exerciseCount },
    { count: phraseCount },
  ] = await Promise.all([
    supabase.from('ai_conversations').select('*', { count: 'exact', head: true })
      .eq('user_id', user.id).gte('created_at', `${today}T00:00:00`),
    supabase.from('exercise_attempts').select('*', { count: 'exact', head: true })
      .eq('user_id', user.id).gte('created_at', `${today}T00:00:00`),
    supabase.from('saved_phrases').select('*', { count: 'exact', head: true })
      .eq('user_id', user.id).gte('created_at', `${today}T00:00:00`),
  ])

  const missions: DailyMission[] = [
    {
      id: `${today}-chat`,
      type: 'ai_chat',
      title: 'Have an AI conversation',
      title_ja: 'AI英会話を1回する',
      target: 1,
      current: Math.min(chatCount ?? 0, 1),
      xpReward: 25,
      completed: (chatCount ?? 0) >= 1,
    },
    {
      id: `${today}-exercise`,
      type: 'exercise',
      title: 'Complete 3 exercises',
      title_ja: '練習問題を3つ解く',
      target: 3,
      current: Math.min(exerciseCount ?? 0, 3),
      xpReward: 25,
      completed: (exerciseCount ?? 0) >= 3,
    },
    {
      id: `${today}-phrases`,
      type: 'phrases',
      title: 'Save 2 new phrases',
      title_ja: 'フレーズを2つ保存する',
      target: 2,
      current: Math.min(phraseCount ?? 0, 2),
      xpReward: 25,
      completed: (phraseCount ?? 0) >= 2,
    },
  ]

  return { data: missions }
}

export async function claimMissionReward(
  missionId: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Verify mission is actually completed by re-checking
  const result = await getDailyMissions()
  if ('error' in result) return { error: result.error }

  const mission = result.data.find(m => m.id === missionId)
  if (!mission) return { error: 'Mission not found' }
  if (!mission.completed) return { error: 'Mission not yet completed' }

  // Award XP (using dynamic import to avoid circular dependency)
  const { awardXP } = await import('./progress')
  await awardXP(user.id, mission.xpReward, 'daily_mission', missionId)

  return { success: true }
}
```

**Step 3: Commit**
```bash
git add src/lib/actions/missions.ts src/__tests__/actions/missions.test.ts
git commit -m "feat: add daily missions server action with XP rewards"
```

---

### Task 11: Today's Missions Dashboard Widget

**Files:**
- Create: `src/components/dashboard/todays-missions.tsx`
- Modify: `src/app/[locale]/(dashboard)/dashboard/page.tsx` (add widget)

**Step 1: Create the widget**

```typescript
// src/components/dashboard/todays-missions.tsx
'use client'

import { useState, useEffect, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Target, Gift, CheckCircle } from 'lucide-react'
import { getDailyMissions, claimMissionReward } from '@/lib/actions/missions'
import { toast } from 'sonner'

export function TodaysMissions() {
  const [missions, setMissions] = useState<Array<{
    id: string; type: string; title_ja: string
    target: number; current: number; xpReward: number; completed: boolean
  }>>([])
  const [claimed, setClaimed] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const result = await getDailyMissions()
      if ('data' in result) setMissions(result.data)
    })
  }, [])

  const handleClaim = (missionId: string) => {
    startTransition(async () => {
      const result = await claimMissionReward(missionId)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        setClaimed(prev => new Set(prev).add(missionId))
        toast.success('+25 XP 獲得！')
      }
    })
  }

  if (missions.length === 0) return null

  const completedCount = missions.filter(m => m.completed).length

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-5 w-5 text-blue-600" />
          今日のミッション ({completedCount}/{missions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {missions.map(m => (
          <div key={m.id} className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className={m.completed ? 'line-through text-muted-foreground' : ''}>
                  {m.title_ja}
                </span>
                <span className="text-xs text-muted-foreground">
                  {m.current}/{m.target}
                </span>
              </div>
              <Progress value={(m.current / m.target) * 100} className="h-1.5" />
            </div>
            {m.completed && !claimed.has(m.id) ? (
              <Button size="sm" variant="outline" onClick={() => handleClaim(m.id)}>
                <Gift className="mr-1 h-3 w-3" /> +{m.xpReward}XP
              </Button>
            ) : m.completed ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
```

**Step 2: Add to dashboard page**

In `src/app/[locale]/(dashboard)/dashboard/page.tsx`:
- Import: `import { TodaysMissions } from '@/components/dashboard/todays-missions'`
- Add after QuickActions: `<TodaysMissions />`

**Step 3: Commit**
```bash
git add src/components/dashboard/todays-missions.tsx src/app/[locale]/(dashboard)/dashboard/page.tsx
git commit -m "feat: add Today's Missions widget to dashboard with XP rewards"
```

---

## Summary

| Task | Feature | What |
|------|---------|------|
| 1 | AI→Tutor Handoff | Weakness analysis server action |
| 2 | AI→Tutor Handoff | Tutor handoff panel component |
| 3 | AI→Tutor Handoff | Integrate panel into chat interface |
| 4 | Post-Lesson Review | Lesson review exercise generator |
| 5 | Post-Lesson Review | Review exercises component |
| 6 | Pronunciation Journey | Pronunciation history server action |
| 7 | Pronunciation Journey | Pronunciation tab in progress page |
| 8 | Test Prep Mode | Add testMode to exercise renderer |
| 9 | Test Prep Mode | Test prep page and container component |
| 10 | Today's Missions | Daily missions server action + claim |
| 11 | Today's Missions | Dashboard widget with progress bars |
