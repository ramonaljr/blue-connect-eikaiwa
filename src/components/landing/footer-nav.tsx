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
              {/* X/Twitter */}
              <a href="#" className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
                <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              {/* Instagram */}
              <a href="#" className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              {/* YouTube */}
              <a href="#" className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              {/* LINE */}
              <a href="#" className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 5.82 2 10.5c0 2.93 1.95 5.5 4.86 6.96-.17.63-.62 2.28-.71 2.64-.12.45.16.44.34.32.14-.1 2.19-1.47 3.1-2.08.78.12 1.58.18 2.41.18 5.52 0 10-3.82 10-8.52S17.52 2 12 2z"/></svg>
              </a>
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
