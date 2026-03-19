'use client'

import { useState } from 'react'
import { MessageSquare, ArrowRight } from 'lucide-react'
import { ScenarioPicker } from '@/components/ai/scenario-picker'
import { ChatInterface } from '@/components/ai/chat-interface'
import Link from 'next/link'
import type { ScenarioKey } from '@/lib/ai/system-prompts'

interface Conversation {
  id: string
  mode: string
  scenario: string | null
  scenario_key: string | null
  created_at: string
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp?: string }>
}

interface AIChatPageContentProps {
  conversations: Conversation[]
  usageRemaining: number // -1 means unlimited
  tier: string
}

type View = 'picker' | 'chat'

export function AIChatPageContent({ conversations, usageRemaining, tier }: AIChatPageContentProps) {
  const [view, setView] = useState<View>('picker')
  const [scenarioToLoad, setScenarioToLoad] = useState<{ key: ScenarioKey | null; customTopic?: string } | null>(null)
  const [conversationToLoad, setConversationToLoad] = useState<{ id: string; messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>; scenario?: string } | null>(null)

  function handleSelectScenario(scenarioKey: ScenarioKey | null, customTopic?: string) {
    setScenarioToLoad({ key: scenarioKey, customTopic })
    setConversationToLoad(null)
    setView('chat')
  }

  function handleLoadConversation(conv: Conversation) {
    setConversationToLoad({
      id: conv.id,
      messages: conv.messages.map(m => ({ ...m, timestamp: m.timestamp ?? '' })),
      scenario: conv.scenario ?? undefined,
    })
    setScenarioToLoad(null)
    setView('chat')
  }

  function handleBack() {
    setView('picker')
    setScenarioToLoad(null)
    setConversationToLoad(null)
  }

  if (view === 'chat') {
    return (
      <div className="h-full">
        <ChatInterface
          onBack={handleBack}
          initialScenario={scenarioToLoad}
          initialConversation={conversationToLoad}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Usage banner for free tier */}
      {tier === 'free' && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3 dark:bg-muted/80 dark:border-border">
          <span className="text-sm">
            本日の残り回数: <strong>{usageRemaining}</strong>/3
          </span>
          {usageRemaining <= 1 && (
            <Link
              href="/dashboard/settings/billing"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              アップグレード
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}

      {/* Main grid: scenario picker + conversation history */}
      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-3">
        {/* Scenario picker (main area) */}
        <div className="overflow-y-auto lg:col-span-2">
          <ScenarioPicker onSelect={handleSelectScenario} />
        </div>

        {/* Conversation history sidebar */}
        <div className="hidden min-h-0 flex-col lg:flex">
          <div className="mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">会話履歴</h3>
          </div>

          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground">まだ会話がありません</p>
          ) : (
            <div className="flex-1 space-y-2 overflow-y-auto">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleLoadConversation(conv)}
                  className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 dark:bg-card dark:hover:bg-muted"
                >
                  <p className="text-sm font-medium truncate">
                    {conv.scenario || '自由会話'}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {new Date(conv.created_at).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>
                      {conv.messages?.length ?? 0}件
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
