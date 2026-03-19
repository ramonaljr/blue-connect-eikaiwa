'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  BookOpen, UserPlus, ClipboardCheck, Rocket, TrendingUp,
  Wallet, Clock, ShieldCheck, Sparkles, Video, Star, ArrowRight, Quote,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  SectionReveal, StaggerContainer, StaggerItem, AnimatedCounter, FloatingElement,
} from '@/components/ui/motion'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const steps = [
  { key: 'step1' as const, icon: UserPlus, step: 1 },
  { key: 'step2' as const, icon: ClipboardCheck, step: 2 },
  { key: 'step3' as const, icon: Rocket, step: 3 },
  { key: 'step4' as const, icon: TrendingUp, step: 4 },
]

const painPoints = [
  { key: 'cost' as const, icon: Wallet },
  { key: 'schedule' as const, icon: Clock },
  { key: 'confidence' as const, icon: ShieldCheck },
]

const solutions = [
  { key: 'cost' as const, icon: Wallet },
  { key: 'schedule' as const, icon: Clock },
  { key: 'confidence' as const, icon: ShieldCheck },
]

const featureBlocks = [
  { key: 'ai' as const, icon: Sparkles, direction: 'left' as const },
  { key: 'courses' as const, icon: BookOpen, direction: 'right' as const },
  { key: 'tutors' as const, icon: Video, direction: 'left' as const },
]

const testimonials = ['1', '2', '3'] as const

export default function HomePage() {
  const t = useTranslations('landing')
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <main className="flex flex-col overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center gap-8 px-4 py-24 text-center md:py-36">
        <div className="bg-gradient-hero absolute inset-0 -z-10" />

        {/* Floating decorative shapes */}
        <FloatingElement className="absolute left-[10%] top-[20%] -z-10 hidden md:block" duration={8}>
          <div className="size-20 rounded-full bg-primary/5" />
        </FloatingElement>
        <FloatingElement className="absolute right-[15%] top-[30%] -z-10 hidden md:block" duration={10} distance={30}>
          <div className="size-14 rounded-full bg-accent/10" />
        </FloatingElement>

        <SectionReveal>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-5xl lg:text-7xl">
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
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            {t('hero.subtitle')}
          </p>
        </SectionReveal>

        <SectionReveal delay={0.3}>
          <div className="flex flex-col gap-3 sm:flex-row">
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
            <Link href="/pricing" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              {t('footer.cta')}
            </Link>
          </div>
        </SectionReveal>

        {/* Stats counters */}
        <SectionReveal delay={0.45}>
          <div className="mt-8 flex flex-wrap justify-center gap-8 md:gap-16">
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
        </SectionReveal>
      </section>

      {/* Problem Statement */}
      <section className="bg-gradient-section px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-5xl">
          <SectionReveal>
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold md:text-4xl">{t('problem.title')}</h2>
              <p className="mt-3 text-lg text-muted-foreground">{t('problem.subtitle')}</p>
            </div>
          </SectionReveal>
          <StaggerContainer className="grid gap-6 md:grid-cols-3">
            {painPoints.map(({ key, icon: Icon }) => (
              <StaggerItem key={key}>
                <Card className="border-none bg-background/70 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                  <CardHeader>
                    <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-destructive/10">
                      <Icon className="size-6 text-destructive" />
                    </div>
                    <CardTitle>{t(`problem.${key}.title`)}</CardTitle>
                    <CardDescription>{t(`problem.${key}.description`)}</CardDescription>
                  </CardHeader>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Solution */}
      <section className="px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-5xl">
          <SectionReveal>
            <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
              {t('solution.title')}
            </h2>
          </SectionReveal>
          <StaggerContainer className="grid gap-6 md:grid-cols-3">
            {solutions.map(({ key, icon: Icon }) => (
              <StaggerItem key={key}>
                <Card className="border-none shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                  <CardHeader>
                    <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <CardTitle>{t(`solution.${key}.title`)}</CardTitle>
                    <CardDescription>{t(`solution.${key}.description`)}</CardDescription>
                  </CardHeader>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="bg-gradient-section px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-6xl space-y-20 md:space-y-28">
          {featureBlocks.map(({ key, icon: Icon, direction }, i) => (
            <SectionReveal key={key} direction={direction}>
              <div
                className={cn(
                  'flex flex-col items-center gap-8 md:flex-row md:gap-12',
                  i % 2 === 1 && 'md:flex-row-reverse'
                )}
              >
                <div className="flex-1">
                  <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Icon className="size-7 text-primary" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold md:text-3xl">
                    {t(`features.${key}.title`)}
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    {t(`features.${key}.description`)}
                  </p>
                </div>
                <div className="flex-1">
                  <div className="aspect-video rounded-2xl bg-muted/50 ring-1 ring-border" />
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-5xl">
          <SectionReveal>
            <h2 className="mb-16 text-center text-3xl font-bold md:text-4xl">
              {t('howItWorks.title')}
            </h2>
          </SectionReveal>
          <StaggerContainer className="grid gap-8 md:grid-cols-4" staggerDelay={0.15}>
            {steps.map(({ key, icon: Icon, step }) => (
              <StaggerItem key={key}>
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-lg"
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
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-section px-4 py-20 md:py-28">
        <div className="container mx-auto max-w-4xl">
          <SectionReveal>
            <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
              {t('testimonials.title')}
            </h2>
          </SectionReveal>
          <div className="relative">
            <div className="overflow-hidden">
              {testimonials.map((id, i) => (
                <motion.div
                  key={id}
                  initial={false}
                  animate={{
                    opacity: activeTestimonial === i ? 1 : 0,
                    scale: activeTestimonial === i ? 1 : 0.95,
                  }}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    'flex flex-col items-center text-center',
                    activeTestimonial !== i && 'pointer-events-none absolute inset-0'
                  )}
                >
                  <Quote className="mb-4 size-10 text-primary/20" />
                  <blockquote className="mb-6 max-w-2xl text-lg italic text-foreground md:text-xl">
                    &ldquo;{t(`testimonials.${id}.quote`)}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="size-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="mt-2 font-semibold">{t(`testimonials.${id}.name`)}</p>
                  <p className="text-sm text-muted-foreground">{t(`testimonials.${id}.role`)}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 flex justify-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={cn(
                    'size-2.5 rounded-full transition-all duration-300',
                    activeTestimonial === i ? 'w-8 bg-primary' : 'bg-primary/30'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative px-4 py-24 text-center md:py-32">
        <div className="bg-gradient-hero absolute inset-0 -z-10" />
        <SectionReveal>
          <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">
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
          </div>
        </SectionReveal>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        {t('footer.copyright')}
      </footer>
    </main>
  )
}
