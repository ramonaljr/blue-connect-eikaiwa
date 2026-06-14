'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { bookLesson } from '@/lib/actions/lessons'
import { toast } from 'sonner'
import { Clock, Calendar, CreditCard, Loader2 } from 'lucide-react'

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tutorName: string
  tutorAvatar: string | null
  tutorId: string
  selectedTime: string // ISO string
  duration: 25 | 50
  isCertified: boolean
  onSuccess: (lessonId: string) => void
}

export function BookingModal({
  open,
  onOpenChange,
  tutorName,
  tutorAvatar,
  tutorId,
  selectedTime,
  duration,
  isCertified,
  onSuccess,
}: BookingModalProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const formattedDate = new Date(selectedTime).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timeZone: 'Asia/Tokyo',
  })

  const formattedTime = new Date(selectedTime).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  })

  const creditType = isCertified ? '認定講師クレジット' : 'コミュニティクレジット'

  function handleConfirm() {
    setError(null)
    startTransition(async () => {
      const result = await bookLesson({
        tutorId,
        scheduledAt: selectedTime,
        durationMinutes: duration,
      })

      if (result.error) {
        if (result.error.includes('クレジット')) {
          setError('credits')
        } else {
          toast.error(result.error)
        }
        return
      }

      if (result.success && result.lessonId) {
        toast.success('レッスンを予約しました')
        onOpenChange(false)
        onSuccess(result.lessonId)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>レッスン予約の確認</DialogTitle>
          <DialogDescription>
            以下の内容でレッスンを予約します
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tutor info */}
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              {tutorAvatar && <AvatarImage src={tutorAvatar} alt={tutorName} />}
              <AvatarFallback>{tutorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{tutorName}</p>
              <Badge variant={isCertified ? 'default' : 'secondary'}>
                {isCertified ? '認定講師' : 'コミュニティ講師'}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Booking details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formattedTime} (JST)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">{duration}分</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span>1 クレジット ({creditType})</span>
            </div>
          </div>

          {/* Credit error */}
          {error === 'credits' && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <p className="font-medium">クレジットが不足しています</p>
              <p className="mt-1">
                <Link
                  href="/dashboard/settings?tab=subscription"
                  className="underline underline-offset-2 hover:text-destructive/80"
                >
                  サブスクリプション設定
                </Link>
                からクレジットを追加してください。
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            キャンセル
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                予約中...
              </>
            ) : (
              '予約を確定'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
