import { requireAuth } from '@/lib/auth/guard'

export default async function DashboardPage() {
  const user = await requireAuth()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        こんにちは、{user.display_name}さん
      </h1>
      <p className="text-muted-foreground">
        今日も英語の練習を始めましょう！
      </p>
    </div>
  )
}
