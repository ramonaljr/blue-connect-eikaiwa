'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import type { TutorAvailability } from '@/lib/types/database'

interface TutorScheduleProps {
  availability: TutorAvailability[]
  bookedLessons: Array<{ scheduled_at: string; duration_minutes: number }>
  tutorId: string
  learnerTimezone: string
}

const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日']
const SLOT_START_HOUR = 8
const SLOT_END_HOUR = 22

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  // Monday = 0 offset, Sunday = 6 offset
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatTimeInTimezone(date: Date, timezone: string): string {
  return date.toLocaleString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone,
  })
}

function formatDateHeader(date: Date, timezone: string): string {
  return date.toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    timeZone: timezone,
  })
}

function getDateForDayOfWeek(weekStart: Date, dayIndex: number): Date {
  const d = new Date(weekStart)
  d.setDate(d.getDate() + dayIndex)
  return d
}

export function TutorSchedule({
  availability,
  bookedLessons,
  tutorId,
  learnerTimezone,
}: TutorScheduleProps) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [duration, setDuration] = useState<25 | 50>(25)

  const [now] = useState(() => new Date())
  const currentWeekStart = useMemo(() => {
    const ws = getWeekStart(now)
    ws.setDate(ws.getDate() + weekOffset * 7)
    return ws
  }, [now, weekOffset])

  // Generate all 30-min time slot labels
  const timeSlots = useMemo(() => {
    const slots: string[] = []
    for (let h = SLOT_START_HOUR; h < SLOT_END_HOUR; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`)
      slots.push(`${String(h).padStart(2, '0')}:30`)
    }
    return slots
  }, [])

  // Build a set of booked time slots (ISO strings rounded to 30-min blocks)
  const bookedSet = useMemo(() => {
    const set = new Set<string>()
    for (const lesson of bookedLessons) {
      const start = new Date(lesson.scheduled_at)
      const blocks = Math.ceil(lesson.duration_minutes / 30)
      for (let i = 0; i < blocks; i++) {
        const blockTime = new Date(start.getTime() + i * 30 * 60 * 1000)
        set.add(blockTime.toISOString())
      }
    }
    return set
  }, [bookedLessons])

  // For each day column and time row, determine slot state
  const getSlotState = (dayIndex: number, timeSlot: string): 'available' | 'booked' | 'unavailable' | 'past' => {
    const date = getDateForDayOfWeek(currentWeekStart, dayIndex)
    const [hours, minutes] = timeSlot.split(':').map(Number)
    date.setHours(hours, minutes, 0, 0)

    // Check if slot is in the past
    if (date < now) return 'past'

    // Check availability: day_of_week is 0=Sunday, 1=Monday, etc. in DB
    // Our dayIndex: 0=Mon, 1=Tue, ..., 6=Sun
    const dbDayOfWeek = dayIndex === 6 ? 0 : dayIndex + 1

    const isAvailable = availability.some((a) => {
      if (a.day_of_week !== dbDayOfWeek) return false
      // Convert tutor's availability times to compare
      // a.start_time / a.end_time are "HH:MM" format in the tutor's timezone
      // For simplicity, compare the time strings directly
      const slotTime = timeSlot
      return slotTime >= a.start_time.slice(0, 5) && slotTime < a.end_time.slice(0, 5)
    })

    if (!isAvailable) return 'unavailable'

    // Check if booked - need to check all blocks for the selected duration
    const blocksNeeded = duration / 30
    for (let i = 0; i < blocksNeeded; i++) {
      const checkTime = new Date(date.getTime() + i * 30 * 60 * 1000)
      if (bookedSet.has(checkTime.toISOString())) return 'booked'
    }

    // Also check that all required blocks are within availability
    if (duration === 50) {
      const nextSlotMinutes = hours * 60 + minutes + 30
      const nextTimeSlot = `${String(Math.floor(nextSlotMinutes / 60)).padStart(2, '0')}:${String(nextSlotMinutes % 60).padStart(2, '0')}`
      const nextAvailable = availability.some((a) => {
        if (a.day_of_week !== dbDayOfWeek) return false
        return nextTimeSlot >= a.start_time.slice(0, 5) && nextTimeSlot < a.end_time.slice(0, 5)
      })
      if (!nextAvailable) return 'unavailable'
    }

    return 'available'
  }

  const getSlotISOString = (dayIndex: number, timeSlot: string): string => {
    const date = getDateForDayOfWeek(currentWeekStart, dayIndex)
    const [hours, minutes] = timeSlot.split(':').map(Number)
    date.setHours(hours, minutes, 0, 0)
    return date.toISOString()
  }

  const weekLabel = useMemo(() => {
    const start = new Date(currentWeekStart)
    const end = new Date(currentWeekStart)
    end.setDate(end.getDate() + 6)
    return `${formatDateHeader(start, learnerTimezone)} - ${formatDateHeader(end, learnerTimezone)}`
  }, [currentWeekStart, learnerTimezone])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            スケジュール
          </CardTitle>

          {/* Duration toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">レッスン時間:</span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={duration === 25 ? 'default' : 'outline'}
                onClick={() => setDuration(25)}
              >
                25分
              </Button>
              <Button
                size="sm"
                variant={duration === 50 ? 'default' : 'outline'}
                onClick={() => setDuration(50)}
              >
                50分
              </Button>
            </div>
          </div>
        </div>

        {/* Week navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={weekOffset <= 0}
            onClick={() => setWeekOffset((o) => Math.max(0, o - 1))}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            前の週
          </Button>
          <span className="text-sm font-medium">{weekLabel}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={weekOffset >= 3}
            onClick={() => setWeekOffset((o) => Math.min(3, o + 1))}
          >
            次の週
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Legend */}
        <div className="mb-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-green-100 border border-green-300" />
            予約可能
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-muted border border-border" />
            予約済み
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-background border border-border" />
            利用不可
          </span>
        </div>

        {/* Schedule grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Day headers */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-px border-b pb-2 mb-2">
              <div />
              {DAY_LABELS.map((label, i) => {
                const date = getDateForDayOfWeek(currentWeekStart, i)
                const isToday = date.toDateString() === now.toDateString()
                return (
                  <div key={label} className="text-center">
                    <div className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                      {label}
                    </div>
                    <div className={`text-xs ${isToday ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {formatDateHeader(date, learnerTimezone)}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Time rows */}
            <div className="space-y-px">
              {timeSlots.map((slot) => (
                <div key={slot} className="grid grid-cols-[60px_repeat(7,1fr)] gap-px">
                  <div className="flex items-center justify-end pr-2 text-xs text-muted-foreground">
                    {slot}
                  </div>
                  {DAY_LABELS.map((_, dayIndex) => {
                    const state = getSlotState(dayIndex, slot)
                    const isoString = getSlotISOString(dayIndex, slot)

                    if (state === 'available') {
                      return (
                        <Link
                          key={dayIndex}
                          href={`/dashboard/tutors/${tutorId}?book=true&time=${encodeURIComponent(isoString)}&duration=${duration}`}
                          className="flex h-7 items-center justify-center rounded bg-green-100 border border-green-300 text-xs text-green-700 hover:bg-green-200 transition-colors cursor-pointer"
                        >
                          {slot}
                        </Link>
                      )
                    }

                    if (state === 'booked') {
                      return (
                        <div
                          key={dayIndex}
                          className="flex h-7 items-center justify-center rounded bg-muted border border-border text-xs text-muted-foreground"
                        >
                          -
                        </div>
                      )
                    }

                    if (state === 'past') {
                      return (
                        <div
                          key={dayIndex}
                          className="flex h-7 items-center justify-center rounded bg-background text-xs text-muted-foreground/40"
                        />
                      )
                    }

                    // unavailable
                    return (
                      <div
                        key={dayIndex}
                        className="flex h-7 items-center justify-center rounded bg-background text-xs text-muted-foreground/20"
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          タイムゾーン: {learnerTimezone}
        </p>
      </CardContent>
    </Card>
  )
}
