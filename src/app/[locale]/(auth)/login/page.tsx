import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen">
      {/* Brand Panel — hidden on mobile */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-gradient-mesh lg:flex">
        <div className="relative z-10 max-w-md px-8">
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Blue Connect<br />
            <span className="text-gradient-blue">Eikaiwa</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            AIと一緒に、英語がもっと楽しくなる
          </p>

          {/* Mini chat preview */}
          <div className="mt-8 glass rounded-2xl p-4 shadow-elevated">
            <div className="mb-2 flex items-center gap-2">
              <div className="size-2.5 rounded-full bg-destructive/60" />
              <div className="size-2.5 rounded-full bg-accent/60" />
              <div className="size-2.5 rounded-full bg-[oklch(0.65_0.18_155)]/60" />
              <span className="ml-1.5 text-xs text-muted-foreground">AI英会話チャット</span>
            </div>
            <div className="space-y-2">
              <div className="ml-auto max-w-[75%] rounded-xl rounded-br-sm bg-primary px-3 py-2 text-xs text-primary-foreground">
                ビジネス会議での自己紹介は？
              </div>
              <div className="max-w-[80%] rounded-xl rounded-bl-sm bg-muted px-3 py-2 text-xs">
                いい質問ですね！「Hello, I&apos;m [名前] from [会社名]」が自然です。
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
            <span>⭐ 4.9/5</span>
            <span>5,000+ 学習者</span>
            <span>24時間対応</span>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex w-full items-center justify-center p-4 lg:w-1/2">
        <LoginForm />
      </div>
    </main>
  )
}
