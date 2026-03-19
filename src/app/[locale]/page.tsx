import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('landing')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">{t('hero.title')}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{t('hero.subtitle')}</p>
    </main>
  )
}
