import Link from 'next/link'
import { Mic, MessageSquare, Target, Drama } from 'lucide-react'
import { requireAuth } from '@/lib/auth/guard'
import { VoicePageContent } from '@/components/voice/voice-page-content'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function AIVoicePage() {
  const user = await requireAuth()

  // Free tier can't access voice
  if (user.subscription_tier === 'free') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <Mic className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold">AI音声練習</h1>
          <p className="text-muted-foreground">
            AIと英語で会話し、発音スコアをリアルタイムで確認できます。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 max-w-2xl">
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-blue-500 mb-2" />
              <p className="font-medium">音声チャット</p>
              <p className="text-xs text-muted-foreground">自然な英会話を練習</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Target className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <p className="font-medium">発音スコア</p>
              <p className="text-xs text-muted-foreground">リアルタイムで採点</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Drama className="mx-auto h-8 w-8 text-purple-500 mb-2" />
              <p className="font-medium">ロールプレイ</p>
              <p className="text-xs text-muted-foreground">シーン別の没入練習</p>
            </CardContent>
          </Card>
        </div>

        <Link href="/dashboard/settings">
          <Button size="lg">プランをアップグレード</Button>
        </Link>
      </div>
    )
  }

  return (
    <VoicePageContent
      user={{
        id: user.id,
        displayName: user.display_name,
        englishLevel: user.english_level,
        personality: user.ai_personality,
        correctionLevel: user.ai_correction_level,
        tier: user.subscription_tier,
      }}
    />
  )
}
