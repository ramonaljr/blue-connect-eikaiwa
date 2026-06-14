'use client'

import { useState, useEffect, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Target, Gift, CheckCircle } from 'lucide-react'
import { getDailyMissions, claimMissionReward } from '@/lib/actions/missions'
import { toast } from 'sonner'

export function TodaysMissions() {
  const [missions, setMissions] = useState<Array<{
    id: string; type: string; title_ja: string
    target: number; current: number; xpReward: number; completed: boolean
  }>>([])
  const [claimed, setClaimed] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const result = await getDailyMissions()
      if ('data' in result) setMissions(result.data)
    })
  }, [])

  const handleClaim = (missionId: string) => {
    startTransition(async () => {
      const result = await claimMissionReward(missionId)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        setClaimed(prev => new Set(prev).add(missionId))
        toast.success('+25 XP 獲得！')
      }
    })
  }

  if (missions.length === 0) return null

  const completedCount = missions.filter(m => m.completed).length

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-5 w-5 text-blue-600" />
          今日のミッション ({completedCount}/{missions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {missions.map(m => (
          <div key={m.id} className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className={m.completed ? 'line-through text-muted-foreground' : ''}>
                  {m.title_ja}
                </span>
                <span className="text-xs text-muted-foreground">{m.current}/{m.target}</span>
              </div>
              <Progress value={(m.current / m.target) * 100} className="h-1.5" />
            </div>
            {m.completed && !claimed.has(m.id) ? (
              <Button size="sm" variant="outline" onClick={() => handleClaim(m.id)}>
                <Gift className="mr-1 h-3 w-3" /> +{m.xpReward}XP
              </Button>
            ) : m.completed ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
