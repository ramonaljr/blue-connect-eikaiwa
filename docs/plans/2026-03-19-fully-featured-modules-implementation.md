# Fully Featured Learner Dashboard Modules — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement all 8 learner dashboard modules to full production depth, delivered in 5 feature slices.

**Architecture:** Vertical feature slices building on existing Next.js 15 App Router codebase with Supabase backend. Each slice adds DB migrations, TypeScript types, server actions, API routes, and React components. The voice server (Railway WebSocket) is extended in Slice 2.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Supabase (PostgreSQL + Auth + Realtime + Storage), Stripe, Claude API, Deepgram, ElevenLabs, Azure Speech, Daily.co, Upstash Redis, next-intl, Vitest, framer-motion

---

## Phase 1: Foundation — Settings + Dashboard

### Task 1.1: Database Migration for Slice 1

**Files:**
- Create: `supabase/migrations/00003_slice1_foundation.sql`
- Modify: `src/lib/types/database.ts`

**Step 1: Write the migration**

```sql
-- supabase/migrations/00003_slice1_foundation.sql

-- New columns on users table for settings
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS daily_goal_minutes smallint NOT NULL DEFAULT 15;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_topics jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ai_personality text NOT NULL DEFAULT 'friendly';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ai_correction_level text NOT NULL DEFAULT 'moderate';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'Asia/Tokyo';

-- Daily tips table
CREATE TABLE IF NOT EXISTS public.daily_tips (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  tip_text text NOT NULL,
  generated_for date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, generated_for)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_tips_user ON public.daily_tips(user_id, generated_for);

-- RLS for daily_tips
ALTER TABLE public.daily_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tips" ON public.daily_tips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert tips" ON public.daily_tips
  FOR INSERT WITH CHECK (true);
```

**Step 2: Update TypeScript types**

Add to `src/lib/types/database.ts`:
```typescript
// Add to User interface:
daily_goal_minutes: number
preferred_topics: string[]
ai_personality: 'friendly' | 'strict' | 'balanced'
ai_correction_level: 'gentle' | 'moderate' | 'thorough'
timezone: string

// New interface:
export interface DailyTip {
  id: string
  user_id: string
  tip_text: string
  generated_for: string
  created_at: string
}
```

**Step 3: Commit**

```bash
git add supabase/migrations/00003_slice1_foundation.sql src/lib/types/database.ts
git commit -m "feat(slice1): add foundation DB migration and types"
```

---

### Task 1.2: Settings Server Actions

**Files:**
- Create: `src/lib/actions/settings.ts`

**Step 1: Write tests for settings actions**

Create `src/__tests__/actions/settings.test.ts` with unit tests for:
- `updateProfile` — validates and updates display_name, full_name, english_level, timezone
- `updateLearningPreferences` — updates daily_goal_minutes, preferred_topics, ai_personality, ai_correction_level
- `deleteAccount` — sets soft-delete flag
- `exportUserData` — returns JSON of all user data

**Step 2: Implement settings actions**

```typescript
// src/lib/actions/settings.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CEFRLevel } from '@/lib/types/database'

export async function updateProfile(data: {
  display_name: string
  full_name: string
  english_level: CEFRLevel
  timezone: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('users')
    .update({
      display_name: data.display_name,
      full_name: data.full_name,
      english_level: data.english_level,
      timezone: data.timezone,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function updateAvatar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const file = formData.get('avatar') as File
  if (!file) return { error: 'No file provided' }

  const ext = file.name.split('.').pop()
  const path = `avatars/${user.id}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(path)

  await supabase
    .from('users')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  revalidatePath('/dashboard/settings')
  return { success: true, url: publicUrl }
}

export async function updateLearningPreferences(data: {
  daily_goal_minutes: number
  preferred_topics: string[]
  ai_personality: 'friendly' | 'strict' | 'balanced'
  ai_correction_level: 'gentle' | 'moderate' | 'thorough'
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('users')
    .update(data)
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function updatePassword(data: {
  currentPassword: string
  newPassword: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: data.newPassword,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function getConnectedProviders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { providers: [] }

  const identities = user.identities ?? []
  return {
    providers: identities.map((i) => ({
      provider: i.provider,
      created_at: i.created_at,
    })),
  }
}

export async function exportUserData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const [
    { data: profile },
    { data: conversations },
    { data: progress },
    { data: lessons },
    { data: notifications },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('ai_conversations').select('*').eq('user_id', user.id),
    supabase.from('learner_progress').select('*').eq('user_id', user.id),
    supabase.from('lessons').select('*').eq('learner_id', user.id),
    supabase.from('notifications').select('*').eq('user_id', user.id),
  ])

  return {
    profile,
    conversations,
    progress,
    lessons,
    notifications,
    exported_at: new Date().toISOString(),
  }
}

export async function requestAccountDeletion() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Create a notification for admin to process deletion
  await supabase.from('notifications').insert({
    user_id: user.id,
    type: 'system',
    title: 'アカウント削除リクエスト',
    body: '30日後にアカウントが削除されます。キャンセルするには設定ページをご確認ください。',
  })

  return { success: true }
}
```

**Step 3: Run tests**

Run: `pnpm test src/__tests__/actions/settings.test.ts`

**Step 4: Commit**

```bash
git add src/lib/actions/settings.ts src/__tests__/actions/settings.test.ts
git commit -m "feat(slice1): add settings server actions"
```

---

### Task 1.3: Settings Page — Profile Section

**Files:**
- Create: `src/app/[locale]/(dashboard)/dashboard/settings/page.tsx`
- Create: `src/components/settings/profile-form.tsx`
- Create: `src/components/settings/avatar-upload.tsx`

**Step 1: Create the settings page (server component)**

The page uses `requireAuth()` to get the user, then renders tab sections. Use shadcn `Tabs` component with tabs: Profile, Learning, Subscription, Connected Accounts, Account.

```typescript
// src/app/[locale]/(dashboard)/dashboard/settings/page.tsx
import { requireAuth } from '@/lib/auth/guard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileForm } from '@/components/settings/profile-form'
import { LearningPreferencesForm } from '@/components/settings/learning-preferences-form'
import { SubscriptionSection } from '@/components/settings/subscription-section'
import { ConnectedAccountsSection } from '@/components/settings/connected-accounts-section'
import { AccountManagementSection } from '@/components/settings/account-management-section'

export default async function SettingsPage() {
  const user = await requireAuth()
  // ... render tabs with each section as a TabsContent
}
```

**Step 2: Create ProfileForm client component**

`src/components/settings/profile-form.tsx` — Form with fields: display_name, full_name, english_level (Select), timezone (Select with common timezones). Uses `updateProfile` server action on submit. Shows toast on success/error via `sonner`.

**Step 3: Create AvatarUpload client component**

`src/components/settings/avatar-upload.tsx` — Current avatar display, click to select file, preview, crop (use simple CSS object-fit for MVP, skip complex crop library), upload via `updateAvatar` server action.

**Step 4: Run dev server and verify**

Run: `pnpm dev` and navigate to `/dashboard/settings`

**Step 5: Commit**

```bash
git add src/app/[locale]/(dashboard)/dashboard/settings/ src/components/settings/
git commit -m "feat(slice1): add settings page with profile form and avatar upload"
```

---

### Task 1.4: Settings Page — Learning Preferences

**Files:**
- Create: `src/components/settings/learning-preferences-form.tsx`

**Step 1: Build the form**

Fields:
- `daily_goal_minutes`: Select with options 10, 15, 30, 60
- `preferred_topics`: Checkbox group (travel, business, casual, academic, exam_prep, technology, culture)
- `ai_personality`: Radio group (friendly, strict, balanced) with Japanese descriptions
- `ai_correction_level`: Radio group (gentle, moderate, thorough) with Japanese descriptions

Calls `updateLearningPreferences` server action.

**Step 2: Commit**

```bash
git add src/components/settings/learning-preferences-form.tsx
git commit -m "feat(slice1): add learning preferences form"
```

---

### Task 1.5: Settings Page — Subscription & Billing

**Files:**
- Create: `src/components/settings/subscription-section.tsx`
- Create: `src/lib/actions/stripe.ts`

**Step 1: Create Stripe server actions**

```typescript
// src/lib/actions/stripe.ts
'use server'

import { getStripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import { STRIPE_PLANS, CREDIT_PRODUCTS } from '@/lib/stripe/config'
import { headers } from 'next/headers'

export async function createCheckoutSession(tier: 'pro' | 'premium') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  const stripe = getStripe()
  const origin = (await headers()).get('origin')
  const plan = STRIPE_PLANS[tier]

  const session = await stripe.checkout.sessions.create({
    customer: profile?.stripe_customer_id ?? undefined,
    mode: 'subscription',
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${origin}/dashboard/settings?success=true`,
    cancel_url: `${origin}/dashboard/settings`,
    metadata: {
      supabase_user_id: user.id,
      tier,
    },
  })

  return { url: session.url }
}

export async function createCustomerPortalSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) return { error: 'No Stripe customer' }

  const stripe = getStripe()
  const origin = (await headers()).get('origin')

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${origin}/dashboard/settings`,
  })

  return { url: session.url }
}

export async function purchaseCredits(productKey: keyof typeof CREDIT_PRODUCTS) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const product = CREDIT_PRODUCTS[productKey]
  const stripe = getStripe()
  const origin = (await headers()).get('origin')

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: product.priceId, quantity: 1 }],
    success_url: `${origin}/dashboard/settings?credits=purchased`,
    cancel_url: `${origin}/dashboard/settings`,
    metadata: {
      supabase_user_id: user.id,
      credit_type: product.type,
      credit_amount: product.credits.toString(),
    },
  })

  return { url: session.url }
}

export async function getBillingHistory() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { invoices: [] }

  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) return { invoices: [] }

  const stripe = getStripe()
  const invoices = await stripe.invoices.list({
    customer: profile.stripe_customer_id,
    limit: 20,
  })

  return {
    invoices: invoices.data.map((inv) => ({
      id: inv.id,
      amount: inv.amount_paid,
      currency: inv.currency,
      status: inv.status,
      created: inv.created,
      pdf_url: inv.invoice_pdf,
    })),
  }
}
```

**Step 2: Build SubscriptionSection component**

Shows current plan, usage meters (fetch from Redis for AI limits, query credits table for lesson credits), upgrade/downgrade buttons, billing history table, "Manage Payment" button that opens Stripe Customer Portal.

**Step 3: Commit**

```bash
git add src/components/settings/subscription-section.tsx src/lib/actions/stripe.ts
git commit -m "feat(slice1): add subscription and billing settings"
```

---

### Task 1.6: Settings Page — Connected Accounts & Account Management

**Files:**
- Create: `src/components/settings/connected-accounts-section.tsx`
- Create: `src/components/settings/account-management-section.tsx`

**Step 1: Connected Accounts**

Shows list of connected OAuth providers (Google, LINE) with connect/disconnect buttons. Uses `getConnectedProviders` from settings actions. Connect buttons use `supabase.auth.linkIdentity()`, disconnect uses `supabase.auth.unlinkIdentity()`.

**Step 2: Account Management**

- Data Export button → calls `exportUserData`, triggers JSON file download
- Account Deletion section with red warning card, confirmation dialog (type "DELETE" to confirm), calls `requestAccountDeletion`

**Step 3: Commit**

```bash
git add src/components/settings/connected-accounts-section.tsx src/components/settings/account-management-section.tsx
git commit -m "feat(slice1): add connected accounts and account management settings"
```

---

### Task 1.7: Settings i18n Strings

**Files:**
- Modify: `src/messages/ja.json`
- Modify: `src/messages/en.json`

**Step 1: Add settings strings to both locale files**

Add `"settings"` key with all labels for: profile form fields, learning preferences, subscription, connected accounts, account management, button labels, confirmation messages.

**Step 2: Commit**

```bash
git add src/messages/ja.json src/messages/en.json
git commit -m "feat(slice1): add i18n strings for settings module"
```

---

### Task 1.8: Daily Tip API Route

**Files:**
- Create: `src/app/api/ai/tip/route.ts`

**Step 1: Build the daily tip generator**

```typescript
// src/app/api/ai/tip/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

let _anthropic: Anthropic | null = null
function getAnthropic(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic()
  return _anthropic
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: user } = await supabase
    .from('users')
    .select('id, english_level, preferred_topics, streak_days')
    .eq('id', authUser.id)
    .single()

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const today = new Date().toISOString().split('T')[0]

  // Check cache first
  const { data: existing } = await supabase
    .from('daily_tips')
    .select('tip_text')
    .eq('user_id', user.id)
    .eq('generated_for', today)
    .single()

  if (existing) {
    return NextResponse.json({ tip: existing.tip_text })
  }

  // Generate new tip
  const anthropic = getAnthropic()
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    system: 'You are an English learning advisor for Japanese learners. Generate a single concise study tip in Japanese (2-3 sentences max). Be encouraging and specific.',
    messages: [{
      role: 'user',
      content: `Generate a daily English study tip for a ${user.english_level} level learner. Topics they like: ${(user.preferred_topics as string[]).join(', ') || 'general'}. Current streak: ${user.streak_days} days.`,
    }],
  })

  const tipText = response.content
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('')

  await supabase.from('daily_tips').insert({
    user_id: user.id,
    tip_text: tipText,
    generated_for: today,
  })

  return NextResponse.json({ tip: tipText })
}
```

**Step 2: Commit**

```bash
git add src/app/api/ai/tip/route.ts
git commit -m "feat(slice1): add daily tip generation API route"
```

---

### Task 1.9: Dashboard Page — Personalized Hub

**Files:**
- Modify: `src/app/[locale]/(dashboard)/dashboard/page.tsx` (full rewrite)
- Create: `src/components/dashboard/daily-progress.tsx`
- Create: `src/components/dashboard/quick-actions.tsx`
- Create: `src/components/dashboard/continue-learning.tsx`
- Create: `src/components/dashboard/upcoming-lesson-card.tsx`
- Create: `src/components/dashboard/weak-areas.tsx`
- Create: `src/components/dashboard/recent-notifications.tsx`
- Create: `src/components/dashboard/new-content-carousel.tsx`
- Create: `src/components/dashboard/daily-tip.tsx`

**Step 1: Build the main dashboard page**

Server component that fetches all dashboard data in parallel:
- User profile (from `requireAuth`)
- Today's study time (from `ai_conversations` + `exercise_attempts` created today)
- Next upcoming lesson (from `lessons` where status=scheduled, ordered by scheduled_at)
- Last active course/conversation (most recent `learner_progress` or `ai_conversations`)
- Unread notifications (last 5 from `notifications` where is_read=false)
- New courses (last 3 published courses)
- Skill profile (from `skill_profiles` if exists — may not exist until Slice 3)

**Step 2: Build DailyProgress component**

Client component showing:
- Goal ring using SVG circle with `stroke-dashoffset` for progress animation
- Streak counter with flame icon (use framer-motion for animation when streak > 0)
- XP display with level calculation (Level = floor(XP / 1000) + 1)

**Step 3: Build QuickActions component**

4 action cards in a row with icons, linking to AI Chat, AI Voice, Continue Course, Book Lesson.

**Step 4: Build ContinueLearning component**

Shows the most recent in-progress item (course unit or AI conversation) with a preview and "Continue" link.

**Step 5: Build UpcomingLessonCard component**

Card with tutor avatar, name, countdown timer (client-side with `useEffect` interval), and Join button that enables 5 min before start.

**Step 6: Build WeakAreas component**

Reads skill_profiles data (if available) and generates recommendation strings. Falls back to generic suggestions if no data.

**Step 7: Build RecentNotifications component**

List of 5 notification items with icon, title, time ago, and action link. "View all" link at bottom.

**Step 8: Build DailyTip component**

Client component that fetches `/api/ai/tip` on mount, displays tip text with a lightbulb icon. Shows skeleton while loading.

**Step 9: Build NewContentCarousel component**

Horizontal scrollable row of course cards and tutor cards for newly added content.

**Step 10: Run dev server and verify the full dashboard**

Run: `pnpm dev` → navigate to `/dashboard`

**Step 11: Commit**

```bash
git add src/app/[locale]/(dashboard)/dashboard/page.tsx src/components/dashboard/
git commit -m "feat(slice1): rebuild dashboard as personalized hub with all widgets"
```

---

### Task 1.10: Dashboard i18n Strings

**Files:**
- Modify: `src/messages/ja.json`
- Modify: `src/messages/en.json`

**Step 1: Add/update dashboard strings**

The existing `dashboard` key in ja.json already has some strings. Extend it with: daily tip section, weak areas labels, continue learning labels, new content section headers.

**Step 2: Commit**

```bash
git add src/messages/ja.json src/messages/en.json
git commit -m "feat(slice1): add i18n strings for enhanced dashboard"
```

---

## Phase 2: AI Learning — AI Chat + AI Voice + Voice Server

### Task 2.1: Database Migration for Slice 2

**Files:**
- Create: `supabase/migrations/00004_slice2_ai_learning.sql`
- Modify: `src/lib/types/database.ts`

**Step 1: Write the migration**

```sql
-- supabase/migrations/00004_slice2_ai_learning.sql

-- Saved phrases table
CREATE TABLE IF NOT EXISTS public.saved_phrases (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  phrase text NOT NULL,
  translation text NOT NULL DEFAULT '',
  context text NOT NULL DEFAULT '',
  source_conversation_id uuid REFERENCES public.ai_conversations(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Pronunciation scores table
CREATE TABLE IF NOT EXISTS public.pronunciation_scores (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  conversation_id uuid REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  utterance_text text NOT NULL,
  overall_score numeric(5,2) NOT NULL,
  phoneme_scores jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add columns to ai_conversations
ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS scenario_key text;
ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS recording_url text;
ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS summary jsonb;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_phrases_user ON public.saved_phrases(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pronunciation_scores_user ON public.pronunciation_scores(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pronunciation_scores_conv ON public.pronunciation_scores(conversation_id);

-- RLS
ALTER TABLE public.saved_phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pronunciation_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own phrases" ON public.saved_phrases
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read own pronunciation scores" ON public.pronunciation_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert pronunciation scores" ON public.pronunciation_scores
  FOR INSERT WITH CHECK (true);
```

**Step 2: Update types in `src/lib/types/database.ts`**

Add `SavedPhrase`, `PronunciationScore` interfaces. Add new fields to `AIConversation`.

**Step 3: Commit**

```bash
git add supabase/migrations/00004_slice2_ai_learning.sql src/lib/types/database.ts
git commit -m "feat(slice2): add AI learning DB migration and types"
```

---

### Task 2.2: Enhanced System Prompts with Correction Format

**Files:**
- Modify: `src/lib/ai/system-prompts.ts`

**Step 1: Update `buildTutorSystemPrompt` to accept personality and correction level**

Add parameters: `personality`, `correctionLevel`. Update the prompt to:
- Adjust tone based on personality (friendly = encouraging, strict = formal corrections, balanced = mix)
- Add correction format instructions: when the user makes an error, include a JSON correction block in the response like `[CORRECTION]{"original":"...","corrected":"...","explanation":"...","explanation_ja":"...","type":"grammar"}[/CORRECTION]`
- Add 4 new scenarios: Shopping, Hotel Check-in, Phone Call, Custom

**Step 2: Commit**

```bash
git add src/lib/ai/system-prompts.ts
git commit -m "feat(slice2): enhance system prompts with personality, corrections, new scenarios"
```

---

### Task 2.3: AI Chat — Scenario Picker

**Files:**
- Create: `src/components/ai/scenario-picker.tsx`

**Step 1: Build the scenario picker component**

Grid of cards, each with: icon (lucide), bilingual title, CEFR difficulty badge, click handler that sets the active scenario. Include "Free Conversation" card and "Custom Topic" card with text input.

Uses the `ROLEPLAY_SCENARIOS` from system-prompts.ts plus new scenarios.

**Step 2: Commit**

```bash
git add src/components/ai/scenario-picker.tsx
git commit -m "feat(slice2): add AI chat scenario picker component"
```

---

### Task 2.4: AI Chat — Enhanced Chat Interface

**Files:**
- Modify: `src/hooks/use-ai-chat.ts` — Add correction parsing, conversation history support
- Modify: `src/components/ai/chat-interface.tsx` — Add scenario banner, correction rendering, save phrase
- Modify: `src/components/ai/chat-message.tsx` — Inline corrections display, "Speak" and "Explain" buttons
- Modify: `src/app/api/ai/chat/route.ts` — Add personality/correction level from user profile, save scenario_key
- Create: `src/components/ai/inline-correction.tsx`
- Create: `src/components/ai/conversation-history.tsx`

**Step 1: Update `use-ai-chat` hook**

- Parse `[CORRECTION]...[/CORRECTION]` blocks from streamed text
- Separate corrections from display text
- Add `loadConversation(id)` function to resume past conversations
- Track scenario state

**Step 2: Update chat API route**

- Read user's `ai_personality` and `ai_correction_level` from profile
- Pass to `buildTutorSystemPrompt`
- Save `scenario_key` and `title` on conversation creation

**Step 3: Update ChatInterface**

- Show `ScenarioPicker` when no active conversation
- Show scenario banner at top when in a scenario
- Pass corrections to `ChatMessage` components

**Step 4: Build InlineCorrection component**

Red underline on the original text. On hover/click, show popover with: corrected version, explanation (in Japanese), correction type badge.

**Step 5: Update ChatMessage component**

- Render inline corrections within user messages
- Add "Speak" button on assistant messages (uses `window.speechSynthesis`)
- Add "Explain" button that sends a follow-up asking for Japanese explanation
- Add "Save" button to bookmark phrases

**Step 6: Build ConversationHistory sidebar**

- List of past conversations from `ai_conversations` table
- Each shows: date, scenario icon/name, message count, duration
- Click to load (read-only review or resume)
- Delete button per conversation
- Search input for keyword search

**Step 7: Create saved phrases server action**

```typescript
// Add to src/lib/actions/settings.ts or create src/lib/actions/phrases.ts
export async function savePhrase(data: {
  phrase: string
  translation: string
  context: string
  conversationId?: string
}) { ... }

export async function deleteSavedPhrase(phraseId: string) { ... }

export async function getSavedPhrases(page: number = 0) { ... }
```

**Step 8: Commit**

```bash
git add src/hooks/use-ai-chat.ts src/components/ai/ src/app/api/ai/chat/route.ts src/lib/actions/phrases.ts
git commit -m "feat(slice2): enhance AI chat with corrections, scenarios, history, phrase saving"
```

---

### Task 2.5: AI Chat Page Rewrite

**Files:**
- Modify: `src/app/[locale]/(dashboard)/dashboard/ai-chat/page.tsx`

**Step 1: Rewrite the AI chat page**

- Server component fetches user profile + conversation list
- Renders: ConversationHistory sidebar (collapsible on mobile) + main area (ScenarioPicker or ChatInterface)
- Usage counter display for free tier users

**Step 2: Commit**

```bash
git add src/app/[locale]/(dashboard)/dashboard/ai-chat/page.tsx
git commit -m "feat(slice2): rewrite AI chat page with full layout"
```

---

### Task 2.6: Voice Server Enhancement

**Files:**
- Modify: `voice-server/src/index.ts` — Add JWT auth, session persistence, reconnection
- Modify: `voice-server/src/voice-pipeline.ts` — Split into separate modules
- Create: `voice-server/src/auth.ts` — JWT verification via Supabase
- Create: `voice-server/src/session.ts` — Session state management
- Create: `voice-server/src/deepgram.ts` — Dedicated STT module
- Create: `voice-server/src/claude.ts` — Dedicated Claude module with enhanced prompts
- Create: `voice-server/src/elevenlabs.ts` — Dedicated TTS module with speed control
- Create: `voice-server/src/azure-speech.ts` — Dedicated pronunciation module with phoneme data
- Create: `voice-server/Dockerfile`

**Step 1: Create auth module**

Verifies JWT token from Supabase on WebSocket handshake. Rejects unauthorized connections.

**Step 2: Create session module**

Manages voice session state: userId, mode, scenario, conversation history, start time, pronunciation scores, corrections. Handles serialization for persistence.

**Step 3: Refactor deepgram module**

Extract from voice-pipeline. Support streaming transcription (Deepgram live API) instead of batch.

**Step 4: Refactor claude module**

Enhanced system prompts for voice modes. Voice-specific: shorter responses, pronunciation correction awareness. Immersive mode: stay in character, detect scenario completion.

**Step 5: Refactor elevenlabs module**

Add speed control parameter (for "Slow down" button). Support streaming audio output.

**Step 6: Refactor azure-speech module**

Return detailed phoneme scores, not just overall score. Parse `NBest[0].Words` for per-word breakdown.

**Step 7: Update index.ts**

- Add auth on connection
- Support three modes: `voice_chat`, `voice_immersive`, `pronunciation_practice`
- For pronunciation practice: different flow (AI speaks phrase → user repeats → score only, no AI response)
- Session end → save to `ai_conversations` via Supabase REST API (service role)
- Generate session summary via Claude on end
- Handle reconnection with session ID

**Step 8: Create Dockerfile**

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --production
COPY dist/ ./dist/
EXPOSE 8080
CMD ["node", "dist/index.js"]
```

**Step 9: Commit**

```bash
cd voice-server && git add . && cd ..
git commit -m "feat(slice2): enhance voice server with auth, sessions, modular pipeline"
```

---

### Task 2.7: AI Voice — Client Hook and Audio Utils

**Files:**
- Create: `src/hooks/use-voice-session.ts`
- Create: `src/lib/audio/recorder.ts`
- Create: `src/lib/audio/player.ts`

**Step 1: Build audio recorder utility**

Uses `MediaRecorder` API. Records audio in webm format. Sends chunks over WebSocket. Includes VAD (voice activity detection) using simple amplitude threshold.

**Step 2: Build audio player utility**

Uses `AudioContext` to play audio buffers received from WebSocket. Manages playback queue for smooth streaming.

**Step 3: Build `useVoiceSession` hook**

Manages: WebSocket connection, audio recording, audio playback, transcript state, pronunciation scores, session timing, mode (voice_chat, voice_immersive, pronunciation_practice).

API:
- `connect(mode, scenario?)` — start session
- `startRecording()` / `stopRecording()` — control mic
- `endSession()` — stop and get summary
- `slowDown()` — send speed control message
- State: `isConnected`, `isRecording`, `isAISpeaking`, `transcript[]`, `pronunciationScores[]`, `error`

**Step 4: Commit**

```bash
git add src/hooks/use-voice-session.ts src/lib/audio/
git commit -m "feat(slice2): add voice session hook and audio utilities"
```

---

### Task 2.8: AI Voice — Page and UI Components

**Files:**
- Create: `src/app/[locale]/(dashboard)/dashboard/ai-voice/page.tsx`
- Create: `src/components/voice/voice-chat.tsx`
- Create: `src/components/voice/immersive-roleplay.tsx`
- Create: `src/components/voice/pronunciation-practice.tsx`
- Create: `src/components/voice/waveform-visualizer.tsx`
- Create: `src/components/voice/transcript-panel.tsx`
- Create: `src/components/voice/pronunciation-score-badge.tsx`
- Create: `src/components/voice/session-summary.tsx`
- Create: `src/components/voice/session-timer.tsx`

**Step 1: Build the AI Voice page**

Server component with tabs: Voice Chat, Immersive Roleplay, Pronunciation Practice. Each tab renders its respective component. Checks subscription tier for access (free = no access, show upgrade prompt).

**Step 2: Build WaveformVisualizer**

Canvas-based audio waveform using `AnalyserNode` from Web Audio API. Shows real-time amplitude visualization. Different colors for user (blue) vs AI (green).

**Step 3: Build TranscriptPanel**

Scrollable list of transcript entries. Each entry: speaker label, text, timestamp. For user entries: pronunciation score badge inline.

**Step 4: Build PronunciationScoreBadge**

Color-coded circle: green (>80), yellow (60-80), red (<60). Shows score number on hover.

**Step 5: Build VoiceChat component**

Layout: scenario picker → connected state with waveform (center), transcript (right sidebar), controls (bottom: mic toggle, slow down, end session), timer (top right).

**Step 6: Build ImmersiveRoleplay component**

Similar to VoiceChat but: richer scenario setup screen with character descriptions, no transcript by default (toggle button), scenario completion detection display.

**Step 7: Build PronunciationPractice component**

Different flow: shows target phrase → "Listen" button plays AI pronunciation → "Record" button for user → score display with phoneme breakdown → "Next" button. Tracks progress per sound category.

**Step 8: Build SessionSummary component**

Shown after session ends: overall pronunciation score, duration, corrections list, phrases to review (with save-to-phrase-bank buttons), "Practice again" / "Try different scenario" buttons.

**Step 9: Build SessionTimer component**

Counts up from session start. Shows max duration based on tier. Warning at 80% of max time.

**Step 10: Commit**

```bash
git add src/app/[locale]/(dashboard)/dashboard/ai-voice/ src/components/voice/
git commit -m "feat(slice2): add AI voice page with all three modes"
```

---

### Task 2.9: AI Learning i18n

**Files:**
- Modify: `src/messages/ja.json`
- Modify: `src/messages/en.json`

**Step 1: Add AI chat and voice strings**

Scenario names, voice mode labels, pronunciation feedback messages, session summary labels, upgrade prompts.

**Step 2: Commit**

```bash
git add src/messages/ja.json src/messages/en.json
git commit -m "feat(slice2): add i18n strings for AI chat and voice modules"
```

---

## Phase 3: Structured Learning — Courses + Exercises

### Task 3.1: Database Migration for Slice 3

**Files:**
- Create: `supabase/migrations/00005_slice3_structured_learning.sql`
- Modify: `src/lib/types/database.ts`

**Step 1: Write the migration**

Creates: `skill_profiles`, `exercise_attempts`, `course_ratings`. Adds columns to `course_exercises` (skill_area, difficulty, audio_url, time_limit_seconds). Adds exercise types `audio` and `conversation` to the enum. Adds RLS policies. Adds `updated_at` trigger on `skill_profiles`.

**Step 2: Update types**

Add `SkillProfile`, `ExerciseAttempt`, `CourseRating` interfaces. Update `CourseExercise` with new fields. Update `ExerciseType` union type.

**Step 3: Commit**

```bash
git add supabase/migrations/00005_slice3_structured_learning.sql src/lib/types/database.ts
git commit -m "feat(slice3): add structured learning DB migration and types"
```

---

### Task 3.2: Course List Page Enhancement

**Files:**
- Modify: `src/app/[locale]/(dashboard)/dashboard/courses/page.tsx`
- Create: `src/components/courses/course-filters.tsx`
- Modify: `src/components/courses/course-card.tsx`

**Step 1: Build CourseFilters component**

Filter bar with: CEFR level multi-select (shadcn Select), category dropdown, status dropdown (not started/in progress/completed), search input, sort select.

**Step 2: Update courses page**

Server component fetches courses with unit count (via join). Passes filters as search params. Add "Recommended for you" section at top based on user's level.

**Step 3: Update CourseCard**

Add: unit count badge, estimated time, star rating (from `course_ratings`), "Continue"/"Start" button variant, completion overlay.

**Step 4: Commit**

```bash
git add src/app/[locale]/(dashboard)/dashboard/courses/page.tsx src/components/courses/
git commit -m "feat(slice3): enhance courses list with filters, ratings, recommendations"
```

---

### Task 3.3: Course Detail Page Enhancement

**Files:**
- Modify: `src/app/[locale]/(dashboard)/dashboard/courses/[id]/page.tsx`

**Step 1: Enhance the course detail page**

Add: learning objectives display, unit stepper with lock/unlock logic (unit N+1 unlocked only if unit N completed), overall progress bar, estimated remaining time, "Continue" / "Start next unit" CTA that finds the first incomplete unit.

**Step 2: Commit**

```bash
git add src/app/[locale]/(dashboard)/dashboard/courses/[id]/page.tsx
git commit -m "feat(slice3): enhance course detail page with stepper and progress"
```

---

### Task 3.4: Unit Detail Page (New)

**Files:**
- Create: `src/app/[locale]/(dashboard)/dashboard/courses/[id]/units/[unitId]/page.tsx`
- Create: `src/components/courses/unit-content-renderer.tsx`
- Create: `src/components/courses/vocabulary-popup.tsx`

**Step 1: Build the unit page**

Server component: fetch unit with exercises, fetch user progress. Render content first, then exercises in sequence with progress bar.

**Step 2: Build UnitContentRenderer**

Renders jsonb content blocks: `text` (markdown), `image` (img tag), `audio` (audio player), `vocabulary` (table with tap-to-define), `grammar` (explanation callout). Supports bilingual toggle.

**Step 3: Build VocabularyPopup**

Tappable vocabulary word → popover with: definition, pronunciation audio, example sentence, "Add to phrase bank" button (reuses `savePhrase` action from Slice 2).

**Step 4: Commit**

```bash
git add src/app/[locale]/(dashboard)/dashboard/courses/[id]/units/ src/components/courses/unit-content-renderer.tsx src/components/courses/vocabulary-popup.tsx
git commit -m "feat(slice3): add unit detail page with content renderer"
```

---

### Task 3.5: Exercise Components — Multiple Choice and Fill Blank (Enhanced)

**Files:**
- Modify: `src/components/courses/exercise-renderer.tsx` (major refactor into a router)
- Create: `src/components/courses/exercises/multiple-choice.tsx`
- Create: `src/components/courses/exercises/fill-blank.tsx`
- Create: `src/lib/actions/exercises.ts`

**Step 1: Create exercise server actions**

```typescript
// src/lib/actions/exercises.ts
'use server'

export async function submitExerciseAttempt(data: {
  exerciseId: string
  score: number
  timeSpentSeconds: number
  hintsUsed: number
  attempts: number
  answerData: Record<string, unknown>
}) { ... } // saves to exercise_attempts, updates skill_profiles

export async function gradeFreqResponse(data: {
  exerciseId: string
  answer: string
  context: string
}) { ... } // calls Claude API for AI grading
```

**Step 2: Refactor ExerciseRenderer into a router**

Routes to the correct exercise component based on `exercise.type`. Passes common props: exercise, locale, onComplete callback.

**Step 3: Build enhanced MultipleChoice**

- Hint button (first hint eliminates 1 wrong option, deducts to 70 points max; second hint eliminates another, deducts to 40)
- "Try again" on wrong answer (max 2 attempts)
- Bilingual explanation on reveal
- Timer display if `time_limit_seconds` is set

**Step 4: Build enhanced FillBlank**

- Support multiple blanks (parse question for `___` markers)
- Word bank mode: draggable word chips into blank slots
- Free text mode: text inputs in blank positions
- Case-insensitive, accept common alternatives (stored in `options` as acceptable answers array)

**Step 5: Commit**

```bash
git add src/components/courses/exercise-renderer.tsx src/components/courses/exercises/ src/lib/actions/exercises.ts
git commit -m "feat(slice3): add enhanced multiple choice and fill blank exercises"
```

---

### Task 3.6: Exercise Components — Matching and Reorder

**Files:**
- Create: `src/components/courses/exercises/matching.tsx`
- Create: `src/components/courses/exercises/reorder.tsx`

**Step 1: Build Matching exercise**

Drag-and-drop pairs using HTML5 drag API (or pointer events for mobile). Left column: items to match. Right column: targets. Draw lines between matched pairs. Score based on correct matches. Optional timer for gamification.

**Step 2: Build Reorder exercise**

Draggable list items. User drags words/sentences into correct order. Visual drag handles. Mobile-friendly with touch events. Score: 100 if fully correct, partial credit based on items in correct position.

**Step 3: Commit**

```bash
git add src/components/courses/exercises/matching.tsx src/components/courses/exercises/reorder.tsx
git commit -m "feat(slice3): add matching and reorder exercise components"
```

---

### Task 3.7: Exercise Components — Free Response (AI-Graded)

**Files:**
- Create: `src/components/courses/exercises/free-response.tsx`
- Create: `src/app/api/ai/grade/route.ts`

**Step 1: Build the AI grading API route**

Receives: student answer, exercise question, correct answer reference, CEFR level. Sends to Claude with a rubric: score (0-100), corrected version, errors found, bilingual explanation, praise. Returns structured JSON.

**Step 2: Build FreeResponse component**

Textarea for answer. Submit button → shows loading spinner → displays: score, corrected version with diff highlighting, bilingual feedback, "Try Again" option.

**Step 3: Commit**

```bash
git add src/components/courses/exercises/free-response.tsx src/app/api/ai/grade/route.ts
git commit -m "feat(slice3): add AI-graded free response exercise"
```

---

### Task 3.8: Exercise Components — Audio and Conversation

**Files:**
- Create: `src/components/courses/exercises/audio-exercise.tsx`
- Create: `src/components/courses/exercises/conversation-exercise.tsx`

**Step 1: Build AudioExercise**

Three sub-types based on exercise config:
- **Comprehension**: Play audio → multiple choice "What did the speaker say?"
- **Dictation**: Play audio → type what you heard → compare to transcript
- **Pronunciation**: Play audio → record yourself → send to Azure Speech for scoring

Uses browser `Audio` element for playback. Reuses `MediaRecorder` pattern from voice module for pronunciation sub-type.

**Step 2: Build ConversationExercise**

Mini chat interface (reuses ChatMessage component). 3-5 exchange limit. Claude evaluates whether target vocabulary/grammar was used. On completion: score + feedback.

**Step 3: Commit**

```bash
git add src/components/courses/exercises/audio-exercise.tsx src/components/courses/exercises/conversation-exercise.tsx
git commit -m "feat(slice3): add audio and conversation exercise components"
```

---

### Task 3.9: Adaptive Difficulty System

**Files:**
- Create: `src/lib/adaptive-difficulty.ts`

**Step 1: Build the adaptive difficulty engine**

```typescript
// src/lib/adaptive-difficulty.ts
import { createClient } from '@/lib/supabase/server'

export async function getAdaptiveConfig(userId: string): Promise<{
  preferredDifficulty: number
  showHints: boolean
  timeMultiplier: number
}> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('skill_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!profile || profile.exercises_completed < 20) {
    return { preferredDifficulty: 2, showHints: true, timeMultiplier: 1.0 }
  }

  const avgAccuracy = (
    profile.grammar_accuracy +
    profile.vocabulary_accuracy +
    profile.listening_accuracy +
    profile.pronunciation_accuracy
  ) / 4

  if (avgAccuracy > 85) {
    return { preferredDifficulty: 4, showHints: false, timeMultiplier: 0.8 }
  } else if (avgAccuracy < 60) {
    return { preferredDifficulty: 1, showHints: true, timeMultiplier: 1.3 }
  }

  return { preferredDifficulty: 2, showHints: true, timeMultiplier: 1.0 }
}

export async function updateSkillProfile(userId: string) {
  // Recalculate from last 20 exercise_attempts per skill_area
  // Update skill_profiles table
}
```

**Step 2: Integrate into exercise flow**

Pass adaptive config to exercise components. Exercises adjust: hint availability, time limits, displayed difficulty.

**Step 3: Commit**

```bash
git add src/lib/adaptive-difficulty.ts
git commit -m "feat(slice3): add adaptive difficulty system"
```

---

### Task 3.10: Final Assessment

**Files:**
- Create: `src/components/courses/final-assessment.tsx`
- Create: `src/components/courses/assessment-results.tsx`

**Step 1: Build FinalAssessment component**

Timed assessment mode: 30-minute timer (configurable per course), 20 questions from course exercises (mixed types), progress bar, submit button. On timeout or submit → calculate scores per skill area → show results.

**Step 2: Build AssessmentResults component**

Score breakdown: overall percentage, per-skill-area scores (bar chart), pass/fail status (70% threshold), time taken, comparison to average (if data available). "Retake" button disabled for 24 hours (check `exercise_attempts` timestamp).

**Step 3: Commit**

```bash
git add src/components/courses/final-assessment.tsx src/components/courses/assessment-results.tsx
git commit -m "feat(slice3): add timed final assessment with results"
```

---

### Task 3.11: Course Rating

**Files:**
- Create: `src/components/courses/course-rating-form.tsx`

**Step 1: Build rating form**

Appears after course completion (final assessment passed). Star rating (1-5) + optional text review. Saves to `course_ratings` table.

**Step 2: Commit**

```bash
git add src/components/courses/course-rating-form.tsx
git commit -m "feat(slice3): add course rating form"
```

---

## Phase 4: Live Learning — Tutors + Lessons + Booking

### Task 4.1: Database Migration for Slice 4

**Files:**
- Create: `supabase/migrations/00006_slice4_live_learning.sql`
- Modify: `src/lib/types/database.ts`

**Step 1: Write the migration**

Creates: `lesson_preparations`, `lesson_notes`, `lesson_chats`. Adds columns to `lessons` (learner_review_categories, cancellation_reason, canceled_at, canceled_by, credit_refund_amount). Adds RLS policies. Adds trigger to update tutor `average_rating` on lesson review.

**Step 2: Update types**

Add `LessonPreparation`, `LessonNote`, `LessonChat` interfaces. Update `Lesson` with new fields.

**Step 3: Commit**

```bash
git add supabase/migrations/00006_slice4_live_learning.sql src/lib/types/database.ts
git commit -m "feat(slice4): add live learning DB migration and types"
```

---

### Task 4.2: Tutor List Enhancement

**Files:**
- Modify: `src/app/[locale]/(dashboard)/dashboard/tutors/page.tsx`
- Create: `src/components/tutors/tutor-filters.tsx`
- Modify: `src/components/tutors/tutor-card.tsx`

**Step 1: Build TutorFilters**

Filter bar: date/time picker (for availability search), specialty multi-select, tutor type (all/certified/community), price range slider, minimum rating, language spoken. "Available now" toggle.

**Step 2: Update tutors page**

Fetch tutors with filters applied. For date/time availability: join with `tutor_availability` to check slot conflicts. Sort options.

**Step 3: Update TutorCard**

Add: "Available now" indicator, next available slot text, "Book" quick action.

**Step 4: Commit**

```bash
git add src/app/[locale]/(dashboard)/dashboard/tutors/ src/components/tutors/
git commit -m "feat(slice4): enhance tutor list with filters and availability"
```

---

### Task 4.3: Tutor Profile Page

**Files:**
- Create: `src/app/[locale]/(dashboard)/dashboard/tutors/[id]/page.tsx`
- Create: `src/components/tutors/tutor-profile-header.tsx`
- Create: `src/components/tutors/tutor-about.tsx`
- Create: `src/components/tutors/tutor-schedule.tsx`
- Create: `src/components/tutors/tutor-reviews.tsx`

**Step 1: Build the tutor profile page**

Server component: fetch tutor profile, user info, availability, reviews. Renders tabs: About, Schedule, Reviews.

**Step 2: Build TutorProfileHeader**

Large avatar, name, certified badge, rating summary (stars + count), total lessons, "Book a Lesson" CTA button (sticky on scroll).

**Step 3: Build TutorAbout**

Bio (bilingual), languages (badges), specialties (badges), teaching style text, video intro player (if `video_url` exists in profile).

**Step 4: Build TutorSchedule**

Weekly calendar grid: columns = days (Mon-Sun), rows = 30-min slots. Green = available, grey = booked. Click green slot → opens booking modal. Duration toggle (25/50 min). Week navigation (current + 4 weeks). Respects learner's timezone setting.

Fetch availability from `tutor_availability` (recurring), cross-reference with existing `lessons` (booked slots).

**Step 5: Build TutorReviews**

List of reviews with: learner avatar, star rating (per category: communication, patience, expertise, value), review text, date. Pagination.

**Step 6: Commit**

```bash
git add src/app/[locale]/(dashboard)/dashboard/tutors/[id]/ src/components/tutors/
git commit -m "feat(slice4): add tutor profile page with schedule and reviews"
```

---

### Task 4.4: Booking Flow

**Files:**
- Create: `src/components/tutors/booking-modal.tsx`
- Create: `src/components/tutors/booking-confirmation.tsx`
- Modify: `src/lib/actions/lessons.ts` — Enhance `bookLesson` with notifications, reminders, .ics

**Step 1: Build BookingModal**

Dialog showing: tutor name + avatar, selected date/time (in learner's TZ + JST), duration selection, credit cost display, credit balance check. "Confirm Booking" or "Purchase Credits" button.

**Step 2: Build BookingConfirmation**

Success screen with: lesson details summary, "Add to Calendar" button (generates .ics file download), "Go to Lessons" button.

**Step 3: Enhance bookLesson action**

Already exists in `src/lib/actions/lessons.ts`. Enhance with:
- Save scenario to `lesson_preparations` if pre-configured
- Generate .ics content for calendar
- Return more detailed response

**Step 4: Commit**

```bash
git add src/components/tutors/booking-modal.tsx src/components/tutors/booking-confirmation.tsx src/lib/actions/lessons.ts
git commit -m "feat(slice4): add booking flow with modal, confirmation, and calendar"
```

---

### Task 4.5: Lessons List Page

**Files:**
- Create: `src/app/[locale]/(dashboard)/dashboard/lessons/page.tsx`
- Create: `src/components/lessons/lesson-card.tsx`
- Create: `src/components/lessons/cancel-lesson-dialog.tsx`

**Step 1: Build the lessons list page**

Server component with tabs: Upcoming, Past, Canceled. Each tab fetches from `lessons` table with appropriate filters. Joins with user table for tutor info.

**Step 2: Build LessonCard**

Displays: tutor avatar + name, date/time with countdown (client-side), duration, status badge. Action buttons vary by tab:
- Upcoming: Prepare, Join (visible 5 min before), Reschedule, Cancel
- Past: Review, View Notes, Rebook, Download Notes
- Canceled: Refund status, Rebook

**Step 3: Build CancelLessonDialog**

Shows cancellation policy based on time until lesson:
- `hoursUntil >= 24`: "Full refund"
- `hoursUntil >= 2`: "50% refund"
- `hoursUntil < 2`: "No refund"
Reason text input. Confirm/Cancel buttons.

**Step 4: Enhance `cancelLesson` action**

Add: cancellation_reason, canceled_at, canceled_by fields. Implement tiered refund (existing logic handles > 2hrs, add 50% refund for 2-24hr window).

**Step 5: Commit**

```bash
git add src/app/[locale]/(dashboard)/dashboard/lessons/page.tsx src/components/lessons/ src/lib/actions/lessons.ts
git commit -m "feat(slice4): add lessons list page with tabs and cancellation"
```

---

### Task 4.6: Lesson Preparation

**Files:**
- Create: `src/components/lessons/lesson-preparation.tsx`
- Create: `src/lib/actions/lesson-prep.ts`

**Step 1: Build LessonPreparation component**

Form with: topics textarea, vocabulary tag input (type + enter to add tags), goals checkboxes (improve pronunciation, practice conversation, grammar review, custom text). Saves to `lesson_preparations` table. Auto-saves on change (debounced).

**Step 2: Create lesson-prep server actions**

`saveLessonPrep`, `getLessonPrep` functions.

**Step 3: Commit**

```bash
git add src/components/lessons/lesson-preparation.tsx src/lib/actions/lesson-prep.ts
git commit -m "feat(slice4): add lesson preparation area"
```

---

### Task 4.7: Lesson Room Enhancement

**Files:**
- Modify: `src/components/lessons/lesson-room.tsx` — Major enhancement
- Create: `src/components/lessons/pre-join-screen.tsx`
- Create: `src/components/lessons/lesson-chat.tsx`
- Create: `src/components/lessons/shared-notes.tsx`
- Create: `src/components/lessons/phrase-panel.tsx`
- Create: `src/components/lessons/lesson-timer.tsx`

**Step 1: Build PreJoinScreen**

Camera/mic preview using `navigator.mediaDevices.getUserMedia`. Device selector dropdowns. Lesson details display. Prep notes reminder. "Join Lesson" button.

**Step 2: Build LessonChat**

Real-time text chat using Supabase Realtime. Subscribe to `lesson_chats` table for the lesson ID. Input field + send button. Message list with sender name + timestamp.

**Step 3: Build SharedNotes**

Real-time collaborative textarea using Supabase Realtime. Both tutor and learner can type. Changes broadcast via Supabase channel. Debounced save to `lesson_notes.shared_notes`.

**Step 4: Build PhrasePanel**

Grid of common JP↔EN phrases grouped by category (greetings, asking for help, confirmation, farewell). Tappable → copies to chat input or shared notes.

**Step 5: Build LessonTimer**

Counts up from lesson start. Shows remaining time based on `duration_minutes`. Warning color at 5 min remaining. Auto-end message at time limit.

**Step 6: Enhance LessonRoom**

Redesign layout: Daily.co video (main area, 70% width), sidebar (30% width) with tabs: Chat, Notes, Phrases. Recording toggle (both parties must consent via real-time prompt). Timer in top bar.

**Step 7: Commit**

```bash
git add src/components/lessons/
git commit -m "feat(slice4): enhance lesson room with chat, notes, phrases, and timer"
```

---

### Task 4.8: Post-Lesson Flow

**Files:**
- Create: `src/components/lessons/post-lesson-review.tsx`
- Create: `src/components/lessons/lesson-summary.tsx`
- Create: `src/lib/actions/lesson-review.ts`

**Step 1: Build PostLessonReview**

Rating form: overall 1-5 stars + category ratings (communication, patience, expertise, value as sliders or star rows). Optional text review. "What did you learn?" reflection textarea. Submit button.

**Step 2: Build LessonSummary**

Shows after lesson or accessible from past lessons: tutor notes, AI-generated summary (from recording transcript via Claude), shared notes download, "Rebook" shortcut button.

**Step 3: Create review server actions**

`submitLessonReview` — saves rating + review, updates tutor's `average_rating` via aggregation query, awards 100 XP.

**Step 4: Commit**

```bash
git add src/components/lessons/post-lesson-review.tsx src/components/lessons/lesson-summary.tsx src/lib/actions/lesson-review.ts
git commit -m "feat(slice4): add post-lesson review and summary"
```

---

## Phase 5: Gamification — Progress + Achievements + XP/Streak

### Task 5.1: Database Migration for Slice 5

**Files:**
- Create: `supabase/migrations/00007_slice5_gamification.sql`
- Modify: `src/lib/types/database.ts`

**Step 1: Write the migration**

Creates: `achievements`, `user_achievements`, `user_goals`, `xp_ledger`. Adds columns to `users` (level, streak_freezes_remaining, longest_streak, leaderboard_opt_in, weekly_email_opt_in). Seeds achievements table with initial achievement definitions. Adds RLS policies.

**Step 2: Seed achievements**

Insert all achievement definitions: consistency (4), AI practice (5), pronunciation (4), courses (3), lessons (3), social (2), XP (4), CEFR (5) = ~30 achievements.

**Step 3: Update types**

Add `Achievement`, `UserAchievement`, `UserGoal`, `XPLedgerEntry` interfaces. Update `User` with new fields.

**Step 4: Commit**

```bash
git add supabase/migrations/00007_slice5_gamification.sql src/lib/types/database.ts
git commit -m "feat(slice5): add gamification DB migration, types, and achievement seeds"
```

---

### Task 5.2: XP and Streak System

**Files:**
- Modify: `src/lib/actions/progress.ts` — Major rewrite

**Step 1: Rewrite the XP/streak system**

```typescript
// Enhanced src/lib/actions/progress.ts
'use server'

const XP_VALUES = {
  exercise: { base: 20, perDifficulty: 10 }, // 10-50 by difficulty
  ai_chat: 30,
  ai_voice: 50,
  pronunciation_drill: 30,
  lesson: 100,
  course_unit: 75,
  course_complete: 200,
  daily_goal: 50,
  weekly_goal: 100,
} as const

export async function awardXP(
  userId: string,
  amount: number,
  source: string,
  sourceId?: string
) {
  // 1. Insert into xp_ledger
  // 2. Update users.xp and users.level (level = floor(xp / 1000) + 1)
  // 3. Call updateStreak(userId)
  // 4. Call checkAchievements(userId, source)
}

export async function updateStreak(userId: string) {
  // 1. Get user's last_activity_date, streak_days, streak_freezes_remaining
  // 2. If last_activity_date is yesterday → increment streak
  // 3. If last_activity_date is today → no change
  // 4. If gap > 1 day AND streak_freezes_remaining > 0 → use freeze
  // 5. If gap > 1 day AND no freezes → reset to 1
  // 6. Update longest_streak if current > longest
  // 7. Update last_activity_date to today
}

export async function checkAchievements(userId: string, trigger: string) {
  // Query user stats, check against achievement requirements
  // For each newly unlocked achievement:
  //   1. Insert into user_achievements
  //   2. Award achievement XP
  //   3. Create notification
}
```

**Step 2: Commit**

```bash
git add src/lib/actions/progress.ts
git commit -m "feat(slice5): rewrite XP/streak system with ledger and achievements"
```

---

### Task 5.3: Goals System

**Files:**
- Create: `src/lib/actions/goals.ts`

**Step 1: Implement goals server actions**

```typescript
export async function createGoal(data: {
  title: string
  targetValue: number
  goalType: string // 'study_days' | 'exercises' | 'voice_sessions' | 'lessons'
  period: 'weekly' | 'monthly'
}) { ... }

export async function updateGoalProgress(userId: string, goalType: string, increment: number) { ... }

export async function getActiveGoals(userId: string) { ... }

export async function suggestGoals(userId: string) { ... }
// Analyzes recent activity and suggests 3 goals
```

**Step 2: Commit**

```bash
git add src/lib/actions/goals.ts
git commit -m "feat(slice5): add goals system server actions"
```

---

### Task 5.4: Progress Page — Overview Tab

**Files:**
- Modify: `src/app/[locale]/(dashboard)/dashboard/progress/page.tsx` — Full rewrite
- Create: `src/components/progress/stats-row.tsx`
- Create: `src/components/progress/activity-heatmap.tsx`
- Create: `src/components/progress/streak-calendar.tsx`

**Step 1: Rewrite progress page with tabs**

Server component with tabs: Overview, Skills, Activity, Achievements, Goals. Fetches all needed data in parallel.

**Step 2: Build StatsRow**

4 cards: XP with level badge (animated with framer-motion), streak with flame, CEFR with progress toward next level, monthly study time.

**Step 3: Build ActivityHeatmap**

GitHub-style contribution calendar. 90 days of data from `xp_ledger` (group by date, sum amounts). Color intensity mapped to activity level. Hover tooltip: date + minutes + XP earned.

**Step 4: Build StreakCalendar**

30 circles in a row. Filled (green) = active day, empty = missed, flame (orange) = current streak day. Show longest streak record below.

**Step 5: Commit**

```bash
git add src/app/[locale]/(dashboard)/dashboard/progress/page.tsx src/components/progress/
git commit -m "feat(slice5): rebuild progress page overview with heatmap and streak"
```

---

### Task 5.5: Progress Page — Skills Tab

**Files:**
- Create: `src/components/progress/skills-radar-chart.tsx`
- Create: `src/components/progress/skill-detail.tsx`

**Step 1: Build SkillsRadarChart**

SVG-based radar chart with 5 axes (Grammar, Vocabulary, Listening, Pronunciation, Fluency). Draw two polygons: current scores (filled blue) and 30-days-ago scores (dashed outline). Axis labels at each point.

Data from `skill_profiles` table. Historical comparison from `exercise_attempts` grouped by skill_area for past 30 days.

**Step 2: Build SkillDetail**

Per-skill drilldown: accuracy trend line (SVG sparkline or simple line chart using `<path>`), exercises completed count, weak sub-topics (derived from most-failed exercises), recommended exercises links.

**Step 3: Commit**

```bash
git add src/components/progress/skills-radar-chart.tsx src/components/progress/skill-detail.tsx
git commit -m "feat(slice5): add skills radar chart and drill-down"
```

---

### Task 5.6: Progress Page — Activity Tab

**Files:**
- Create: `src/components/progress/activity-feed.tsx`
- Create: `src/components/progress/weekly-summary-card.tsx`

**Step 1: Build ActivityFeed**

Chronological feed combining: `ai_conversations`, `exercise_attempts`, `lessons`. Each entry: icon by type, description, score/duration, timestamp. Filter dropdown by type. Paginated (20 per page).

**Step 2: Build WeeklySummaryCard**

Card showing this week's stats: total time, exercises completed, AI sessions, lessons, XP earned. Comparison to previous week (green up arrow or red down arrow with percentage).

**Step 3: Commit**

```bash
git add src/components/progress/activity-feed.tsx src/components/progress/weekly-summary-card.tsx
git commit -m "feat(slice5): add activity feed and weekly summary"
```

---

### Task 5.7: Progress Page — Achievements Tab

**Files:**
- Create: `src/components/progress/achievements-grid.tsx`
- Create: `src/components/progress/achievement-card.tsx`
- Create: `src/components/progress/achievement-unlock-toast.tsx`

**Step 1: Build AchievementsGrid**

Grid of achievement cards grouped by category. Filter by category or status (locked/unlocked).

**Step 2: Build AchievementCard**

Each card: icon (lucide), title (bilingual), description, progress bar (e.g., "23/50"), unlocked date (if unlocked), greyed out with lock icon if locked.

**Step 3: Build AchievementUnlockToast**

Custom toast (extends sonner) with confetti animation (use `canvas-confetti` or CSS keyframe particles). Shows achievement icon + title + XP reward. Triggered when `checkAchievements` finds new unlocks.

**Step 4: Commit**

```bash
git add src/components/progress/achievements-grid.tsx src/components/progress/achievement-card.tsx src/components/progress/achievement-unlock-toast.tsx
git commit -m "feat(slice5): add achievements grid with unlock animation"
```

---

### Task 5.8: Progress Page — Goals and Leaderboard

**Files:**
- Create: `src/components/progress/goals-section.tsx`
- Create: `src/components/progress/leaderboard.tsx`

**Step 1: Build GoalsSection**

Active goals with progress bars. "Add Goal" button → modal with preset goals or custom. Auto-suggested goals based on activity patterns. Completed goals with XP reward display.

**Step 2: Build Leaderboard**

Weekly XP leaderboard. Top 50 list + user's position highlighted. Opt-in toggle (updates `users.leaderboard_opt_in`). Tab navigation: Overall, AI Practice, Courses.

**Step 3: Commit**

```bash
git add src/components/progress/goals-section.tsx src/components/progress/leaderboard.tsx
git commit -m "feat(slice5): add goals section and leaderboard"
```

---

### Task 5.9: Cross-Module XP Integration

**Files:**
- Modify: `src/app/api/ai/chat/route.ts` — Award XP after conversation
- Modify: `voice-server/src/index.ts` — Award XP after voice session
- Modify: `src/lib/actions/exercises.ts` — Award XP after exercise
- Modify: `src/lib/actions/lesson-review.ts` — Award XP after lesson

**Step 1: Add XP award calls to all activity endpoints**

Each activity type calls `awardXP` with the appropriate amount and source. This triggers streak update and achievement checks automatically.

**Step 2: Add goal progress updates**

Each activity type also calls `updateGoalProgress` to increment relevant active goals.

**Step 3: Commit**

```bash
git add src/app/api/ai/chat/route.ts voice-server/src/index.ts src/lib/actions/exercises.ts src/lib/actions/lesson-review.ts
git commit -m "feat(slice5): integrate XP and goal tracking across all modules"
```

---

### Task 5.10: Weekly Summary Email

**Files:**
- Modify: `src/lib/email/send.ts` — Enhance `sendWeeklySummary`
- Create: `src/app/api/cron/weekly-summary/route.ts`

**Step 1: Enhance weekly summary email**

Add: achievements unlocked this week, streak status, top skill improvement, recommended next steps. All in Japanese.

**Step 2: Create cron route**

API route that can be called by a cron job (Vercel Cron or external). Fetches all users with `weekly_email_opt_in = true`. For each: query week's stats from `xp_ledger`, `exercise_attempts`, `lessons`, `user_achievements`. Send email via Resend.

**Step 3: Commit**

```bash
git add src/lib/email/send.ts src/app/api/cron/weekly-summary/route.ts
git commit -m "feat(slice5): enhance weekly summary email with achievements and recommendations"
```

---

### Task 5.11: Gamification i18n

**Files:**
- Modify: `src/messages/ja.json`
- Modify: `src/messages/en.json`

**Step 1: Add all gamification strings**

Achievement names and descriptions (bilingual), goal labels, leaderboard labels, progress section headers, streak messages, XP labels.

**Step 2: Commit**

```bash
git add src/messages/ja.json src/messages/en.json
git commit -m "feat(slice5): add i18n strings for gamification module"
```

---

## Phase 6: Integration Testing and Polish

### Task 6.1: End-to-End Smoke Tests

**Files:**
- Create: `src/__tests__/e2e/dashboard.test.ts`
- Create: `src/__tests__/e2e/settings.test.ts`
- Create: `src/__tests__/e2e/ai-chat.test.ts`
- Create: `src/__tests__/e2e/courses.test.ts`

**Step 1: Write integration tests**

Test key user flows:
- Login → Dashboard loads with all widgets
- Settings → Update profile → Verify saved
- AI Chat → Select scenario → Send message → Receive response with corrections
- Courses → Browse → Enter course → Complete exercise → Progress updates

**Step 2: Run tests**

Run: `pnpm test`

**Step 3: Commit**

```bash
git add src/__tests__/
git commit -m "test: add integration tests for all dashboard modules"
```

---

### Task 6.2: Build Verification

**Step 1: Run production build**

Run: `pnpm build`
Expected: Build succeeds with no TypeScript errors

**Step 2: Fix any build errors**

**Step 3: Run linter**

Run: `pnpm lint`
Expected: No lint errors

**Step 4: Commit any fixes**

```bash
git add .
git commit -m "fix: resolve build and lint errors"
```
