'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface LessonTimerProps {
  startTime: Date
  durationMinutes: number
}

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function LessonTimer({ startTime, durationMinutes }: LessonTimerProps) {
  const [elapsed, setElapsed] = useState(0)
  const totalSeconds = durationMinutes * 60
  const remaining = totalSeconds - elapsed

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const diff = Math.floor((now - startTime.getTime()) / 1000)
      setElapsed(Math.max(0, diff))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  let colorClass = 'text-foreground'
  let blinkClass = ''

  if (remaining <= 0) {
    colorClass = 'text-red-500'
    blinkClass = 'animate-pulse'
  } else if (remaining <= 120) {
    colorClass = 'text-red-500'
  } else if (remaining <= 300) {
    colorClass = 'text-orange-500'
  }

  return (
    <div className={`flex items-center gap-2 font-mono text-sm ${colorClass} ${blinkClass}`}>
      <Clock className="h-4 w-4" />
      <span>
        {formatTime(elapsed)} / {formatTime(totalSeconds)}
      </span>
    </div>
  )
}
