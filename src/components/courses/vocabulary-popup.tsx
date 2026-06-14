'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Bookmark } from 'lucide-react'
import { savePhrase } from '@/lib/actions/phrases'
import { toast } from 'sonner'

interface VocabularyPopupProps {
  item: {
    word: string
    reading?: string
    meaning: string
    meaning_ja?: string
    example?: string
  }
  locale: string
}

export function VocabularyPopup({ item, locale }: VocabularyPopupProps) {
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)

  const meaning =
    locale === 'ja' ? item.meaning_ja || item.meaning : item.meaning

  async function handleSave() {
    setSaving(true)
    const result = await savePhrase({
      phrase: item.word,
      translation: meaning,
      context: item.example ?? '',
    })
    setSaving(false)
    if ('success' in result) {
      toast.success('フレーズを保存しました')
    } else {
      toast.error('保存に失敗しました')
    }
  }

  return (
    <div className="rounded-lg border p-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <span className="font-medium">{item.word}</span>
          <span className="ml-2 text-sm text-muted-foreground">{meaning}</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {expanded && (
        <div className="mt-3 space-y-2 border-t pt-3">
          {item.reading && (
            <p className="text-xs text-muted-foreground">
              発音: {item.reading}
            </p>
          )}
          {item.example && (
            <p className="text-sm italic text-muted-foreground">
              &ldquo;{item.example}&rdquo;
            </p>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={saving}
          >
            <Bookmark className="mr-1 h-3 w-3" />
            {saving ? '保存中...' : 'フレーズを保存'}
          </Button>
        </div>
      )}
    </div>
  )
}
