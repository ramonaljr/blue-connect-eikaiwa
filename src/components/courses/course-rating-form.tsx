'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { submitCourseRating } from '@/lib/actions/exercises'

interface CourseRatingFormProps {
  courseId: string
}

export function CourseRatingForm({ courseId }: CourseRatingFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    if (rating === 0) {
      toast.error('評価を選択してください')
      return
    }

    setSubmitting(true)
    const result = await submitCourseRating({
      courseId,
      rating,
      review,
    })

    if (result.error) {
      toast.error('送信に失敗しました')
    } else {
      toast.success('評価を送信しました')
      setSubmitted(true)
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="py-8 text-center">
          <Star className="mx-auto h-10 w-10 fill-yellow-400 text-yellow-400" />
          <p className="mt-3 text-lg font-medium">
            ありがとうございます!
          </p>
          <p className="text-sm text-muted-foreground">
            評価が送信されました
          </p>
        </CardContent>
      </Card>
    )
  }

  const displayRating = hoveredRating || rating

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader className="text-center">
        <h3 className="text-lg font-semibold">このコースを評価してください</h3>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Star rating */}
        <div className="flex items-center justify-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="rounded-md p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <Star
                className={cn(
                  'h-8 w-8 transition-colors',
                  star <= displayRating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                )}
              />
            </button>
          ))}
        </div>

        {/* Review textarea */}
        <div className="space-y-2">
          <label
            htmlFor="review"
            className="text-sm font-medium text-muted-foreground"
          >
            レビューを書く（任意）
          </label>
          <Textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="このコースについてのご感想をお聞かせください..."
            rows={4}
          />
        </div>

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className="w-full"
          size="lg"
        >
          {submitting ? '送信中...' : '送信'}
        </Button>
      </CardContent>
    </Card>
  )
}
