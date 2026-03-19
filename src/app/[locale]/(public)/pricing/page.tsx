'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { SectionReveal, StaggerContainer, StaggerItem } from '@/components/ui/motion'

const plans = [
  { key: 'free' as const, featureCount: 3, cta: 'cta' as const, highlighted: false },
  { key: 'pro' as const, featureCount: 5, cta: 'ctaPro' as const, highlighted: true },
  { key: 'premium' as const, featureCount: 6, cta: 'ctaPremium' as const, highlighted: false },
]

export default function PricingPage() {
  const t = useTranslations('pricing')

  return (
    <main className="flex flex-col items-center px-4 py-16 md:py-24">
      <SectionReveal>
        <h1 className="text-center text-4xl font-bold tracking-tight md:text-5xl">{t('title')}</h1>
        <p className="mt-4 text-center text-lg text-muted-foreground">{t('subtitle')}</p>
      </SectionReveal>

      <StaggerContainer className="mt-12 grid w-full max-w-5xl gap-6 md:grid-cols-3" staggerDelay={0.15}>
        {plans.map(({ key, featureCount, cta, highlighted }) => (
          <StaggerItem key={key}>
            <Card
              className={cn(
                'relative flex flex-col transition-all duration-300 hover:-translate-y-1',
                highlighted
                  ? 'border-primary shadow-card-hover ring-2 ring-primary'
                  : 'hover:shadow-card-hover'
              )}
            >
              {highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-accent text-accent-foreground">{t('recommended')}</Badge>
                </div>
              )}
              <CardHeader className="items-center text-center">
                <CardTitle className="text-xl">{t(`${key}.name`)}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">{t(`${key}.price`)}</span>
                  {key !== 'free' && (
                    <span className="text-muted-foreground">{t('monthly')}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="flex-1 space-y-3">
                  {Array.from({ length: featureCount }, (_, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-sm">{t(`${key}.features.${i + 1}`)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link
                    href="/signup"
                    className={cn(
                      buttonVariants({
                        variant: highlighted ? 'default' : 'outline',
                        size: 'lg',
                      }),
                      'w-full',
                      highlighted && 'bg-accent text-accent-foreground hover:bg-accent/90'
                    )}
                  >
                    {t(cta)}
                    {highlighted && <ArrowRight className="ml-1 size-4" />}
                  </Link>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </main>
  )
}
