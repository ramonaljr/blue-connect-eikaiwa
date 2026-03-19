'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Check, ArrowRight, ChevronDown } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { SectionReveal, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { FooterNav } from '@/components/landing/footer-nav'
import { useState } from 'react'

const plans = [
  { key: 'free' as const, featureCount: 3, cta: 'cta' as const, highlighted: false },
  { key: 'pro' as const, featureCount: 5, cta: 'ctaPro' as const, highlighted: true },
  { key: 'premium' as const, featureCount: 6, cta: 'ctaPremium' as const, highlighted: false },
]

const faqKeys = ['q1', 'q2', 'q3', 'q4'] as const

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium transition-colors hover:text-primary"
      >
        {question}
        <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{answer}</p>
      )}
    </div>
  )
}

export default function PricingPage() {
  const t = useTranslations('pricing')

  return (
    <main className="flex flex-col overflow-x-hidden">
      {/* Hero */}
      <section className="relative px-4 py-16 text-center md:py-24">
        <div className="bg-gradient-mesh absolute inset-0 -z-10" />
        <SectionReveal>
          <h1 className="text-4xl font-black tracking-tighter md:text-5xl lg:text-6xl">{t('title')}</h1>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">{t('heroSubtitle')}</p>
        </SectionReveal>
      </section>

      {/* Plans */}
      <section className="px-4 pb-16 md:pb-24 -mt-4">
        <StaggerContainer className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-3" staggerDelay={0.15}>
          {plans.map(({ key, featureCount, cta, highlighted }) => (
            <StaggerItem key={key}>
              <Card
                className={cn(
                  'relative flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl',
                  highlighted
                    ? 'border-primary shadow-elevated ring-2 ring-primary'
                    : 'shadow-card hover:shadow-elevated'
                )}
              >
                {highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-accent text-accent-foreground shadow-sm">{t('popular')}</Badge>
                  </div>
                )}
                <CardHeader className="items-center text-center">
                  <CardTitle className="text-xl">{t(`${key}.name`)}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-black">{t(`${key}.price`)}</span>
                    {key !== 'free' && (
                      <span className="text-muted-foreground">{t('monthly')}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <ul className="flex-1 space-y-3">
                    {Array.from({ length: featureCount }, (_, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Check className="size-3 text-primary" />
                        </div>
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
                  {key === 'free' && (
                    <p className="mt-2 text-center text-xs text-muted-foreground">{t('trustLine')}</p>
                  )}
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* FAQ */}
      <section className="bg-gradient-section px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-2xl">
          <SectionReveal>
            <h2 className="mb-8 text-center text-3xl font-bold md:text-5xl">{t('faq.title')}</h2>
          </SectionReveal>
          <SectionReveal delay={0.15}>
            <Card className="glass border-none shadow-elevated">
              <CardContent className="pt-4">
                {faqKeys.map((key) => (
                  <FaqItem key={key} question={t(`faq.${key}`)} answer={t(`faq.a${key.slice(1)}`)} />
                ))}
              </CardContent>
            </Card>
          </SectionReveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative px-4 py-20 text-center md:py-28">
        <div className="bg-gradient-mesh absolute inset-0 -z-10" />
        <SectionReveal>
          <h2 className="text-3xl font-bold md:text-5xl">{t('ctaSection.title')}</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">{t('ctaSection.subtitle')}</p>
          <div className="mt-8">
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'bg-accent px-10 text-lg text-accent-foreground shadow-lg hover:bg-accent/90 hover:shadow-xl'
              )}
            >
              {t('ctaSection.cta')}
              <ArrowRight className="ml-2 size-5" />
            </Link>
          </div>
        </SectionReveal>
      </section>

      <FooterNav />
    </main>
  )
}
