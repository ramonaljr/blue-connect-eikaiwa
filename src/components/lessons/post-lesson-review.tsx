'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { submitLessonReview } from '@/lib/actions/lesson-review'

interface PostLessonReviewProps {
  lessonId: string
  onSubmitted: () => void
}

const CATEGORIES = [
  { key: 'communication', label: 'コミュニケーション' },
  { key: 'patience', label: '忍耐力' },
  { key: 'expertise', label: '専門知識' },
  { key: 'value', label: 'コストパフォーマンス' },
] as const

function StarRating({
  value,
  onChange,
  size = 'md',
}: {
  value: number
  onChange: (rating: number) => void
  size?: 'sm' | 'md'
}) {
  const [hovered, setHovered] = useState(0)
  const sizeClass = size === 'sm' ? 'size-4' : 'size-6'

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHovered(0)}>
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1
        const filled = starValue <= (hovered || value)
        return (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHovered(starValue)}
            onClick={() => onChange(starValue)}
            className="rounded-sm p-0.5 transition-colors hover:bg-muted"
          >
            <Star
              className={`${sizeClass} ${
                filled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground/30'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}

export function PostLessonReview({ lessonId, onSubmitted }: PostLessonReviewProps) {
  const [rating, setRating] = useState(0)
  const [categories, setCategories] = useState<Record<string, number>>({
    communication: 0,
    patience: 0,
    expertise: 0,
    value: 0,
  })
  const [review, setReview] = useState('')
  const [reflection, setReflection] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function setCategoryRating(key: string, value: number) {
    setCategories((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    if (rating === 0) return
    setSubmitting(true)

    const categoryData = Object.fromEntries(
      Object.entries(categories).filter(([, v]) => v > 0)
    )

    const result = await submitLessonReview({
      lessonId,
      rating,
      review: review.trim() || undefined,
      categories: Object.keys(categoryData).length > 0 ? categoryData : undefined,
      reflection: reflection.trim() || undefined,
    })

    setSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('レビューを送信しました')
      onSubmitted()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          レッスンレビュー
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="space-y-2">
          <Label>総合評価 *</Label>
          <StarRating value={rating} onChange={setRating} size="md" />
        </div>

        {/* Category Ratings */}
        <div className="space-y-3">
          <Label>カテゴリ別評価</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {CATEGORIES.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between gap-2 rounded-lg border p-3">
                <span className="text-sm">{label}</span>
                <StarRating
                  value={categories[key]}
                  onChange={(v) => setCategoryRating(key, v)}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Written Review */}
        <div className="space-y-2">
          <Label>レビューを書く（任意）</Label>
          <Textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="講師の良かった点やアドバイスを共有してください..."
            rows={3}
          />
        </div>

        {/* Reflection */}
        <div className="space-y-2">
          <Label>今日学んだこと</Label>
          <Textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="今日のレッスンで学んだことを振り返りましょう..."
            rows={3}
          />
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className="w-full"
        >
          {submitting ? '送信中...' : 'レビューを送信'}
        </Button>
      </CardContent>
    </Card>
  )
}
