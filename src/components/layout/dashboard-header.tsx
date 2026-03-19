import { requireAuth } from '@/lib/auth/guard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LanguageToggle } from './language-toggle'
import { signOut } from '@/lib/actions/auth'

export async function DashboardHeader() {
  const user = await requireAuth()

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div />
      <div className="flex items-center gap-4">
        <LanguageToggle />
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback>{user.display_name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{user.display_name}</span>
        </div>
        <form action={signOut}>
          <Button variant="ghost" size="sm" type="submit">
            ログアウト
          </Button>
        </form>
      </div>
    </header>
  )
}
