import { createClient } from '@supabase/supabase-js'

// Service-role client for trusted server-side writes that must bypass RLS
// (XP/achievement/streak mutations, Stripe customer linkage, payouts). These
// tables intentionally have NO permissive write policy for the authenticated
// role, so users cannot forge rows directly via the API — privileged writes
// go through this client instead. Never expose this to the browser.
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
