'use client'

import { useState, useCallback, useRef } from 'react'
import type { AIMessage, AICorrection } from '@/lib/types/database'

function parseCorrections(text: string): { cleanText: string; corrections: AICorrection[] } {
  const correctionRegex = /\[CORRECTION\]([\s\S]*?)\[\/CORRECTION\]/g
  const found: AICorrection[] = []
  const cleanText = text.replace(correctionRegex, (_, json) => {
    try {
      found.push(JSON.parse(json))
    } catch { /* skip malformed */ }
    return ''
  })
  return { cleanText: cleanText.trim(), corrections: found }
}

export function useAIChat() {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [corrections, setCorrections] = useState<Map<number, AICorrection[]>>(new Map())
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [scenario, setScenario] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string) => {
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

      // After streaming completes, parse corrections from assistant content
      const { cleanText, corrections: foundCorrections } = parseCorrections(assistantContent)
      if (foundCorrections.length > 0) {
        // Update the assistant message with clean text (corrections stripped)
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: cleanText,
          }
          return updated
        })

        // Store corrections keyed by the assistant message index
        const assistantIndex = updatedMessages.length // index of assistant message in array
        setCorrections((prev) => {
          const next = new Map(prev)
          next.set(assistantIndex, foundCorrections)
          return next
        })
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError('Failed to send message')
      }
    } finally {
      setIsStreaming(false)
    }
  }, [messages, conversationId, scenario])

  const loadConversation = useCallback((conv: { id: string; messages: AIMessage[]; scenario?: string }) => {
    setConversationId(conv.id)
    setMessages(conv.messages)
    setScenario(conv.scenario ?? null)
  }, [])

  const startWithScenario = useCallback((scenarioKey: string | null, customTopic?: string) => {
    setMessages([])
    setConversationId(null)
    setError(null)
    setScenario(null)
    setCorrections(new Map())
    abortRef.current?.abort()
    setScenario(scenarioKey ? (customTopic || scenarioKey) : null)
  }, [])

  const reset = useCallback(() => {
    setMessages([])
    setConversationId(null)
    setError(null)
    setScenario(null)
    setCorrections(new Map())
    abortRef.current?.abort()
  }, [])

  return {
    messages,
    corrections,
    isStreaming,
    error,
    conversationId,
    scenario,
    sendMessage,
    reset,
    loadConversation,
    startWithScenario,
  }
}
