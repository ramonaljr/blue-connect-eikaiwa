'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { createCheckoutSession, createCustomerPortalSession, purchaseCredits } from '@/lib/actions/stripe'
import { STRIPE_PLANS, CREDIT_PRODUCTS } from '@/lib/stripe/config'
import type { User } from '@/lib/types/database'

const PLAN_FEATURES: Record<string, string[]> = {
  free: ['AI英会話 1日3回', 'コースプレビュー'],
  pro: ['AI英会話 無制限', 'AI音声 1日5回', '全コースアクセス'],
  premium: ['全機能', '認定講師月4回', '優先予約'],
}

const PLAN_BADGE_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  pro: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  premium: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
}

const STATUS_BADGE_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 hover:bg-green-100',
  canceled: 'bg-red-100 text-red-700 hover:bg-red-100',
  past_due: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  trialing: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
}

export function SubscriptionSection({ user }: { user: User }) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const tier = user.subscription_tier
  const plan = STRIPE_PLANS[tier]

  async function handleUpgrade(targetTier: 'pro' | 'premium') {
    setLoadingAction(`upgrade-${targetTier}`)
    try {
      const result = await createCheckoutSession(targetTier)
      if (result.error) {
        toast.error(result.error)
        return
      }
      if (result.url) {
        window.location.href = result.url
      }
    } catch {
      toast.error('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoadingAction(null)
    }
  }

  async function handleManage() {
    setLoadingAction('manage')
    try {
      const result = await createCustomerPortalSession()
      if (result.error) {
        toast.error(result.error)
        return
      }
      if (result.url) {
        window.location.href = result.url
      }
    } catch {
      toast.error('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoadingAction(null)
    }
  }

  async function handlePurchaseCredits(productKey: string) {
    setLoadingAction(`credits-${productKey}`)
    try {
      const result = await purchaseCredits(productKey)
      if (result.error) {
        toast.error(result.error)
        return
      }
      if (result.url) {
        window.location.href = result.url
      }
    } catch {
      toast.error('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle>現在のプラン</CardTitle>
            <Badge className={PLAN_BADGE_COLORS[tier]} variant="secondary">
              {plan.name_ja}
            </Badge>
            <Badge className={STATUS_BADGE_COLORS[user.subscription_status]} variant="secondary">
              {user.subscription_status}
            </Badge>
          </div>
          <CardDescription>
            {plan.price === 0
              ? '無料'
              : `¥${plan.price.toLocaleString()} / 月`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plan Features */}
          <div>
            <p className="text-sm font-medium mb-2">プランの機能</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {PLAN_FEATURES[tier]?.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>

          {/* Upgrade / Manage Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            {tier === 'free' && (
              <>
                <Button
                  onClick={() => handleUpgrade('pro')}
                  disabled={loadingAction !== null}
                >
                  {loadingAction === 'upgrade-pro' ? '処理中...' : 'Proにアップグレード'}
                </Button>
                <Button
                  onClick={() => handleUpgrade('premium')}
                  variant="outline"
                  disabled={loadingAction !== null}
                >
                  {loadingAction === 'upgrade-premium' ? '処理中...' : 'Premiumにアップグレード'}
                </Button>
              </>
            )}
            {tier === 'pro' && (
              <>
                <Button
                  onClick={() => handleUpgrade('premium')}
                  disabled={loadingAction !== null}
                >
                  {loadingAction === 'upgrade-premium' ? '処理中...' : 'Premiumにアップグレード'}
                </Button>
                <Button
                  onClick={handleManage}
                  variant="outline"
                  disabled={loadingAction !== null}
                >
                  {loadingAction === 'manage' ? '処理中...' : 'プランを管理'}
                </Button>
              </>
            )}
            {tier === 'premium' && (
              <Button
                onClick={handleManage}
                variant="outline"
                disabled={loadingAction !== null}
              >
                {loadingAction === 'manage' ? '処理中...' : 'プランを管理'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Credit Purchase */}
      <Card>
        <CardHeader>
          <CardTitle>クレジットを購入</CardTitle>
          <CardDescription>追加のクレジットを購入できます</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(CREDIT_PRODUCTS).map(([key, product]) => (
              <Card key={key}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">{product.name_ja}</p>
                      <p className="text-sm text-muted-foreground">
                        ¥{product.price.toLocaleString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => handlePurchaseCredits(key)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={loadingAction !== null}
                    >
                      {loadingAction === `credits-${key}` ? '処理中...' : '購入'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
