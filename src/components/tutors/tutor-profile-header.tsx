'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Star, BookOpen, ShieldCheck } from 'lucide-react'

interface TutorProfileHeaderProps {
  tutor: {
    user_id: string
    hourly_rate: number | null
    average_rating: number
    total_lessons: number
    is_available: boolean
    user: {
      id: string
      display_name: string
      avatar_url: string | null
      role: string
    }
  }
  isCertified: boolean
  locale: string
}

export function TutorProfileHeader({ tutor, isCertified, locale }: TutorProfileHeaderProps) {
  const handleBookClick = () => {
    // Scroll to schedule tab and activate it
    const scheduleTab = document.querySelector('[data-slot="tabs-trigger"][value="schedule"]') as HTMLElement | null
    if (scheduleTab) {
      scheduleTab.click()
      scheduleTab.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.round(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-muted-foreground/30'
        }`}
      />
    ))
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 py-8 sm:flex-row sm:items-start">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={tutor.user.avatar_url ?? undefined} />
            <AvatarFallback className="text-2xl">
              {tutor.user.display_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {tutor.is_available && (
            <span
              className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500"
              title="オンライン"
            />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col items-center gap-3 sm:items-start">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{tutor.user.display_name}</h1>
            {isCertified && (
              <Badge className="bg-blue-600 text-white">
                <ShieldCheck className="mr-1 h-3 w-3" />
                認定講師
              </Badge>
            )}
            {tutor.is_available && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                予約可能
              </Badge>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {renderStars(tutor.average_rating)}
            </div>
            <span className="text-sm font-medium">{tutor.average_rating.toFixed(1)}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {tutor.total_lessons} レッスン完了
            </span>
            <span>
              {isCertified
                ? '¥2,500 / 25分'
                : tutor.hourly_rate
                  ? `¥${tutor.hourly_rate.toLocaleString()} / 25分`
                  : '料金未設定'}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="shrink-0">
          <Button size="lg" onClick={handleBookClick}>
            レッスンを予約
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
