'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LanguageToggle } from '@/components/layout/language-toggle'
import { Button } from '@/components/ui/button'

export function FooterNav() {
  const t = useTranslations('landing')
  const tc = useTranslations('common')

  const columns = [
    {
      title: t('footerNav.product'),
      links: [
        { label: t('footerNav.productLinks.features'), href: '/#features' },
        { label: t('footerNav.productLinks.pricing'), href: '/pricing' },
        { label: t('footerNav.productLinks.courses'), href: '/courses' },
        { label: t('footerNav.productLinks.tutors'), href: '/tutors' },
      ],
    },
    {
      title: t('footerNav.company'),
      links: [
        { label: t('footerNav.companyLinks.about'), href: '/about' },
        { label: t('footerNav.companyLinks.blog'), href: '/blog' },
        { label: t('footerNav.companyLinks.contact'), href: '/contact' },
      ],
    },
    {
      title: t('footerNav.support'),
      links: [
        { label: t('footerNav.supportLinks.help'), href: '/help' },
        { label: t('footerNav.supportLinks.faq'), href: '/faq' },
        { label: t('footerNav.supportLinks.terms'), href: '/terms' },
        { label: t('footerNav.supportLinks.privacy'), href: '/privacy' },
      ],
    },
  ]

  return (
    <footer className="border-t bg-[oklch(0.97_0.01_250)]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div>
            <Link href="/" className="text-lg font-bold text-primary">
              {tc('appName')}
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('footerNav.tagline')}
            </p>
            {/* Social icons */}
            <div className="mt-4 flex gap-3">
              {['X', 'IG', 'YT', 'LINE'].map((icon) => (
                <div
                  key={icon}
                  className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-8 border-t pt-8">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <span className="text-sm font-medium">{t('footerNav.newsletter')}</span>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={t('footerNav.emailPlaceholder')}
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <Button size="sm" className="bg-primary text-primary-foreground">
                OK
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <p className="text-xs text-muted-foreground">{t('footer.copyright')}</p>
          <LanguageToggle />
        </div>
      </div>
    </footer>
  )
}
