import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { buttonVariants } from '@/components/ui/button'
import { LanguageToggle } from './language-toggle'

export function PublicNavbar() {
  const t = useTranslations('nav')
  const tc = useTranslations('common')

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-primary">
            {tc('appName')}
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              {t('pricing')}
            </Link>
            <Link href="/tutors" className="text-sm text-muted-foreground hover:text-foreground">
              {t('tutors')}
            </Link>
            <Link href="/courses" className="text-sm text-muted-foreground hover:text-foreground">
              {t('courses')}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link href="/login" className={buttonVariants({ variant: 'ghost' })}>
            {tc('login')}
          </Link>
          <Link href="/signup" className={buttonVariants()}>
            {tc('signup')}
          </Link>
        </div>
      </div>
    </header>
  )
}
