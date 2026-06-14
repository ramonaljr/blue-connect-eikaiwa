'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Star, MessageSquare } from 'lucide-react'

interface TutorReviewsProps {
  reviews: Array<{
    learner_rating: number
    learner_review: string | null
    learner_review_categories: Record<string, number> | null
    scheduled_at: string
    learner: { display_name: string; avatar_url: string | null }
  }>
}

const REVIEWS_PER_PAGE = 5

const categoryLabels: Record<string, string> = {
  communication: 'コミュニケーション',
  patience: '忍耐力',
  expertise: '専門知識',
  value: 'コストパフォーマンス',
}

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5'
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i < Math.round(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  )
}

export function TutorReviews({ reviews }: TutorReviewsProps) {
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE)

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, r) => acc + r.learner_rating, 0)
    return sum / reviews.length
  }, [reviews])

  // Aggregate category averages
  const categoryAverages = useMemo(() => {
    const sums: Record<string, { total: number; count: number }> = {}
    for (const review of reviews) {
      if (!review.learner_review_categories) continue
      for (const [key, value] of Object.entries(review.learner_review_categories)) {
        if (!sums[key]) sums[key] = { total: 0, count: 0 }
        sums[key].total += value
        sums[key].count += 1
      }
    }
    const result: Record<string, number> = {}
    for (const [key, { total, count }] of Object.entries(sums)) {
      result[key] = total / count
    }
    return result
  }, [reviews])

  const visibleReviews = reviews.slice(0, visibleCount)
  const hasMore = visibleCount < reviews.length

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <MessageSquare className="mb-2 h-8 w-8" />
          <p className="text-sm">まだレビューがありません</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">レビュー概要</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            {/* Average rating */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
              <StarDisplay rating={averageRating} size="lg" />
              <span className="text-sm text-muted-foreground">{reviews.length} 件のレビュー</span>
            </div>

            {/* Category breakdown */}
            {Object.keys(categoryAverages).length > 0 && (
              <div className="flex-1 space-y-3">
                {Object.entries(categoryAverages).map(([key, avg]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{categoryLabels[key] ?? key}</span>
                      <span className="font-medium">{avg.toFixed(1)}</span>
                    </div>
                    <Progress value={(avg / 5) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Individual reviews */}
      <div className="space-y-4">
        {visibleReviews.map((review, index) => (
          <Card key={index}>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={review.learner.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {review.learner.display_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{review.learner.display_name}</span>
                    <StarDisplay rating={review.learner_rating} />
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.scheduled_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  {review.learner_review && (
                    <p className="mt-2 text-sm text-muted-foreground">{review.learner_review}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setVisibleCount((c) => c + REVIEWS_PER_PAGE)}
          >
            もっと見る
          </Button>
        </div>
      )}
    </div>
  )
}
