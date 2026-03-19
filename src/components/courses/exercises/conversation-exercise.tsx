'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CheckCircle, XCircle, Loader2, MessageCircle, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { submitExerciseAttempt } from '@/lib/actions/exercises'
import type { CourseExercise } from '@/lib/types/database'

interface ConversationExerciseProps {
  exercise: CourseExercise
  locale: string
  testMode?: boolean
  onComplete: (score: number) => void
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ExerciseOptions {
  targetVocabulary?: string[]
  maxExchanges?: number
}

function parseOptions(exercise: CourseExercise): ExerciseOptions {
  const opts = exercise.options as unknown
  if (opts && typeof opts === 'object' && !Array.isArray(opts)) {
    const obj = opts as Record<string, unknown>
    return {
      targetVocabulary: Array.isArray(obj.targetVocabulary)
        ? (obj.targetVocabulary as string[])
        : [],
      maxExchanges: typeof obj.maxExchanges === 'number' ? obj.maxExchanges : 5,
    }
  }
  return { targetVocabulary: [], maxExchanges: 5 }
}

async function readSSEResponse(response: Response): Promise<string> {
  const reader = response.body?.getReader()
  if (!reader) return ''

  const decoder = new TextDecoder()
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data) as { text?: string; conversationId?: string }
          if (parsed.text) {
            fullText += parsed.text
          }
        } catch {
          // skip malformed JSON
        }
      }
    }
  }

  return fullText
}

function evaluateVocabularyUsage(
  messages: ChatMessage[],
  targetVocabulary: string[]
): { used: string[]; notUsed: string[]; score: number } {
  const userText = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content.toLowerCase())
    .join(' ')

  const used: string[] = []
  const notUsed: string[] = []

  for (const word of targetVocabulary) {
    if (userText.includes(word.toLowerCase())) {
      used.push(word)
    } else {
      notUsed.push(word)
    }
  }

  const score =
    targetVocabulary.length > 0
      ? Math.round((used.length / targetVocabulary.length) * 100)
      : 100

  return { used, notUsed, score }
}

export function ConversationExercise({
  exercise,
  locale,
  testMode: _testMode,
  onComplete,
}: ConversationExerciseProps) {
  const { targetVocabulary = [], maxExchanges = 5 } = parseOptions(exercise)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [exchangeCount, setExchangeCount] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [evaluation, setEvaluation] = useState<{
    used: string[]
    notUsed: string[]
    score: number
  } | null>(null)

  const startTimeRef = useRef(Date.now())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const question =
    locale === 'ja' ? exercise.question_ja || exercise.question : exercise.question

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const finalizeSubmission = useCallback(
    async (score: number, finalMessages: ChatMessage[]) => {
      if (completed) return

      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000)

      const result = await submitExerciseAttempt({
        exerciseId: exercise.id,
        score,
        timeSpentSeconds: timeSpent,
        hintsUsed: 0,
        attempts: 1,
        answerData: {
          messages: finalMessages,
          vocabularyUsed: targetVocabulary,
          exchangeCount,
        },
      })

      if (result.error) {
        toast.error('保存に失敗しました')
      }

      onComplete(score)
    },
    [completed, exercise.id, targetVocabulary, exchangeCount, onComplete]
  )

  const completeConversation = useCallback(
    (finalMessages: ChatMessage[]) => {
      setCompleted(true)
      const eval_ = evaluateVocabularyUsage(finalMessages, targetVocabulary)
      setEvaluation(eval_)

      if (eval_.score >= 80) {
        toast.success(`よくできました! ${eval_.score}%`)
      } else if (eval_.score >= 50) {
        toast.info(`まあまあです: ${eval_.score}%`)
      } else {
        toast.error(`もう少し語彙を使ってみましょう: ${eval_.score}%`)
      }

      void finalizeSubmission(eval_.score, finalMessages)
    },
    [targetVocabulary, finalizeSubmission]
  )

  async function handleSend() {
    if (!inputValue.trim() || isLoading || completed) return

    const userMessage: ChatMessage = { role: 'user', content: inputValue.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue('')
    setIsLoading(true)

    const newExchangeCount = exchangeCount + 1
    setExchangeCount(newExchangeCount)

    // Check if this was the last exchange
    if (newExchangeCount >= maxExchanges) {
      setIsLoading(false)
      completeConversation(newMessages)
      return
    }

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: new Date().toISOString(),
      }))

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          scenario: exercise.question,
        }),
      })

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      const assistantContent = await readSSEResponse(res)

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: assistantContent,
      }

      const updatedMessages = [...newMessages, assistantMessage]
      setMessages(updatedMessages)

      setTimeout(scrollToBottom, 100)
    } catch {
      toast.error('AIの応答に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              <MessageCircle className="mr-1 h-3 w-3" />
              Conversation
            </Badge>
            {completed && evaluation && (
              <Badge
                className={
                  evaluation.score >= 80
                    ? 'bg-green-500'
                    : evaluation.score >= 50
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }
              >
                {evaluation.score >= 80 ? (
                  <CheckCircle className="mr-1 h-3 w-3" />
                ) : (
                  <XCircle className="mr-1 h-3 w-3" />
                )}
                {evaluation.score}%
              </Badge>
            )}
          </div>
          <Badge variant="secondary" className="tabular-nums">
            {exchangeCount}/{maxExchanges}
          </Badge>
        </div>
        <p className="text-base font-semibold pt-2">{question}</p>

        {/* Target vocabulary chips */}
        {targetVocabulary.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            <span className="text-xs text-muted-foreground mr-1">
              使ってみましょう:
            </span>
            {targetVocabulary.map((word) => {
              const isUsed = evaluation?.used.includes(word)
              return (
                <Badge
                  key={word}
                  variant={completed ? (isUsed ? 'default' : 'destructive') : 'secondary'}
                  className={cn(
                    'text-xs',
                    completed && isUsed && 'bg-green-500'
                  )}
                >
                  {word}
                  {completed && isUsed && (
                    <CheckCircle className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              )
            })}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chat messages */}
        <div className="max-h-80 min-h-[120px] overflow-y-auto rounded-lg border bg-muted/20 p-4 space-y-3">
          {messages.length === 0 && !isLoading && (
            <p className="text-center text-sm text-muted-foreground py-6">
              会話を始めましょう。メッセージを入力してください。
            </p>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-muted px-3 py-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        {!completed ? (
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを入力..."
              disabled={isLoading || completed}
            />
            <Button
              onClick={() => void handleSend()}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          /* Evaluation results */
          evaluation && (
            <div className="space-y-3">
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium mb-2">会話の評価:</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">使用した語彙:</span>
                    <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
                      {evaluation.used.length}/{targetVocabulary.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">スコア:</span>
                    <span className="ml-2 font-semibold">{evaluation.score}/100</span>
                  </div>
                </div>

                {evaluation.notUsed.length > 0 && (
                  <div className="mt-3 text-sm">
                    <span className="text-muted-foreground">
                      使われなかった語彙:{' '}
                    </span>
                    {evaluation.notUsed.map((word) => (
                      <Badge
                        key={word}
                        variant="destructive"
                        className="mr-1 text-xs"
                      >
                        {word}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  )
}
