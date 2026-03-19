import { requireAuth } from '@/lib/auth/guard'
import { getTranslations } from 'next-intl/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LanguageToggle } from './language-toggle'
import { signOut } from '@/lib/actions/auth'
import { Bell, LogOut } from 'lucide-react'

export async function DashboardHeader() {
  const user = await requireAuth()
  const tc = await getTranslations('common')

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{tc('dashboard')}</span>
      </div>
      <div className="flex items-center gap-3">
        <LanguageToggle />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent" />
        </Button>
        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
          <Avatar className="size-8">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {user.display_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium sm:block">{user.display_name}</span>
        </div>
        <form action={signOut}>
          <Button variant="ghost" size="icon-sm" type="submit" title={tc('logout')}>
            <LogOut className="size-4" />
          </Button>
        </form>
      </div>
    </header>
  )
}
