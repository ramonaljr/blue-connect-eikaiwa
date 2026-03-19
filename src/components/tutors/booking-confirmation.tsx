'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Calendar, Clock, User } from 'lucide-react'

interface BookingConfirmationProps {
  lessonId: string
  tutorName: string
  scheduledAt: string
  duration: number
}

function generateICS(params: {
  title: string
  start: Date
  durationMinutes: number
  description: string
}): string {
  const end = new Date(params.start.getTime() + params.durationMinutes * 60 * 1000)
  const format = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Blue Connect Eikaiwa//EN',
    'BEGIN:VEVENT',
    `DTSTART:${format(params.start)}`,
    `DTEND:${format(end)}`,
    `SUMMARY:${params.title}`,
    `DESCRIPTION:${params.description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

function downloadICS(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function BookingConfirmation({
  lessonId,
  tutorName,
  scheduledAt,
  duration,
}: BookingConfirmationProps) {
  const startDate = new Date(scheduledAt)

  const formattedDate = startDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timeZone: 'Asia/Tokyo',
  })

  const formattedTime = startDate.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  })

  function handleDownloadICS() {
    const icsContent = generateICS({
      title: `英会話レッスン - ${tutorName}`,
      start: startDate,
      durationMinutes: duration,
      description: `Blue Connect Eikaiwa\\n講師: ${tutorName}\\nレッスン時間: ${duration}分`,
    })
    downloadICS(icsContent, `lesson-${lessonId}.ics`)
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-background p-6 text-center shadow-sm">
      <div className="mb-4 flex justify-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
      </div>

      <h2 className="mb-2 text-2xl font-bold">予約完了！</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        レッスンが正常に予約されました
      </p>

      <div className="mb-6 space-y-3 rounded-lg bg-muted/50 p-4 text-left text-sm">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">講師:</span>
          <span className="font-medium">{tutorName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">日時:</span>
          <span className="font-medium">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">時間:</span>
          <span className="font-medium">
            {formattedTime} (JST) / {duration}分
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button onClick={handleDownloadICS} variant="outline" className="w-full">
          <Calendar className="h-4 w-4" />
          カレンダーに追加
        </Button>
        <Button asChild className="w-full">
          <Link href="/dashboard/lessons">レッスン一覧へ</Link>
        </Button>
      </div>
    </div>
  )
}
