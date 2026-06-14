'use client'

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChatMessage } from './chat-message'
import { TutorHandoffPanel } from './tutor-handoff-panel'
import { useAIChat } from '@/hooks/use-ai-chat'
import { savePhrase } from '@/lib/actions/phrases'
import { Send, RotateCcw, X } from 'lucide-react'
import { toast } from 'sonner'

interface ChatInterfaceProps {
  onBack?: () => void
  initialScenario?: { key: string | null; customTopic?: string } | null
  initialConversation?: { id: string; messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>; scenario?: string } | null
}

export function ChatInterface({ onBack, initialScenario, initialConversation }: ChatInterfaceProps) {
  const {
    messages,
    corrections,
    isStreaming,
    error,
    conversationId,
    scenario,
    sendMessage,
    reset,
    startWithScenario,
    loadConversation,
  } = useAIChat()
  const [input, setInput] = useState('')
  const [dismissedScenario, setDismissedScenario] = useState<string | null>(null)
  const showScenarioBanner = !!scenario && scenario !== dismissedScenario
  const scrollRef = useRef<HTMLDivElement>(null)

  // Initialize with scenario prop
  useEffect(() => {
    if (initialScenario) {
      startWithScenario(initialScenario.key, initialScenario.customTopic)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialScenario])

  // Initialize with conversation prop
  useEffect(() => {
    if (initialConversation) {
      loadConversation(initialConversation)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConversation])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || isStreaming) return
    const message = input.trim()
    setInput('')
    await sendMessage(message)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleReset() {
    reset()
    if (onBack) {
      onBack()
    }
  }

  async function handleSavePhrase(phrase: string) {
    const result = await savePhrase({
      phrase,
      translation: '',
      context: scenario || 'AI Chat',
      conversationId: conversationId ?? undefined,
    })

    if (result.error) {
      toast.error('保存に失敗しました', { description: result.error })
    } else {
      toast.success('フレーズを保存しました', {
        description: phrase.length > 50 ? phrase.slice(0, 50) + '...' : phrase,
      })
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-lg font-semibold">AI英会話チャット</h2>
          <p className="text-sm text-muted-foreground">英語で話しかけてみましょう</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          新しい会話
        </Button>
      </div>

      {scenario && showScenarioBanner && (
        <div className="mt-4 flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-4 py-2">
          <span className="text-sm text-primary font-medium">🎭 {scenario}</span>
          <Button variant="ghost" size="sm" onClick={() => setDismissedScenario(scenario)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto py-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>メッセージを入力して会話を始めましょう！</p>
          </div>
        )}
        {messages.map((message, i) => (
          <ChatMessage
            key={i}
            message={message}
            corrections={corrections.get(i)}
            onSavePhrase={message.role === 'assistant' ? handleSavePhrase : undefined}
          />
        ))}
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      {!isStreaming && messages.length > 4 && (
        <TutorHandoffPanel
          conversationId={conversationId}
          correctionCount={corrections.size}
        />
      )}

      <div className="border-t pt-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message in English..."
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button onClick={handleSend} disabled={isStreaming || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
