'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cancelLesson } from '@/lib/actions/lessons'

interface CancelLessonDialogProps {
  lessonId: string
  scheduledAt: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CancelLessonDialog({
  lessonId,
  scheduledAt,
  open,
  onOpenChange,
}: CancelLessonDialogProps) {
  const [reason, setReason] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [mountTime] = useState(() => Date.now())
  const hoursUntil = useMemo(() => {
    return (new Date(scheduledAt).getTime() - mountTime) / (1000 * 60 * 60)
  }, [scheduledAt, mountTime])

  const refundPolicy = useMemo(() => {
    if (hoursUntil >= 24) {
      return {
        text: '全額返金されます',
        color: 'text-green-600 dark:text-green-400',
      }
    }
    if (hoursUntil >= 2) {
      return {
        text: '50%返金されます',
        color: 'text-yellow-600 dark:text-yellow-400',
      }
    }
    return {
      text: '返金はありません',
      color: 'text-red-600 dark:text-red-400',
    }
  }, [hoursUntil])

  function handleCancel() {
    setError(null)
    startTransition(async () => {
      const result = await cancelLesson(lessonId, reason || undefined)
      if (result.error) {
        setError(result.error)
      } else {
        onOpenChange(false)
        setReason('')
        router.refresh()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>レッスンをキャンセルしますか？</DialogTitle>
          <DialogDescription>
            キャンセルポリシーに基づき返金額が決まります。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className={`text-sm font-medium ${refundPolicy.color}`}>
            {refundPolicy.text}
          </p>

          <div>
            <label
              htmlFor="cancel-reason"
              className="mb-1.5 block text-sm font-medium"
            >
              キャンセル理由（任意）
            </label>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="理由を入力してください..."
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            戻る
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isPending}
          >
            {isPending ? 'キャンセル中...' : 'キャンセルする'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
