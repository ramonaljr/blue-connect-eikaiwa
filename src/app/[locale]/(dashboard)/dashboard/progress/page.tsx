import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flame, Star, BookOpen, MessageSquare, Mic } from 'lucide-react'

export default async function ProgressPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: conversations } = await supabase
    .from('ai_conversations')
    .select('mode, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  const { data: completedLessons } = await supabase
    .from('lessons')
    .select('id')
    .eq('learner_id', user.id)
    .eq('status', 'completed')

  const { data: courseProgress } = await supabase
    .from('learner_progress')
    .select('status')
    .eq('user_id', user.id)
    .eq('status', 'completed')

  const textChats = conversations?.filter((c) => c.mode === 'text_chat').length ?? 0
  const voiceSessions = conversations?.filter((c) => c.mode !== 'text_chat').length ?? 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">学習進捗</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">XP</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.xp.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">連続学習</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.streak_days}日</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CEFRレベル</CardTitle>
            <Badge variant="secondary">{user.english_level}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.english_level}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">完了レッスン</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedLessons?.length ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              AI テキストチャット
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{textChats} 回</p>
            <p className="text-sm text-muted-foreground">過去30日間</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              AI 音声セッション
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{voiceSessions} 回</p>
            <p className="text-sm text-muted-foreground">過去30日間</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
