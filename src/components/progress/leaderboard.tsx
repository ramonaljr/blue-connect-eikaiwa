'use client'

import { useState, useCallback, useEffect, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Trophy, Medal, Crown, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getWeeklyLeaderboard, toggleLeaderboardOptIn } from '@/lib/actions/progress'

export interface LeaderboardProps {
  userId: string
  optedIn: boolean
}

type Ranking = {
  rank: number
  userId: string
  displayName: string
  avatarUrl: string | null
  xp: number
  isCurrentUser: boolean
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
  return <span className="w-5 text-center text-sm font-semibold text-muted-foreground">{rank}</span>
}

export function Leaderboard({ userId, optedIn: initialOptedIn }: LeaderboardProps) {
  const [optedIn, setOptedIn] = useState(initialOptedIn)
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [userRank, setUserRank] = useState(0)
  const [isFetching, startFetchTransition] = useTransition()
  const [isPending, startTransition] = useTransition()

  const fetchLeaderboard = useCallback(() => {
    startFetchTransition(async () => {
      const { rankings: r, userRank: ur } = await getWeeklyLeaderboard(userId)
      setRankings(r)
      setUserRank(ur)
    })
  }, [userId])

  useEffect(() => {
    if (optedIn) {
      fetchLeaderboard()
    }
  }, [optedIn, fetchLeaderboard])

  const handleOptIn = () => {
    startTransition(async () => {
      const result = await toggleLeaderboardOptIn(true)
      if (result.success) {
        setOptedIn(true)
      }
    })
  }

  if (!optedIn) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold">ランキングに参加しよう</h3>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              他の学習者とXPを競い合い、モチベーションを高めましょう。ランキングは毎週月曜日にリセットされます。
            </p>
          </div>
          <Button onClick={handleOptIn} disabled={isPending} className="gap-1.5">
            <Zap className="h-4 w-4" />
            参加する
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5" />
          今週のランキング
        </CardTitle>
        {userRank > 0 && (
          <p className="text-sm text-muted-foreground">
            あなたの順位: <span className="font-semibold text-foreground">{userRank}位</span>
          </p>
        )}
      </CardHeader>

      <CardContent>
        {isFetching && (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {!isFetching && rankings.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            今週はまだランキングデータがありません
          </p>
        )}

        {!isFetching && rankings.length > 0 && (
          <div className="space-y-1">
            {rankings.map((entry) => (
              <div
                key={entry.userId}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                  entry.isCurrentUser
                    ? 'bg-primary/10 ring-1 ring-primary/20'
                    : 'hover:bg-muted/50'
                )}
              >
                <RankIcon rank={entry.rank} />

                <Avatar size="sm">
                  {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} />}
                  <AvatarFallback>
                    {entry.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <span
                  className={cn(
                    'flex-1 truncate text-sm',
                    entry.isCurrentUser ? 'font-semibold' : 'font-medium'
                  )}
                >
                  {entry.displayName}
                  {entry.isCurrentUser && (
                    <span className="ml-1.5 text-xs text-muted-foreground">(あなた)</span>
                  )}
                </span>

                <span className="shrink-0 text-sm font-semibold tabular-nums text-muted-foreground">
                  {entry.xp.toLocaleString()} XP
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
