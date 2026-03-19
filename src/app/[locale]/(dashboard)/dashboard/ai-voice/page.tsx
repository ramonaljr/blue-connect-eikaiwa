import Link from 'next/link'
import { requireAuth } from '@/lib/auth/guard'
import { VoicePageContent } from '@/components/voice/voice-page-content'

export default async function AIVoicePage() {
  const user = await requireAuth()

  // Free tier can't access voice
  if (user.subscription_tier === 'free') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-center space-y-4">
        <h1 className="text-2xl font-bold">AI音声練習</h1>
        <p className="text-muted-foreground max-w-md">
          AI音声機能はProプラン以上でご利用いただけます。AIと英語で会話し、発音スコアをリアルタイムで確認できます。
        </p>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          プランをアップグレード
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
