'use client'

import { useEffect, useRef } from 'react'
import type { TranscriptEntry } from '@/hooks/use-voice-session'
import { PronunciationScoreBadge } from './pronunciation-score-badge'
import { cn } from '@/lib/utils'

interface TranscriptPanelProps {
  entries: TranscriptEntry[]
}

export function TranscriptPanel({ entries }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries.length])

  if (entries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        <p>会話が始まるとここに表示されます</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 space-y-3">
      {entries.map((entry, index) => (
        <div
          key={index}
          className={cn(
            'flex flex-col gap-1',
            entry.speaker === 'user' ? 'items-end' : 'items-start'
          )}
        >
          <span className="text-xs font-medium text-muted-foreground">
            {entry.speaker === 'user' ? 'あなた' : 'AI'}
          </span>
          <div
            className={cn(
              'max-w-[85%] rounded-xl px-3 py-2 text-sm',
              entry.speaker === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground'
            )}
          >
            {entry.text}
          </div>
          {entry.speaker === 'user' &&
            entry.pronunciationScore !== undefined && (
              <PronunciationScoreBadge
                score={entry.pronunciationScore}
                size="sm"
              />
            )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
