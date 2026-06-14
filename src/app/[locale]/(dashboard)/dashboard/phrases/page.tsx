import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { PhrasesPageContent } from '@/components/phrases/phrases-page-content'

export default async function PhrasesPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: phrases } = await supabase
    .from('saved_phrases')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <PhrasesPageContent phrases={phrases ?? []} />
}
