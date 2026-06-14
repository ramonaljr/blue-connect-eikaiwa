'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Copy, Check, MessageCircle, HelpCircle, ThumbsUp, HandMetal } from 'lucide-react'

const PHRASES = {
  greetings: {
    label: '挨拶',
    icon: MessageCircle,
    items: [
      { en: 'Nice to meet you', ja: 'はじめまして' },
      { en: 'How are you?', ja: 'お元気ですか？' },
      { en: "I'm doing well, thanks", ja: 'おかげさまで元気です' },
    ],
  },
  asking_help: {
    label: '助けを求める',
    icon: HelpCircle,
    items: [
      { en: 'Could you repeat that?', ja: 'もう一度言っていただけますか？' },
      { en: 'What does ... mean?', ja: '...はどういう意味ですか？' },
      {
        en: 'Could you speak more slowly?',
        ja: 'もう少しゆっくり話していただけますか？',
      },
      {
        en: 'How do you spell that?',
        ja: 'スペルを教えていただけますか？',
      },
    ],
  },
  confirmation: {
    label: '確認',
    icon: ThumbsUp,
    items: [
      { en: 'I understand', ja: 'わかりました' },
      { en: 'I see', ja: 'なるほど' },
      { en: 'That makes sense', ja: 'それは理解できます' },
    ],
  },
  farewell: {
    label: '別れ',
    icon: HandMetal,
    items: [
      {
        en: 'Thank you for the lesson',
        ja: 'レッスンありがとうございました',
      },
      { en: 'I learned a lot today', ja: '今日はたくさん学びました' },
      { en: 'See you next time', ja: 'また次回お会いしましょう' },
    ],
  },
} as const

export function PhrasePanel() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function copyPhrase(en: string, id: string) {
    await navigator.clipboard.writeText(en)
    setCopiedId(id)
    toast.success('コピーしました')
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="h-full space-y-4 overflow-y-auto p-3">
      {Object.entries(PHRASES).map(([key, category]) => {
        const Icon = category.icon
        return (
          <div key={key}>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
              {category.label}
            </h3>
            <div className="space-y-1.5">
              {category.items.map((phrase, idx) => {
                const phraseId = `${key}-${idx}`
                return (
                  <button
                    key={phraseId}
                    onClick={() => copyPhrase(phrase.en, phraseId)}
                    className="group w-full rounded-lg border p-2.5 text-left transition-colors hover:bg-muted"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{phrase.en}</p>
                        <p className="text-xs text-muted-foreground">
                          {phrase.ja}
                        </p>
                      </div>
                      <span className="mt-0.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                        {copiedId === phraseId ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
