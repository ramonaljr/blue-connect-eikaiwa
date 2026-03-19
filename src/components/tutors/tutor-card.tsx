'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Star, Calendar } from 'lucide-react'

interface TutorCardProps {
  tutor: {
    id: string
    user_id: string
    bio: string
    bio_ja: string
    hourly_rate: number | null
    specialties: string[]
    average_rating: number
    total_lessons: number
    is_available: boolean
    user: {
      display_name: string
      avatar_url: string | null
      role: string
    }
  }
  locale: string
}

export function TutorCard({ tutor, locale }: TutorCardProps) {
  const bio = locale === 'ja' ? tutor.bio_ja || tutor.bio : tutor.bio
  const isCertified = tutor.user.role === 'certified_tutor'

  return (
    <Card className="h-full flex flex-col transition-shadow hover:shadow-md">
      <Link href={`/dashboard/tutors/${tutor.user_id}`}>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={tutor.user.avatar_url ?? undefined} />
              <AvatarFallback>{tutor.user.display_name.charAt(0)}</AvatarFallback>
            </Avatar>
            {tutor.is_available && (
              <span
                className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500"
                title="オンライン"
              />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{tutor.user.display_name}</CardTitle>
              {isCertified && (
                <Badge className="bg-blue-600 text-white">認定講師</Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{tutor.average_rating.toFixed(1)}</span>
              <span>({tutor.total_lessons} レッスン)</span>
            </div>
          </div>
        </CardHeader>
      </Link>
      <CardContent className="flex-1 flex flex-col">
        <Link href={`/dashboard/tutors/${tutor.user_id}`} className="flex-1">
          <p className="text-sm text-muted-foreground line-clamp-2">{bio}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {tutor.specialties.map((s: string) => (
              <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
            ))}
          </div>
          <p className="mt-3 text-sm font-medium">
            {isCertified ? '¥2,500 / 25分' : `¥${tutor.hourly_rate?.toLocaleString()} / 25分`}
          </p>
        </Link>

        {/* Availability + Book button */}
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          {tutor.is_available ? (
            <span className="flex items-center gap-1.5 text-xs text-green-600">
              <Calendar className="h-3 w-3" />
              本日予約可能
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">スケジュールを確認</span>
          )}
          <Link
            href={`/dashboard/tutors/${tutor.user_id}`}
            className={buttonVariants({ size: 'sm', variant: 'default' })}
          >
            予約する
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
