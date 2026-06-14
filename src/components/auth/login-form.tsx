'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signIn, signInWithGoogle } from '@/lib/actions/auth'
import Link from 'next/link'

export function LoginForm() {
  const t = useTranslations('auth')
  const tc = useTranslations('common')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await signIn(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    const result = await signInWithGoogle()
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-none shadow-none lg:shadow-elevated lg:border lg:border-border">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10">
          <span className="text-xl font-black text-primary">B</span>
        </div>
        <CardTitle className="text-2xl font-bold">{t('loginTitle')}</CardTitle>
        <CardDescription>{tc('appName')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required className="h-10" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t('password')}</Label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                {t('forgotPassword')}
              </Link>
            </div>
            <Input id="password" name="password" type="password" required className="h-10" />
          </div>
          <Button type="submit" className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
            {tc('login')}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">{tc('or')}</span>
          </div>
        </div>

        <div className="grid gap-2">
          <Button variant="outline" className="w-full h-10" onClick={handleGoogleSignIn} disabled={loading}>
            <svg className="mr-2 size-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            {t('continueWithGoogle')}
          </Button>
          <Button variant="outline" className="w-full h-10 bg-[#06C755] text-white hover:bg-[#06C755]/90 border-[#06C755]" disabled={loading}>
            <svg className="mr-2 size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 5.82 2 10.5c0 2.93 1.95 5.5 4.86 6.96-.17.63-.62 2.28-.71 2.64-.12.45.16.44.34.32.14-.1 2.19-1.47 3.1-2.08.78.12 1.58.18 2.41.18 5.52 0 10-3.82 10-8.52S17.52 2 12 2z"/></svg>
            {t('continueWithLine')}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {t('noAccount')}{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            {tc('signup')}
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
