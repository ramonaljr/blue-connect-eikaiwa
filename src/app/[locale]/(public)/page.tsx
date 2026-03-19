import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { MessageSquare, BookOpen, Users, UserPlus, ClipboardCheck, Rocket, TrendingUp } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const features = [
  { key: 'ai' as const, icon: MessageSquare },
  { key: 'courses' as const, icon: BookOpen },
  { key: 'tutors' as const, icon: Users },
]

const steps = [
  { key: 'step1' as const, icon: UserPlus, step: 1 },
  { key: 'step2' as const, icon: ClipboardCheck, step: 2 },
  { key: 'step3' as const, icon: Rocket, step: 3 },
  { key: 'step4' as const, icon: TrendingUp, step: 4 },
]

export default function HomePage() {
  const t = useTranslations('landing')
  const tc = useTranslations('common')

  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center gap-6 px-4 py-24 text-center md:py-32">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          {t('hero.title')}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
          {t('hero.subtitle')}
        </p>
        <div className="flex gap-4">
          <Link href="/signup" className={buttonVariants({ size: 'lg' })}>
            {t('hero.cta')}
          </Link>
          <Link href="/pricing" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
            {tc('appName')}
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map(({ key, icon: Icon }) => (
            <Card key={key}>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-6 text-primary" />
                </div>
                <CardTitle>{t(`features.${key}.title`)}</CardTitle>
                <CardDescription>{t(`features.${key}.description`)}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/50 px-4 py-16">
        <div className="container mx-auto">
          <h2 className="mb-12 text-center text-3xl font-bold">
            {t('howItWorks.title')}
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            {steps.map(({ key, icon: Icon, step }) => (
              <div key={key} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {step}
                </div>
                <Icon className="mb-2 size-6 text-muted-foreground" />
                <h3 className="mb-1 text-lg font-semibold">{t(`howItWorks.${key}.title`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`howItWorks.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="flex flex-col items-center justify-center gap-6 px-4 py-24 text-center">
        <h2 className="text-3xl font-bold">{t('footer.cta')}</h2>
        <p className="text-lg text-muted-foreground">{t('footer.ctaDescription')}</p>
        <Link href="/signup" className={buttonVariants({ size: 'lg' })}>
          {t('hero.cta')}
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        {t('footer.copyright')}
      </footer>
    </main>
  )
}
