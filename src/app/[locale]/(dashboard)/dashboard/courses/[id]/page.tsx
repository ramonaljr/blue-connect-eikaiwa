import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle, Clock, Lock, PlayCircle, RotateCcw, Target } from 'lucide-react'
import Link from 'next/link'

const OBJECTIVES: Record<string, string[]> = {
  'Foundations': ['基本的な文法パターンを学ぶ', '日常的な語彙を増やす', '簡単な文を作れるようになる'],
  'Daily Conversation': ['日常会話で使えるフレーズを学ぶ', '自然な会話の流れを理解する', 'リスニング力を向上させる'],
  'Business English': ['ビジネスメールの書き方を学ぶ', 'プレゼンテーションスキルを磨く', '会議での発言力を高める'],
  'TOEIC Prep': ['TOEICの出題パターンを理解する', '時間配分を最適化する', 'スコアアップに直結する対策'],
  'EIKEN Prep': ['英検の各セクション対策', '面接練習のコツ', 'ライティング力の向上'],
  'Travel English': ['旅行で使える実用フレーズ', '空港・ホテルでのやり取り', '緊急時の対応フレーズ'],
  'Advanced Discussion': ['複雑なトピックについて議論する', '意見を論理的に述べる', 'ニュアンスの違いを理解する'],
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id, locale } = await params
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()

  if (!course) notFound()

  const { data: units } = await supabase
    .from('course_units')
    .select('*')
    .eq('course_id', id)
    .order('sort_order')

  const { data: progress } = await supabase
    .from('learner_progress')
    .select('unit_id, status, score')
    .eq('user_id', user.id)
    .eq('course_id', id)

  const progressMap = new Map(progress?.map((p) => [p.unit_id, p]) ?? [])

  const title = locale === 'ja' ? course.title_ja : course.title
  const description = locale === 'ja' ? course.description_ja : course.description

  // Overall progress calculation
  const completedUnits = units?.filter(u => progressMap.get(u.id)?.status === 'completed').length ?? 0
  const totalUnits = units?.length ?? 0
  const overallProgress = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0

  // Find the first incomplete unit for CTA
  const firstIncompleteIndex = units?.findIndex(u => progressMap.get(u.id)?.status !== 'completed') ?? 0
  const hasStarted = progress && progress.length > 0
  const isCompleted = completedUnits === totalUnits && totalUnits > 0

  const ctaUnitId = isCompleted
    ? units?.[0]?.id
    : units?.[Math.max(0, firstIncompleteIndex)]?.id

  const ctaLabel = isCompleted
    ? '復習する'
    : hasStarted
      ? '学習を続ける'
      : 'コースを始める'

  const ctaIcon = isCompleted
    ? RotateCcw
    : PlayCircle

  const CtaIcon = ctaIcon

  // Remaining time estimate
  const remainingUnits = totalUnits - completedUnits
  const estimatedMinutes = remainingUnits * 15

  // Learning objectives
  const objectives = OBJECTIVES[course.category] ?? []

  return (
    <div className="space-y-8">
      {/* Header with CTA */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{course.level}</Badge>
            <Badge variant="outline">{course.category}</Badge>
          </div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground max-w-2xl">{description}</p>
        </div>

        {ctaUnitId && (
          <Link href={`/dashboard/courses/${id}/units/${ctaUnitId}`} className="shrink-0">
            <Button size="lg" className="w-full sm:w-auto text-base gap-2">
              <CtaIcon className="h-5 w-5" />
              {ctaLabel}
            </Button>
          </Link>
        )}
      </div>

      {/* Overall Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">コース進捗</span>
              <span className="text-muted-foreground">
                {completedUnits}/{totalUnits} ユニット完了
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Progress value={overallProgress} className="flex-1" />
              <span className="text-sm font-semibold tabular-nums w-12 text-right">
                {overallProgress}%
              </span>
            </div>
            {remainingUnits > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>残り約 {estimatedMinutes}分</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      {objectives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" />
              学習目標
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle className="h-5 w-5 text-primary/70 shrink-0 mt-0.5" />
                  <span className="text-sm">{obj}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Unit Stepper */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">ユニット</h2>

        <div className="relative">
          {units?.map((unit, i) => {
            const unitProgress = progressMap.get(unit.id)
            const isUnitCompleted = unitProgress?.status === 'completed'
            const isInProgress = unitProgress?.status === 'in_progress'
            const previousCompleted = i === 0 || progressMap.get(units[i - 1].id)?.status === 'completed'
            const isAvailable = previousCompleted && !isUnitCompleted && !isInProgress
            const isLocked = !previousCompleted && !isUnitCompleted && !isInProgress
            const unitTitle = locale === 'ja' ? unit.title_ja : unit.title
            const isLast = i === units.length - 1

            const stepContent = (
              <div className="flex gap-4">
                {/* Stepper line and circle */}
                <div className="flex flex-col items-center">
                  {/* Circle */}
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background">
                    {isUnitCompleted ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 border-green-500">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    ) : isInProgress ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-500 animate-pulse">
                        <span className="text-sm font-semibold text-blue-500">{i + 1}</span>
                      </div>
                    ) : isLocked ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-muted-foreground/30 bg-muted">
                        <Lock className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary">
                        <span className="text-sm font-semibold text-primary">{i + 1}</span>
                      </div>
                    )}
                  </div>
                  {/* Vertical line */}
                  {!isLast && (
                    <div
                      className={`w-0.5 flex-1 min-h-4 ${
                        isUnitCompleted ? 'bg-green-500' : 'bg-muted-foreground/20'
                      }`}
                    />
                  )}
                </div>

                {/* Unit card */}
                <Card
                  className={`flex-1 mb-4 transition-shadow ${
                    isLocked
                      ? 'opacity-60'
                      : 'hover:shadow-md'
                  }`}
                >
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">
                          Unit {i + 1}: {unitTitle}
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-1.5">
                          {unitProgress?.score != null && (
                            <span className="text-xs text-muted-foreground">
                              スコア: {Math.round(unitProgress.score)}%
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            約15分
                          </span>
                        </div>
                      </div>
                      <div>
                        {isUnitCompleted && (
                          <Badge variant="secondary" className="text-green-600 bg-green-50">
                            完了
                          </Badge>
                        )}
                        {isInProgress && (
                          <Badge variant="secondary" className="text-blue-600 bg-blue-50">
                            学習中
                          </Badge>
                        )}
                        {isLocked && (
                          <Badge variant="outline" className="text-muted-foreground">
                            ロック
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            )

            if (isLocked) {
              return (
                <div key={unit.id} className="cursor-not-allowed">
                  {stepContent}
                </div>
              )
            }

            return (
              <Link key={unit.id} href={`/dashboard/courses/${id}/units/${unit.id}`}>
                {stepContent}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
