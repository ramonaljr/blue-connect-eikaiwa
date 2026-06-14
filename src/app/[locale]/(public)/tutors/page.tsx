'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Award, Calendar, Video, MessageCircle, ArrowRight, Users } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { SectionReveal, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { FooterNav } from '@/components/landing/footer-nav'

const features = [
  { key: 'certified' as const, icon: Award },
  { key: 'flexible' as const, icon: Calendar },
  { key: 'video' as const, icon: Video },
  { key: 'feedback' as const, icon: MessageCircle },
]

const steps = ['step1', 'step2', 'step3', 'step4'] as const

export default function TutorsPage() {
  const t = useTranslations('tutorsPage')

  return (
    <main className="flex flex-col overflow-x-hidden">
      {/* Hero */}
      <section className="relative px-4 py-20 text-center md:py-32">
        <div className="bg-gradient-mesh absolute inset-0 -z-10" />
        <SectionReveal>
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
            <Users className="size-8 text-primary" />
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-black tracking-tighter md:text-5xl lg:text-6xl">
            {t('title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg leading-relaxed">
            {t('subtitle')}
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'bg-accent px-8 text-accent-foreground hover:bg-accent/90'
              )}
            >
              {t('cta')}
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </div>
        </SectionReveal>
      </section>

      {/* Features */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-5xl">
          <StaggerContainer className="grid gap-6 md:grid-cols-2" staggerDelay={0.1}>
            {features.map(({ key, icon: Icon }) => (
              <StaggerItem key={key}>
                <Card className="glass border-none shadow-elevated transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <CardHeader>
                    <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{t(`features.${key}.title`)}</CardTitle>
                    <CardDescription>{t(`features.${key}.description`)}</CardDescription>
                  </CardHeader>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-section px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-4xl">
          <SectionReveal>
            <h2 className="mb-12 text-center text-3xl font-bold md:text-5xl">{t('howItWorks.title')}</h2>
          </SectionReveal>
          <StaggerContainer className="space-y-4" staggerDelay={0.12}>
            {steps.map((step, i) => (
              <StaggerItem key={step}>
                <div className="flex items-start gap-4 rounded-xl bg-background/70 p-4 shadow-card">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </div>
                  <p className="pt-2 text-sm md:text-base">{t(`howItWorks.${step}`)}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-4xl">
          <SectionReveal>
            <h2 className="mb-12 text-center text-3xl font-bold md:text-5xl">{t('pricing.title')}</h2>
          </SectionReveal>
          <StaggerContainer className="grid gap-6 md:grid-cols-2" staggerDelay={0.15}>
            <StaggerItem>
              <Card className="glass border-none shadow-elevated">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{t('pricing.community')}</CardTitle>
                  <p className="mt-2 text-3xl font-bold text-primary">{t('pricing.communityPrice')}</p>
                  <CardDescription className="mt-2">{t('pricing.communityDesc')}</CardDescription>
                </CardHeader>
              </Card>
            </StaggerItem>
            <StaggerItem>
              <Card className="glass border-none shadow-elevated ring-2 ring-primary">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{t('pricing.certified')}</CardTitle>
                  <p className="mt-2 text-3xl font-bold text-primary">{t('pricing.certifiedPrice')}</p>
                  <CardDescription className="mt-2">{t('pricing.certifiedDesc')}</CardDescription>
                </CardHeader>
              </Card>
            </StaggerItem>
          </StaggerContainer>
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
