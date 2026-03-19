'use client'

import { useState, useCallback, useRef } from 'react'
import type { AIMessage } from '@/lib/types/database'

export function useAIChat() {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string, scenario?: string) => {
    setError(null)
    const userMessage: AIMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsStreaming(true)

    const abortController = new AbortController()
    abortRef.current = abortController

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          conversationId,
          scenario,
        }),
        signal: abortController.signal,
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to send message')
        setIsStreaming(false)
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      }

      setMessages([...updatedMessages, assistantMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n\n').filter(Boolean)

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)

          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)

            if (parsed.text) {
              assistantContent += parsed.text
              setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: assistantContent,
                }
                return updated
              })
            }

            if (parsed.conversationId) {
              setConversationId(parsed.conversationId)
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError('Failed to send message')
      }
    } finally {
      setIsStreaming(false)
    }
  }, [messages, conversationId])

  const reset = useCallback(() => {
    setMessages([])
    setConversationId(null)
    setError(null)
    abortRef.current?.abort()
  }, [])

  return { messages, isStreaming, error, sendMessage, reset }
}
