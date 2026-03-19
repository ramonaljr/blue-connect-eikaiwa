import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import '@/app/globals.css'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI英会話・オンライン英語学習 | Blue Connect Eikaiwa',
  description: 'AIパートナーとリアル講師で英語力アップ。24時間練習OK、月額¥2,980から。小学生からビジネスまで。無料で始めよう。',
  openGraph: {
    title: 'AI英会話・オンライン英語学習 | Blue Connect Eikaiwa',
    description: 'AIパートナーとリアル講師で英語力アップ。24時間練習OK、月額¥2,980から。',
    type: 'website',
    siteName: 'Blue Connect Eikaiwa',
  },
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} className={notoSansJP.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const theme = localStorage.getItem('theme');
            if (theme === 'dark') document.documentElement.classList.add('dark');
          } catch(e) {}
        ` }} />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
