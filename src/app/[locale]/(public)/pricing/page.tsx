import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const plans = [
  {
    key: 'free' as const,
    featureCount: 3,
    cta: 'cta' as const,
    highlighted: false,
  },
  {
    key: 'pro' as const,
    featureCount: 5,
    cta: 'ctaPro' as const,
    highlighted: true,
  },
  {
    key: 'premium' as const,
    featureCount: 6,
    cta: 'ctaPremium' as const,
    highlighted: false,
  },
]

export default function PricingPage() {
  const t = useTranslations('pricing')

  return (
    <main className="flex flex-col items-center px-4 py-16 md:py-24">
      <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{t('subtitle')}</p>

      <div className="mt-12 grid w-full max-w-5xl gap-6 md:grid-cols-3">
        {plans.map(({ key, featureCount, cta, highlighted }) => (
          <Card
            key={key}
            className={cn(
              'relative flex flex-col',
              highlighted && 'border-primary ring-2 ring-primary'
            )}
          >
            {highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge>{t('recommended')}</Badge>
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
                    'w-full'
                  )}
                >
                  {t(cta)}
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
