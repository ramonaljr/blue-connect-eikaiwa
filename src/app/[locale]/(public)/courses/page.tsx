'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { BookOpen, Sparkles, TrendingUp, Clock, Award, ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SectionReveal, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { FooterNav } from '@/components/landing/footer-nav'

const levels = [
  { key: 'beginner' as const, color: 'bg-[oklch(0.65_0.18_155)]', textColor: 'text-[oklch(0.65_0.18_155)]' },
  { key: 'intermediate' as const, color: 'bg-primary', textColor: 'text-primary' },
  { key: 'advanced' as const, color: 'bg-accent', textColor: 'text-accent' },
]

const features = [
  { key: 'interactive' as const, icon: Sparkles },
  { key: 'progress' as const, icon: TrendingUp },
  { key: 'pace' as const, icon: Clock },
  { key: 'certificate' as const, icon: Award },
]

const categories = ['daily', 'business', 'toeic', 'eiken', 'travel', 'kids'] as const

export default function CoursesPage() {
  const t = useTranslations('coursesPage')

  return (
    <main className="flex flex-col overflow-x-hidden">
      {/* Hero */}
      <section className="relative px-4 py-20 text-center md:py-32">
        <div className="bg-gradient-mesh absolute inset-0 -z-10" />
        <SectionReveal>
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
            <BookOpen className="size-8 text-primary" />
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

      {/* Levels */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-5xl">
          <SectionReveal>
            <h2 className="mb-12 text-center text-3xl font-bold md:text-5xl">{t('levels.title')}</h2>
          </SectionReveal>
          <StaggerContainer className="grid gap-6 md:grid-cols-3" staggerDelay={0.12}>
            {levels.map(({ key, color, textColor }) => (
              <StaggerItem key={key}>
                <Card className="glass border-none shadow-elevated transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <CardHeader>
                    <Badge className={cn('w-fit text-white', color)}>{t(`levels.${key}.level`)}</Badge>
                    <CardTitle className={cn('mt-2 text-xl', textColor)}>{t(`levels.${key}.title`)}</CardTitle>
                    <CardDescription className="mt-1">{t(`levels.${key}.description`)}</CardDescription>
                  </CardHeader>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gradient-section px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-5xl">
          <StaggerContainer className="grid gap-6 md:grid-cols-2" staggerDelay={0.1}>
            {features.map(({ key, icon: Icon }) => (
              <StaggerItem key={key}>
                <Card className="border-none bg-background/70 shadow-card transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
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

      {/* Categories */}
      <section className="px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-4xl">
          <SectionReveal>
            <h2 className="mb-8 text-center text-3xl font-bold md:text-5xl">{t('categories.title')}</h2>
          </SectionReveal>
          <SectionReveal delay={0.15}>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <Badge key={cat} variant="outline" className="px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary">
                  {t(`categories.${cat}`)}
                </Badge>
              ))}
            </div>
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
