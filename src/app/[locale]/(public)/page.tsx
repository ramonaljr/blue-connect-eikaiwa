'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  UserPlus, ClipboardCheck, Rocket, TrendingUp,
  Wallet, Clock, ShieldCheck, Star, ArrowRight, ArrowDown, Check,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  SectionReveal, StaggerContainer, StaggerItem, AnimatedCounter,
} from '@/components/ui/motion'
import { motion } from 'framer-motion'
import { ChatMockup } from '@/components/landing/chat-mockup'
import { FeatureTabs } from '@/components/landing/feature-tabs'
import { FooterNav } from '@/components/landing/footer-nav'

const steps = [
  { key: 'step1' as const, icon: UserPlus, step: 1 },
  { key: 'step2' as const, icon: ClipboardCheck, step: 2 },
  { key: 'step3' as const, icon: Rocket, step: 3 },
  { key: 'step4' as const, icon: TrendingUp, step: 4 },
]

const transformPairs = [
  { key: 'cost' as const, icon: Wallet },
  { key: 'schedule' as const, icon: Clock },
  { key: 'confidence' as const, icon: ShieldCheck },
]

const testimonials = ['1', '2', '3'] as const

export default function HomePage() {
  const t = useTranslations('landing')

  const accentColors = ['border-l-primary', 'border-l-accent', 'border-l-[oklch(0.65_0.18_155)]']

  return (
    <main className="flex flex-col overflow-x-hidden">
      {/* Hero — Split Layout */}
      <section className="relative px-4 py-20 md:py-32">
        <div className="bg-gradient-mesh absolute inset-0 -z-10" />
        <div className="container mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row">
          <div className="flex-1 text-center md:text-left">
            <SectionReveal>
              <h1 className="text-5xl font-black tracking-tighter md:text-6xl lg:text-7xl">
                {t('hero.title').split('AI').map((part, i, arr) =>
                  i < arr.length - 1 ? (
                    <span key={i}>
                      {part}
                      <span className="text-gradient-blue">AI</span>
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </h1>
            </SectionReveal>
            <SectionReveal delay={0.15}>
              <p className="mt-4 max-w-lg text-base text-muted-foreground md:text-lg leading-relaxed">
                {t('hero.subtitle')}
              </p>
            </SectionReveal>
            <SectionReveal delay={0.3}>
              <div className="mt-8 flex flex-col gap-3 justify-center sm:flex-row md:justify-start">
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'bg-accent px-8 text-accent-foreground hover:bg-accent/90'
                  )}
                >
                  {t('hero.cta')}
                  <ArrowRight className="ml-1 size-4" />
                </Link>
                <Link href="#features" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                  {t('hero.secondaryCta')}
                </Link>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{t('hero.socialProof')}</p>
            </SectionReveal>
          </div>
          <SectionReveal delay={0.2} direction="right" className="w-full max-w-lg flex-1">
            <ChatMockup />
          </SectionReveal>
        </div>
      </section>

      {/* Stats Bar — Glassmorphism Bridge */}
      <section className="relative z-10 -mt-8 px-4">
        <SectionReveal>
          <div className="container mx-auto max-w-3xl">
            <div className="glass flex flex-wrap items-center justify-center gap-8 rounded-2xl border border-white/30 px-8 py-6 shadow-elevated md:gap-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  <AnimatedCounter target={5000} suffix="+" />
                </div>
                <p className="text-sm text-muted-foreground">{t('stats.learnersLabel')}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  <AnimatedCounter target={50} suffix="+" />
                </div>
                <p className="text-sm text-muted-foreground">{t('stats.tutorsLabel')}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  <AnimatedCounter target={98} suffix="%" />
                </div>
                <p className="text-sm text-muted-foreground">{t('stats.satisfactionLabel')}</p>
              </div>
            </div>
          </div>
        </SectionReveal>
      </section>

      {/* Problem + Solution — Merged Before/After */}
      <section className="px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-5xl">
          <SectionReveal>
            <h2 className="mb-4 text-center text-3xl font-bold md:text-5xl">
              {t('transform.title')}
            </h2>
            <p className="mb-12 text-center text-lg text-muted-foreground">
              {t('problem.subtitle')}
            </p>
          </SectionReveal>
          <StaggerContainer className="grid gap-6 md:grid-cols-3" staggerDelay={0.15}>
            {transformPairs.map(({ key, icon: Icon }) => (
              <StaggerItem key={key}>
                <div className="flex flex-col items-center gap-3">
                  {/* Problem card */}
                  <Card className="w-full border-none bg-gradient-to-b from-destructive/8 to-destructive/3 shadow-card transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <CardHeader>
                      <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-destructive/10">
                        <Icon className="size-5 text-destructive" />
                      </div>
                      <CardTitle className="text-base">{t(`problem.${key}.title`)}</CardTitle>
                      <CardDescription>{t(`problem.${key}.description`)}</CardDescription>
                    </CardHeader>
                  </Card>

                  {/* Arrow connector */}
                  <ArrowDown className="size-5 text-primary/40" />

                  {/* Solution card */}
                  <Card className="w-full border-none bg-gradient-to-b from-primary/8 to-primary/3 shadow-card transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <CardHeader>
                      <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <Check className="size-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">{t(`solution.${key}.title`)}</CardTitle>
                      <CardDescription>{t(`solution.${key}.description`)}</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Features — Tabbed Preview */}
      <section id="features" className="bg-gradient-section px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-5xl">
          <FeatureTabs />
        </div>
      </section>

      {/* How It Works — Connected Stepper */}
      <section className="px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-5xl">
          <SectionReveal>
            <h2 className="mb-16 text-center text-3xl font-bold md:text-5xl">
              {t('howItWorks.title')}
            </h2>
          </SectionReveal>
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-1/2 top-8 hidden h-0.5 w-[60%] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />
            <StaggerContainer className="grid gap-8 md:grid-cols-4" staggerDelay={0.15}>
              {steps.map(({ key, icon: Icon, step }) => (
                <StaggerItem key={key}>
                  <div className="flex flex-col items-center text-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="relative z-10 mb-4 flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-lg"
                    >
                      {step}
                    </motion.div>
                    <Icon className="mb-2 size-5 text-muted-foreground" />
                    <h3 className="mb-1 text-lg font-semibold">{t(`howItWorks.${key}.title`)}</h3>
                    <p className="text-sm text-muted-foreground">{t(`howItWorks.${key}.description`)}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* Testimonials — Card Grid */}
      <section className="bg-gradient-section px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-5xl">
          <SectionReveal>
            <h2 className="text-center text-3xl font-bold md:text-5xl">
              {t('testimonials.title')}
            </h2>
            <p className="mt-3 mb-12 text-center text-lg text-muted-foreground">
              {t('testimonials.subtitle')}
            </p>
          </SectionReveal>
          <StaggerContainer className="grid gap-6 md:grid-cols-3" staggerDelay={0.12}>
            {testimonials.map((id, idx) => (
              <StaggerItem key={id}>
                <Card className={cn('glass border-l-[3px] shadow-elevated transition-all duration-300 hover:-translate-y-2 hover:shadow-xl', accentColors[idx])}>
                  <CardHeader>
                    <div className="mb-3 flex items-center gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="size-3.5 fill-accent text-accent" />
                      ))}
                    </div>
                    <CardDescription className="text-sm italic text-foreground/80">
                      &ldquo;{t(`testimonials.${id}.quote`)}&rdquo;
                    </CardDescription>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {t(`testimonials.${id}.name`).charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t(`testimonials.${id}.name`)}</p>
                        <p className="text-xs text-muted-foreground">{t(`testimonials.${id}.role`)}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative px-4 py-24 text-center md:py-32">
        <div className="bg-gradient-mesh absolute inset-0 -z-10" />
        <SectionReveal>
          <h2 className="text-3xl font-bold md:text-5xl lg:text-5xl">
            {t('finalCta.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            {t('finalCta.subtitle')}
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'bg-accent px-10 text-lg text-accent-foreground shadow-lg transition-all hover:bg-accent/90 hover:shadow-xl'
              )}
            >
              {t('finalCta.cta')}
              <ArrowRight className="ml-2 size-5" />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">{t('finalCta.trustLine')}</p>
          </div>
        </SectionReveal>
      </section>

      {/* Footer */}
      <FooterNav />
    </main>
  )
}
