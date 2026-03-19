'use client'

import { useState, useEffect, useRef } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SessionTimerProps {
  maxMinutes: number
}

export function SessionTimer({ maxMinutes }: SessionTimerProps) {
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const maxSeconds = maxMinutes * 60
  const ratio = elapsed / maxSeconds

  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const colorClass =
    ratio >= 0.9
      ? 'text-red-500'
      : ratio >= 0.8
        ? 'text-orange-500'
        : 'text-muted-foreground'

  return (
    <div className={cn('flex items-center gap-1.5 text-sm font-mono', colorClass)}>
      <Clock className="h-4 w-4" />
      <span>{display}</span>
      <span className="text-xs">/ {maxMinutes}分</span>
    </div>
  )
}
