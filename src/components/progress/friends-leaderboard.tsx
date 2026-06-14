'use client'

import { useState, useEffect, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, UserPlus, Flame } from 'lucide-react'
import { getFriends, sendFriendRequest, getPendingRequests, respondToFriendRequest } from '@/lib/actions/friends'
import { toast } from 'sonner'

export function FriendsLeaderboard({ userId }: { userId: string }) {
  const [friends, setFriends] = useState<Array<{ id: string; display_name: string; xp: number; streak_days: number }>>([])
  const [pending, setPending] = useState<Array<{ id: string; requester: { display_name: string } }>>([])
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const [friendsResult, pendingResult] = await Promise.all([getFriends(), getPendingRequests()])
      if ('data' in friendsResult && friendsResult.data) setFriends(friendsResult.data)
      if ('data' in pendingResult && pendingResult.data) setPending(pendingResult.data)
    })
  }, [userId])

  const handleAdd = () => {
    if (!email) return
    startTransition(async () => {
      const result = await sendFriendRequest(email)
      if ('error' in result) toast.error(result.error)
      else { toast.success('リクエストを送信しました'); setEmail('') }
    })
  }

  const handleRespond = (id: string, accept: boolean) => {
    startTransition(async () => {
      await respondToFriendRequest(id, accept)
      setPending(prev => prev.filter(p => p.id !== id))
      if (accept) {
        const result = await getFriends()
        if ('data' in result && result.data) setFriends(result.data)
      }
    })
  }

  return (
    <div className="space-y-4">
      {pending.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">フレンドリクエスト</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pending.map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <span className="text-sm">{p.requester.display_name}</span>
                <div className="flex gap-1">
                  <Button size="sm" onClick={() => handleRespond(p.id, true)}>承認</Button>
                  <Button size="sm" variant="outline" onClick={() => handleRespond(p.id, false)}>拒否</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5" /> 学習仲間
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="メールアドレスで友達を追加" value={email} onChange={e => setEmail(e.target.value)} />
            <Button size="sm" onClick={handleAdd} disabled={isPending}>
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>

          {friends.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">まだ学習仲間がいません</p>
          ) : (
            <div className="space-y-2">
              {friends.sort((a, b) => b.xp - a.xp).map((f, i) => (
                <div key={f.id} className="flex items-center justify-between rounded-lg border p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium w-6">{i + 1}</span>
                    <span className="text-sm">{f.display_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span>{f.xp} XP</span>
                    <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-orange-500" />{f.streak_days}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
