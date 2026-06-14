'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteSavedPhrase } from '@/lib/actions/phrases'
import { toast } from 'sonner'

interface PhraseListProps {
  phrases: Array<{ id: string; phrase: string; translation: string; context: string; created_at: string }>
  onDelete?: (id: string) => void
}

export function PhraseList({ phrases, onDelete }: PhraseListProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteSavedPhrase(id)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('フレーズを削除しました')
        onDelete?.(id)
      }
    })
  }

  if (phrases.length === 0) {
    return <p className="text-center py-8 text-muted-foreground">保存されたフレーズがありません</p>
  }

  return (
    <div className="space-y-2">
      {phrases.map(p => (
        <div key={p.id} className="flex items-start justify-between rounded-lg border p-3">
          <div className="space-y-1">
            <p className="font-medium">{p.phrase}</p>
            <p className="text-sm text-blue-600">{p.translation}</p>
            {p.context && <p className="text-xs text-muted-foreground italic">&quot;{p.context}&quot;</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} disabled={isPending}>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      ))}
    </div>
  )
}
