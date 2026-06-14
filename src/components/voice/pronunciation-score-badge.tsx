'use client'

import { cn } from '@/lib/utils'

interface PronunciationScoreBadgeProps {
  score: number
  size?: 'sm' | 'md'
}

export function PronunciationScoreBadge({
  score,
  size = 'md',
}: PronunciationScoreBadgeProps) {
  const colorClass =
    score >= 80
      ? 'bg-green-500 text-white'
      : score >= 60
        ? 'bg-yellow-500 text-white'
        : 'bg-red-500 text-white'

  return (
    <div className="inline-flex flex-col items-center gap-0.5">
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-bold',
          colorClass,
          size === 'sm' ? 'h-8 w-8 text-xs' : 'h-12 w-12 text-sm'
        )}
      >
        {Math.round(score)}
      </div>
      <span
        className={cn(
          'text-muted-foreground',
          size === 'sm' ? 'text-[10px]' : 'text-xs'
        )}
      >
        pronunciation
      </span>
    </div>
  )
}
