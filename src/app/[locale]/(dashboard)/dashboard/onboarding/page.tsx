import { requireAuth } from '@/lib/auth/guard'
import { redirect } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'

export default async function OnboardingPage() {
  const user = await requireAuth()

  if (user.onboarding_completed) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <OnboardingWizard />
    </div>
  )
}
