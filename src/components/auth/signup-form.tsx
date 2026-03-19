'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signUp, signInWithGoogle } from '@/lib/actions/auth'
import Link from 'next/link'

export function SignupForm() {
  const t = useTranslations('auth')
  const tc = useTranslations('common')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
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

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{tc('success')}</CardTitle>
          <CardDescription>
            メールを確認してアカウントを有効化してください。
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('signupTitle')}</CardTitle>
        <CardDescription>{tc('appName')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">名前 / Full Name</Label>
            <Input id="fullName" name="fullName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input id="password" name="password" type="password" minLength={8} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {tc('signup')}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
          {t('continueWithGoogle')}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t('hasAccount')}{' '}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            {tc('login')}
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
