'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { PostLessonReview } from './post-lesson-review'
import {
  Star,
  RefreshCw,
  Download,
  Bot,
  FileText,
  NotepadText,
  BookOpen,
} from 'lucide-react'

interface LessonSummaryProps {
  lesson: any
  notes: any | null
  prep: any | null
  showReview: boolean
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`size-4 ${
            i < rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusLabel(status: string) {
  const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    completed: { label: '完了', variant: 'default' },
    scheduled: { label: '予定', variant: 'secondary' },
    canceled: { label: 'キャンセル', variant: 'destructive' },
    in_progress: { label: '進行中', variant: 'secondary' },
  }
  const s = map[status] ?? { label: status, variant: 'outline' as const }
  return <Badge variant={s.variant}>{s.label}</Badge>
}

function downloadNotes(lesson: any, notes: any, prep: any) {
  const lines: string[] = []

  const tutorName = lesson.tutor?.display_name ?? '講師'
  lines.push(`レッスンサマリー - ${formatDate(lesson.scheduled_at)}`)
  lines.push(`講師: ${tutorName}`)
  lines.push(`時間: ${lesson.duration_minutes}分`)
  lines.push('')

  if (notes?.ai_summary) {
    lines.push('--- AI サマリー ---')
    lines.push(notes.ai_summary)
    lines.push('')
  }

  if (notes?.shared_notes) {
    lines.push('--- 共有ノート ---')
    lines.push(notes.shared_notes)
    lines.push('')
  }

  if (prep?.topics) {
    lines.push('--- レッスン準備: トピック ---')
    lines.push(prep.topics)
    lines.push('')
  }

  if (prep?.vocabulary?.length) {
    lines.push('--- レッスン準備: 語彙 ---')
    lines.push(prep.vocabulary.join(', '))
    lines.push('')
  }

  if (prep?.goals?.length) {
    lines.push('--- レッスン準備: 目標 ---')
    prep.goals.forEach((g: string) => lines.push(`- ${g}`))
    lines.push('')
  }

  if (notes?.tutor_private_notes) {
    lines.push('--- 講師のメモ ---')
    lines.push(notes.tutor_private_notes)
    lines.push('')
  }

  if (lesson.learner_review) {
    lines.push('--- あなたのレビュー ---')
    lines.push(`評価: ${'★'.repeat(lesson.learner_rating)}${'☆'.repeat(5 - lesson.learner_rating)}`)
    lines.push(lesson.learner_review)
    lines.push('')
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lesson-notes-${lesson.id.slice(0, 8)}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function LessonSummary({ lesson, notes, prep, showReview }: LessonSummaryProps) {
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  const tutorName = lesson.tutor?.display_name ?? '講師'
  const tutorInitial = tutorName.charAt(0)
  const hasRating = lesson.learner_rating != null || reviewSubmitted

  return (
    <div className="space-y-6">
      {/* Lesson Info Header */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              {lesson.tutor?.avatar_url ? (
                <AvatarImage src={lesson.tutor.avatar_url} alt={tutorName} />
              ) : null}
              <AvatarFallback className="text-lg">{tutorInitial}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{tutorName}</h2>
              <p className="text-sm text-muted-foreground">
                {formatDate(lesson.scheduled_at)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{lesson.duration_minutes}分</Badge>
            {statusLabel(lesson.status)}
          </div>
        </CardContent>
      </Card>

      {/* AI Summary */}
      {notes?.ai_summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="h-5 w-5" />
              AI サマリー
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {notes.ai_summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Shared Notes */}
      {notes?.shared_notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5" />
              共有ノート
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {notes.shared_notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Lesson Preparation */}
      {prep && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <NotepadText className="h-5 w-5" />
              レッスン準備
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prep.topics && (
              <div>
                <p className="mb-1 text-sm font-medium">トピック</p>
                <p className="text-sm text-muted-foreground">{prep.topics}</p>
              </div>
            )}
            {prep.vocabulary?.length > 0 && (
              <div>
                <p className="mb-1 text-sm font-medium">語彙</p>
                <div className="flex flex-wrap gap-1.5">
                  {prep.vocabulary.map((word: string) => (
                    <Badge key={word} variant="secondary">
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {prep.goals?.length > 0 && (
              <div>
                <p className="mb-1 text-sm font-medium">目標</p>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {prep.goals.map((goal: string) => (
                    <li key={goal}>{goal}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tutor Notes */}
      {notes?.tutor_private_notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5" />
              講師のメモ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {notes.tutor_private_notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Review Form or Submitted Review */}
      {showReview && !hasRating && (
        <PostLessonReview
          lessonId={lesson.id}
          onSubmitted={() => setReviewSubmitted(true)}
        />
      )}

      {hasRating && !reviewSubmitted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-5 w-5" />
              あなたのレビュー
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <RatingStars rating={lesson.learner_rating} />
            {lesson.learner_review_categories && (
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(lesson.learner_review_categories as Record<string, number>).map(
                  ([key, val]) => {
                    const labelMap: Record<string, string> = {
                      communication: 'コミュニケーション',
                      patience: '忍耐力',
                      expertise: '専門知識',
                      value: 'コストパフォーマンス',
                    }
                    return (
                      <div key={key} className="flex items-center justify-between rounded-lg border p-2">
                        <span className="text-xs text-muted-foreground">
                          {labelMap[key] ?? key}
                        </span>
                        <RatingStars rating={val} />
                      </div>
                    )
                  }
                )}
              </div>
            )}
            {lesson.learner_review && (
              <p className="text-sm text-muted-foreground">{lesson.learner_review}</p>
            )}
          </CardContent>
        </Card>
      )}

      {reviewSubmitted && (
        <Card>
          <CardContent className="flex items-center gap-2 p-6 text-sm text-green-600">
            <Star className="h-4 w-4 fill-green-600" />
            レビューを送信しました。ありがとうございます！
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Link href={`/dashboard/tutors/${lesson.tutor_id}`}>
          <Button variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            同じ講師で再予約
          </Button>
        </Link>
        <Button
          variant="outline"
          onClick={() => downloadNotes(lesson, notes, prep)}
        >
          <Download className="mr-2 h-4 w-4" />
          ノートをダウンロード
        </Button>
      </div>
    </div>
  )
}
