'use client'

import { useState, useTransition } from 'react'
import { Wallet, ExternalLink, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createTutorConnectOnboardingLink } from '@/lib/actions/payouts'

type Props = {
  paidTotal: number
  pendingTotal: number
  payoutsEnabled: boolean
  onboardingStarted: boolean
}

function yen(n: number) {
  return `¥${n.toLocaleString('ja-JP')}`
}

export function TutorPayoutsCard({ paidTotal, pendingTotal, payoutsEnabled, onboardingStarted }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleConnect = () => {
    setError(null)
    startTransition(async () => {
      const result = await createTutorConnectOnboardingLink()
      if ('url' in result) {
        window.location.href = result.url
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Wallet className="h-5 w-5 text-emerald-600" />
          報酬
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-4">
          <div>
            <div className="text-3xl font-bold">{yen(paidTotal)}</div>
            <div className="text-xs text-muted-foreground">支払い済み</div>
          </div>
          {pendingTotal > 0 && (
            <div>
              <div className="text-xl font-semibold text-muted-foreground">{yen(pendingTotal)}</div>
              <div className="text-xs text-muted-foreground">保留中</div>
            </div>
          )}
        </div>

        {payoutsEnabled ? (
          <p className="text-xs text-emerald-600">受け取り設定が完了しています（レッスンの70%）</p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              レッスン報酬を受け取るには、Stripeで受け取り設定を完了してください。
            </p>
            <Button size="sm" onClick={handleConnect} disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              {onboardingStarted ? '受け取り設定を続ける' : '受け取り設定を始める'}
            </Button>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
