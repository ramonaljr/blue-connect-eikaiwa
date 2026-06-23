import { SignupForm } from '@/components/auth/signup-form'
import { AuthSceneMount } from '@/components/auth/auth-scene-mount'

export default function SignupPage() {
  return (
    <main className="flex min-h-screen">
      {/* Brand Panel — hidden on mobile */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-gradient-mesh lg:flex">
        <AuthSceneMount />
        <div className="relative z-10 max-w-md px-8">
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Blue Connect<br />
            <span className="text-gradient-blue">Eikaiwa</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            AIと一緒に、英語がもっと楽しくなる
          </p>

          {/* Benefits list */}
          <div className="mt-8 space-y-4">
            {[
              { emoji: '🤖', text: 'AI英会話パートナーと24時間練習' },
              { emoji: '📚', text: 'TOEIC・英検対策コースで体系的に学習' },
              { emoji: '👩‍🏫', text: 'プロ講師とマンツーマンレッスン' },
              { emoji: '🆓', text: '無料プランで今すぐ始められる' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 glass rounded-xl px-4 py-3">
                <span className="text-lg">{item.emoji}</span>
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Trust signals */}
          <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
            <span>⭐ 4.9/5</span>
            <span>5,000+ 学習者</span>
            <span>クレジットカード不要</span>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex w-full items-center justify-center p-4 lg:w-1/2">
        <SignupForm />
      </div>
    </main>
  )
}
