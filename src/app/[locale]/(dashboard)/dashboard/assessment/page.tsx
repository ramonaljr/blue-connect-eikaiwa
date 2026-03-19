import { requireAuth } from '@/lib/auth/guard'
import { AssessmentPageContent } from '@/components/progress/assessment-page-content'

export default async function AssessmentPage() {
  const user = await requireAuth()
  return <AssessmentPageContent currentLevel={user.english_level} userId={user.id} />
}
