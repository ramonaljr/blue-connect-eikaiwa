'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'

interface LessonChat {
  id: string
  lesson_id: string
  user_id: string
  user_name: string
  message: string
  created_at: string
}

interface LessonChatProps {
  lessonId: string
  userId: string
  userName: string
}

export function LessonChat({ lessonId, userId, userName }: LessonChatProps) {
  const [messages, setMessages] = useState<LessonChat[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    // Load existing messages
    supabase
      .from('lesson_chats')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as LessonChat[])
      })

    // Subscribe to new messages
    const channel = supabase
      .channel(`lesson-chat-${lessonId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lesson_chats',
          filter: `lesson_id=eq.${lessonId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as LessonChat])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [lessonId, supabase])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    setSending(true)
    setInput('')

    await supabase.from('lesson_chats').insert({
      lesson_id: lessonId,
      user_id: userId,
      user_name: userName,
      message: text,
    })

    setSending(false)
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            メッセージはまだありません
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.user_id === userId ? 'items-end' : 'items-start'}`}
          >
            <span className="mb-0.5 text-xs text-muted-foreground">
              {msg.user_name}
            </span>
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.user_id === userId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {msg.message}
            </div>
            <span className="mt-0.5 text-[10px] text-muted-foreground">
              {formatTime(msg.created_at)}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="flex items-center gap-2 border-t p-3"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={!input.trim() || sending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
