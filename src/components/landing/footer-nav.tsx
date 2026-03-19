'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LanguageToggle } from '@/components/layout/language-toggle'

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
