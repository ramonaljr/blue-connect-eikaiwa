'use client'

import { cn } from '@/lib/utils'
import type { AIMessage, AICorrection } from '@/lib/types/database'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Bot, User, Volume2, Bookmark } from 'lucide-react'
import { InlineCorrection } from './inline-correction'

interface ChatMessageProps {
  message: AIMessage
  corrections?: AICorrection[]
  onSavePhrase?: (phrase: string) => void
}

function handleSpeak(text: string) {
  if (typeof window === 'undefined') return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.9
  window.speechSynthesis.speak(utterance)
}

export function ChatMessage({ message, corrections, onSavePhrase }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <Avatar>
        <AvatarFallback className={cn(isUser ? 'bg-primary' : 'bg-blue-600')}>
          {isUser ? <User className="h-4 w-4 text-primary-foreground" /> : <Bot className="h-4 w-4 text-white" />}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1 max-w-[80%]">
        <div
          className={cn(
            'rounded-lg px-4 py-2 text-sm',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          )}
        >
          {isUser && corrections && corrections.length > 0 ? (
            <UserMessageWithCorrections content={message.content} corrections={corrections} />
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        {!isUser && message.content && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={() => handleSpeak(message.content)}
            >
              <Volume2 className="mr-1 h-3 w-3" />
              読み上げ
            </Button>
            {onSavePhrase && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={() => onSavePhrase(message.content)}
              >
                <Bookmark className="mr-1 h-3 w-3" />
                保存
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function UserMessageWithCorrections({
  content,
  corrections,
}: {
  content: string
  corrections: AICorrection[]
}) {
  // Build segments: for each correction, find its original text in the content
  // and split around it to create interleaved text/correction segments
  type Segment = { type: 'text'; value: string } | { type: 'correction'; correction: AICorrection }
  const segments: Segment[] = []
  let remaining = content

  for (const correction of corrections) {
    const idx = remaining.indexOf(correction.original)
    if (idx === -1) continue

    if (idx > 0) {
      segments.push({ type: 'text', value: remaining.slice(0, idx) })
    }
    segments.push({ type: 'correction', correction })
    remaining = remaining.slice(idx + correction.original.length)
  }

  if (remaining) {
    segments.push({ type: 'text', value: remaining })
  }

  // If no corrections matched, just render the content as-is
  if (segments.length === 0) {
    return <p className="whitespace-pre-wrap">{content}</p>
  }

  return (
    <p className="whitespace-pre-wrap">
      {segments.map((seg, i) =>
        seg.type === 'text' ? (
          <span key={i}>{seg.value}</span>
        ) : (
          <InlineCorrection key={i} correction={seg.correction} />
        )
      )}
    </p>
  )
}
