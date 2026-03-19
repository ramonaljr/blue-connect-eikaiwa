'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale() {
    const newLocale = locale === 'ja' ? 'en' : 'ja'
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
  }

  return (
    <Button variant="ghost" size="sm" onClick={switchLocale}>
      {locale === 'ja' ? 'EN' : '日本語'}
    </Button>
  )
}
