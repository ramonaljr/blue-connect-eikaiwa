# Blue Connect Eikaiwa Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-featured ESL SaaS for Japanese English learners with AI tutoring, structured courses, and a live tutor marketplace.

**Architecture:** Monolithic Next.js 15 App Router app with Supabase (auth, DB, realtime, storage) as backend. Stripe for payments. Daily.co for video. Claude + Deepgram + ElevenLabs + Azure Speech for AI tutoring. Separate Railway WebSocket server for real-time voice. Deployed on Vercel.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Stripe, Daily.co, next-intl, Upstash Redis, Resend, Anthropic SDK, Deepgram SDK, ElevenLabs SDK, Azure Speech SDK

**Design Doc:** `docs/plans/2026-03-19-blue-connect-eikaiwa-design.md`

---

## Phase 1: Project Scaffolding & Configuration

### Task 1.1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `.env.local.example`

**Step 1: Create the Next.js app**

```bash
cd /Users/ramonvallejerajr/Developer/blue-connect-eikaiwa
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Accept defaults. This scaffolds the full Next.js 15 project.

**Step 2: Verify it runs**

Run: `npm run dev`
Expected: App running at http://localhost:3000 with the default Next.js page.
Stop the server with Ctrl+C.

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js 15 project with TypeScript and Tailwind"
```

---

### Task 1.2: Install Core Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install UI and utility dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr next-intl @upstash/redis @upstash/ratelimit stripe @stripe/stripe-js resend @anthropic-ai/sdk @daily-co/daily-react @daily-co/daily-js lucide-react date-fns zod
```

**Step 2: Install shadcn/ui**

```bash
npx shadcn@latest init -d
```

Select: New York style, Zinc base color, CSS variables.

**Step 3: Add commonly used shadcn components**

```bash
npx shadcn@latest add button card input label dialog dropdown-menu avatar badge separator tabs sheet toast form select textarea command popover calendar
```

**Step 4: Install dev dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom @types/node
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: install core dependencies and shadcn/ui components"
```

---

### Task 1.3: Configure Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `src/__tests__/setup.ts`
- Modify: `tsconfig.json` (add vitest types)

**Step 1: Create vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Step 2: Create test setup file**

Create `src/__tests__/setup.ts`:
```typescript
import '@testing-library/jest-dom/vitest'
```

**Step 3: Add test script to package.json**

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 4: Write a smoke test**

Create `src/__tests__/smoke.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'

describe('smoke test', () => {
  it('should pass', () => {
    expect(true).toBe(true)
  })
})
```

**Step 5: Run the test**

Run: `npm test`
Expected: 1 test passed.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: configure Vitest with React Testing Library"
```

---

### Task 1.4: Configure Environment Variables

**Files:**
- Create: `.env.local.example`
- Create: `.gitignore` additions

**Step 1: Create env example file**

Create `.env.local.example`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI Services
ANTHROPIC_API_KEY=sk-ant-...
DEEPGRAM_API_KEY=...
ELEVENLABS_API_KEY=...
AZURE_SPEECH_KEY=...
AZURE_SPEECH_REGION=japaneast

# Daily.co
DAILY_API_KEY=...

# Upstash Redis
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Resend
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
VOICE_WS_URL=ws://localhost:8080
```

**Step 2: Ensure .gitignore includes .env.local**

Verify `.gitignore` contains:
```
.env.local
.env*.local
```

**Step 3: Commit**

```bash
git add .env.local.example .gitignore
git commit -m "feat: add environment variable template"
```

---

### Task 1.5: Set Up Supabase Client Utilities

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/middleware.ts`

**Step 1: Create the browser client**

Create `src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 2: Create the server client**

Create `src/lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}
```

**Step 3: Create the middleware helper**

Create `src/lib/supabase/middleware.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  return supabaseResponse
}
```

**Step 4: Create the Next.js middleware**

Create `src/middleware.ts`:
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: set up Supabase client utilities and auth middleware"
```

---

### Task 1.6: Set Up next-intl for i18n

**Files:**
- Create: `src/i18n/request.ts`
- Create: `src/i18n/routing.ts`
- Create: `src/messages/ja.json`
- Create: `src/messages/en.json`
- Modify: `src/middleware.ts`
- Modify: `next.config.ts`

**Step 1: Create i18n routing config**

Create `src/i18n/routing.ts`:
```typescript
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['ja', 'en'],
  defaultLocale: 'ja',
})
```

**Step 2: Create i18n request config**

Create `src/i18n/request.ts`:
```typescript
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
```

**Step 3: Create base message files**

Create `src/messages/ja.json`:
```json
{
  "common": {
    "appName": "Blue Connect Eikaiwa",
    "login": "ログイン",
    "signup": "新規登録",
    "logout": "ログアウト",
    "dashboard": "ダッシュボード",
    "settings": "設定",
    "save": "保存",
    "cancel": "キャンセル",
    "delete": "削除",
    "edit": "編集",
    "loading": "読み込み中...",
    "error": "エラーが発生しました",
    "success": "成功しました"
  },
  "landing": {
    "hero": {
      "title": "AIと人の力で、英語が話せるようになる",
      "subtitle": "AI英会話・オンラインレッスン・構造化コースで、あなたの英語力を確実に伸ばします",
      "cta": "無料で始める"
    },
    "features": {
      "ai": {
        "title": "AI英会話パートナー",
        "description": "テキスト・音声・ロールプレイで、いつでも英語を練習"
      },
      "courses": {
        "title": "構造化コース",
        "description": "CEFRレベル別の体系的なカリキュラムで着実にレベルアップ"
      },
      "tutors": {
        "title": "ライブレッスン",
        "description": "認定講師やコミュニティ講師とのマンツーマンレッスン"
      }
    }
  },
  "auth": {
    "loginTitle": "ログイン",
    "signupTitle": "新規登録",
    "email": "メールアドレス",
    "password": "パスワード",
    "confirmPassword": "パスワード確認",
    "forgotPassword": "パスワードをお忘れですか？",
    "noAccount": "アカウントをお持ちでないですか？",
    "hasAccount": "すでにアカウントをお持ちですか？",
    "continueWithGoogle": "Googleで続ける",
    "continueWithLine": "LINEで続ける"
  },
  "nav": {
    "home": "ホーム",
    "pricing": "料金",
    "tutors": "講師一覧",
    "courses": "コース",
    "aiChat": "AI英会話",
    "aiVoice": "AI音声",
    "lessons": "レッスン",
    "progress": "学習進捗"
  }
}
```

Create `src/messages/en.json`:
```json
{
  "common": {
    "appName": "Blue Connect Eikaiwa",
    "login": "Log in",
    "signup": "Sign up",
    "logout": "Log out",
    "dashboard": "Dashboard",
    "settings": "Settings",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Success"
  },
  "landing": {
    "hero": {
      "title": "Learn English with AI and Real Tutors",
      "subtitle": "AI conversation practice, online lessons, and structured courses to build your English skills",
      "cta": "Get Started Free"
    },
    "features": {
      "ai": {
        "title": "AI Conversation Partner",
        "description": "Practice English anytime with text, voice, and roleplay"
      },
      "courses": {
        "title": "Structured Courses",
        "description": "Level up systematically with CEFR-aligned curriculum"
      },
      "tutors": {
        "title": "Live Lessons",
        "description": "One-on-one lessons with certified and community tutors"
      }
    }
  },
  "auth": {
    "loginTitle": "Log In",
    "signupTitle": "Sign Up",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "forgotPassword": "Forgot your password?",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "continueWithGoogle": "Continue with Google",
    "continueWithLine": "Continue with LINE"
  },
  "nav": {
    "home": "Home",
    "pricing": "Pricing",
    "tutors": "Tutors",
    "courses": "Courses",
    "aiChat": "AI Chat",
    "aiVoice": "AI Voice",
    "lessons": "Lessons",
    "progress": "Progress"
  }
}
```

**Step 4: Update middleware to combine Supabase + i18n**

Replace `src/middleware.ts`:
```typescript
import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  // First, handle Supabase session refresh
  const supabaseResponse = await updateSession(request)

  // Then, handle i18n routing
  const intlResponse = intlMiddleware(request)

  // Merge cookies from Supabase response into intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value)
  })

  return intlResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Step 5: Update next.config.ts**

Replace `next.config.ts`:
```typescript
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {}

export default withNextIntl(nextConfig)
```

**Step 6: Restructure app directory for i18n**

Move `src/app/layout.tsx` and `src/app/page.tsx` to `src/app/[locale]/layout.tsx` and `src/app/[locale]/page.tsx`.

Create `src/app/[locale]/layout.tsx`:
```typescript
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: 'Blue Connect Eikaiwa',
  description: 'Learn English with AI tutors, structured courses, and live lessons',
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
    <html lang={locale}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

Create `src/app/[locale]/page.tsx`:
```typescript
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
```

**Step 7: Verify it runs**

Run: `npm run dev`
Visit: http://localhost:3000/ja — should show Japanese hero text.
Visit: http://localhost:3000/en — should show English hero text.

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: set up next-intl with Japanese and English locales"
```

---

## Phase 2: Database Schema & Supabase Setup

### Task 2.1: Create Supabase Migration — Core Tables

**Files:**
- Create: `supabase/migrations/00001_create_core_tables.sql`

**Step 1: Initialize Supabase locally (if not done)**

```bash
npx supabase init
```

**Step 2: Create the migration file**

Create `supabase/migrations/00001_create_core_tables.sql`:
```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enum types
create type user_role as enum ('learner', 'community_tutor', 'certified_tutor', 'admin');
create type cefr_level as enum ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
create type subscription_tier as enum ('free', 'pro', 'premium');
create type subscription_status as enum ('active', 'canceled', 'past_due', 'trialing');
create type certification_status as enum ('pending', 'approved', 'rejected');
create type lesson_status as enum ('scheduled', 'in_progress', 'completed', 'canceled');
create type exercise_type as enum ('multiple_choice', 'fill_blank', 'matching', 'reorder', 'free_response');
create type progress_status as enum ('not_started', 'in_progress', 'completed');
create type ai_mode as enum ('text_chat', 'voice_chat', 'voice_immersive');
create type credit_type as enum ('lesson_certified', 'lesson_community', 'ai_voice');
create type credit_source as enum ('subscription', 'purchase');
create type notification_type as enum ('lesson_reminder', 'review_request', 'subscription', 'system');

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  display_name text not null default '',
  native_language text not null default 'ja',
  english_level cefr_level not null default 'A1',
  role user_role not null default 'learner',
  avatar_url text,
  stripe_customer_id text,
  subscription_tier subscription_tier not null default 'free',
  subscription_status subscription_status not null default 'active',
  xp integer not null default 0,
  streak_days integer not null default 0,
  last_activity_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tutor profiles
create table public.tutor_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  bio text not null default '',
  bio_ja text not null default '',
  hourly_rate integer, -- in JPY, null for certified (standardized)
  languages_spoken jsonb not null default '["en"]'::jsonb,
  specialties jsonb not null default '[]'::jsonb,
  certification_status certification_status not null default 'pending',
  average_rating numeric(3,2) not null default 0,
  total_lessons integer not null default 0,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tutor availability
create table public.tutor_availability (
  id uuid default uuid_generate_v4() primary key,
  tutor_id uuid references public.users(id) on delete cascade not null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  timezone text not null default 'Asia/Tokyo',
  is_recurring boolean not null default true,
  created_at timestamptz not null default now()
);

-- Lessons
create table public.lessons (
  id uuid default uuid_generate_v4() primary key,
  learner_id uuid references public.users(id) on delete cascade not null,
  tutor_id uuid references public.users(id) on delete cascade not null,
  scheduled_at timestamptz not null,
  duration_minutes smallint not null default 25 check (duration_minutes in (25, 50)),
  status lesson_status not null default 'scheduled',
  daily_room_url text,
  recording_url text,
  tutor_notes text,
  learner_rating smallint check (learner_rating between 1 and 5),
  learner_review text,
  created_at timestamptz not null default now()
);

-- Courses
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  title_ja text not null,
  description text not null default '',
  description_ja text not null default '',
  level cefr_level not null,
  category text not null,
  thumbnail_url text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Course units
create table public.course_units (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  title_ja text not null,
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Course exercises
create table public.course_exercises (
  id uuid default uuid_generate_v4() primary key,
  unit_id uuid references public.course_units(id) on delete cascade not null,
  type exercise_type not null,
  question text not null,
  question_ja text not null default '',
  options jsonb not null default '[]'::jsonb,
  correct_answer text not null default '',
  explanation text not null default '',
  explanation_ja text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Learner progress
create table public.learner_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  unit_id uuid references public.course_units(id) on delete cascade,
  status progress_status not null default 'not_started',
  score numeric(5,2),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, course_id, unit_id)
);

-- AI conversations
create table public.ai_conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  mode ai_mode not null,
  scenario text,
  messages jsonb not null default '[]'::jsonb,
  corrections jsonb not null default '[]'::jsonb,
  duration_seconds integer not null default 0,
  pronunciation_score numeric(5,2),
  created_at timestamptz not null default now()
);

-- Credits
create table public.credits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  type credit_type not null,
  amount integer not null default 1,
  source credit_source not null,
  stripe_payment_id text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Notifications
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  type notification_type not null,
  title text not null,
  body text not null default '',
  is_read boolean not null default false,
  action_url text,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_lessons_learner on public.lessons(learner_id);
create index idx_lessons_tutor on public.lessons(tutor_id);
create index idx_lessons_scheduled on public.lessons(scheduled_at);
create index idx_courses_published on public.courses(is_published, sort_order);
create index idx_course_units_course on public.course_units(course_id, sort_order);
create index idx_course_exercises_unit on public.course_exercises(unit_id, sort_order);
create index idx_learner_progress_user on public.learner_progress(user_id);
create index idx_ai_conversations_user on public.ai_conversations(user_id, created_at desc);
create index idx_credits_user on public.credits(user_id, expires_at);
create index idx_notifications_user on public.notifications(user_id, is_read, created_at desc);
create index idx_tutor_availability_tutor on public.tutor_availability(tutor_id);

-- Updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger set_updated_at before update on public.users
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.tutor_profiles
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.courses
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.learner_progress
  for each row execute function public.handle_updated_at();

-- Auto-create user profile on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Supabase migration for core database schema"
```

---

### Task 2.2: Create Supabase Migration — Row Level Security

**Files:**
- Create: `supabase/migrations/00002_create_rls_policies.sql`

**Step 1: Create the RLS migration**

Create `supabase/migrations/00002_create_rls_policies.sql`:
```sql
-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.tutor_profiles enable row level security;
alter table public.tutor_availability enable row level security;
alter table public.lessons enable row level security;
alter table public.courses enable row level security;
alter table public.course_units enable row level security;
alter table public.course_exercises enable row level security;
alter table public.learner_progress enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.credits enable row level security;
alter table public.notifications enable row level security;

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Users policies
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);
create policy "Public can view basic user info" on public.users
  for select using (true);
create policy "Admins can manage all users" on public.users
  for all using (public.is_admin());

-- Tutor profiles policies
create policy "Anyone can view available tutor profiles" on public.tutor_profiles
  for select using (is_available = true or user_id = auth.uid());
create policy "Tutors can update own profile" on public.tutor_profiles
  for update using (user_id = auth.uid());
create policy "Tutors can insert own profile" on public.tutor_profiles
  for insert with check (user_id = auth.uid());
create policy "Admins can manage tutor profiles" on public.tutor_profiles
  for all using (public.is_admin());

-- Tutor availability policies
create policy "Anyone can view tutor availability" on public.tutor_availability
  for select using (true);
create policy "Tutors can manage own availability" on public.tutor_availability
  for all using (tutor_id = auth.uid());

-- Lessons policies
create policy "Users can view own lessons" on public.lessons
  for select using (learner_id = auth.uid() or tutor_id = auth.uid());
create policy "Learners can create lessons" on public.lessons
  for insert with check (learner_id = auth.uid());
create policy "Participants can update lessons" on public.lessons
  for update using (learner_id = auth.uid() or tutor_id = auth.uid());
create policy "Admins can manage all lessons" on public.lessons
  for all using (public.is_admin());

-- Courses policies (published courses are public)
create policy "Anyone can view published courses" on public.courses
  for select using (is_published = true);
create policy "Admins can manage courses" on public.courses
  for all using (public.is_admin());

-- Course units policies
create policy "Anyone can view units of published courses" on public.course_units
  for select using (
    exists (
      select 1 from public.courses
      where courses.id = course_units.course_id and courses.is_published = true
    )
  );
create policy "Admins can manage course units" on public.course_units
  for all using (public.is_admin());

-- Course exercises policies
create policy "Anyone can view exercises of published courses" on public.course_exercises
  for select using (
    exists (
      select 1 from public.course_units
      join public.courses on courses.id = course_units.course_id
      where course_units.id = course_exercises.unit_id and courses.is_published = true
    )
  );
create policy "Admins can manage exercises" on public.course_exercises
  for all using (public.is_admin());

-- Learner progress policies
create policy "Users can view own progress" on public.learner_progress
  for select using (user_id = auth.uid());
create policy "Users can manage own progress" on public.learner_progress
  for all using (user_id = auth.uid());

-- AI conversations policies
create policy "Users can view own conversations" on public.ai_conversations
  for select using (user_id = auth.uid());
create policy "Users can create own conversations" on public.ai_conversations
  for insert with check (user_id = auth.uid());
create policy "Users can update own conversations" on public.ai_conversations
  for update using (user_id = auth.uid());

-- Credits policies
create policy "Users can view own credits" on public.credits
  for select using (user_id = auth.uid());
create policy "Admins can manage credits" on public.credits
  for all using (public.is_admin());

-- Notifications policies
create policy "Users can view own notifications" on public.notifications
  for select using (user_id = auth.uid());
create policy "Users can update own notifications" on public.notifications
  for update using (user_id = auth.uid());
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add Row Level Security policies for all tables"
```

---

### Task 2.3: Create TypeScript Database Types

**Files:**
- Create: `src/lib/types/database.ts`

**Step 1: Create TypeScript types matching the schema**

Create `src/lib/types/database.ts`:
```typescript
export type UserRole = 'learner' | 'community_tutor' | 'certified_tutor' | 'admin'
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type SubscriptionTier = 'free' | 'pro' | 'premium'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'
export type CertificationStatus = 'pending' | 'approved' | 'rejected'
export type LessonStatus = 'scheduled' | 'in_progress' | 'completed' | 'canceled'
export type ExerciseType = 'multiple_choice' | 'fill_blank' | 'matching' | 'reorder' | 'free_response'
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'
export type AIMode = 'text_chat' | 'voice_chat' | 'voice_immersive'
export type CreditType = 'lesson_certified' | 'lesson_community' | 'ai_voice'
export type CreditSource = 'subscription' | 'purchase'
export type NotificationType = 'lesson_reminder' | 'review_request' | 'subscription' | 'system'

export interface User {
  id: string
  email: string
  full_name: string
  display_name: string
  native_language: string
  english_level: CEFRLevel
  role: UserRole
  avatar_url: string | null
  stripe_customer_id: string | null
  subscription_tier: SubscriptionTier
  subscription_status: SubscriptionStatus
  xp: number
  streak_days: number
  last_activity_date: string | null
  created_at: string
  updated_at: string
}

export interface TutorProfile {
  id: string
  user_id: string
  bio: string
  bio_ja: string
  hourly_rate: number | null
  languages_spoken: string[]
  specialties: string[]
  certification_status: CertificationStatus
  average_rating: number
  total_lessons: number
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface TutorAvailability {
  id: string
  tutor_id: string
  day_of_week: number
  start_time: string
  end_time: string
  timezone: string
  is_recurring: boolean
  created_at: string
}

export interface Lesson {
  id: string
  learner_id: string
  tutor_id: string
  scheduled_at: string
  duration_minutes: 25 | 50
  status: LessonStatus
  daily_room_url: string | null
  recording_url: string | null
  tutor_notes: string | null
  learner_rating: number | null
  learner_review: string | null
  created_at: string
}

export interface Course {
  id: string
  title: string
  title_ja: string
  description: string
  description_ja: string
  level: CEFRLevel
  category: string
  thumbnail_url: string | null
  is_published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CourseUnit {
  id: string
  course_id: string
  title: string
  title_ja: string
  content: Record<string, unknown>
  sort_order: number
  created_at: string
}

export interface CourseExercise {
  id: string
  unit_id: string
  type: ExerciseType
  question: string
  question_ja: string
  options: unknown[]
  correct_answer: string
  explanation: string
  explanation_ja: string
  sort_order: number
  created_at: string
}

export interface LearnerProgress {
  id: string
  user_id: string
  course_id: string
  unit_id: string | null
  status: ProgressStatus
  score: number | null
  completed_at: string | null
  updated_at: string
}

export interface AIConversation {
  id: string
  user_id: string
  mode: AIMode
  scenario: string | null
  messages: AIMessage[]
  corrections: AICorrection[]
  duration_seconds: number
  pronunciation_score: number | null
  created_at: string
}

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AICorrection {
  original: string
  corrected: string
  explanation: string
  explanation_ja: string
  type: 'grammar' | 'vocabulary' | 'pronunciation' | 'usage'
}

export interface Credit {
  id: string
  user_id: string
  type: CreditType
  amount: number
  source: CreditSource
  stripe_payment_id: string | null
  expires_at: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  is_read: boolean
  action_url: string | null
  created_at: string
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add TypeScript database types"
```

---

## Phase 3: Authentication

### Task 3.1: Auth Server Actions

**Files:**
- Create: `src/lib/actions/auth.ts`

**Step 1: Create auth server actions**

Create `src/lib/actions/auth.ts`:
```typescript
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
        display_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect(data.url)
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add auth server actions (signup, signin, signout, Google OAuth)"
```

---

### Task 3.2: Auth Callback Route

**Files:**
- Create: `src/app/auth/callback/route.ts`

**Step 1: Create the OAuth callback route**

Create `src/app/auth/callback/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add OAuth callback route handler"
```

---

### Task 3.3: Login Page

**Files:**
- Create: `src/app/[locale]/(auth)/login/page.tsx`
- Create: `src/components/auth/login-form.tsx`

**Step 1: Create login form component**

Create `src/components/auth/login-form.tsx`:
```typescript
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
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('loginTitle')}</CardTitle>
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
            <Label htmlFor="email">{t('email')}</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {tc('login')}
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
          {t('noAccount')}{' '}
          <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
            {tc('signup')}
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Create login page**

Create `src/app/[locale]/(auth)/login/page.tsx`:
```typescript
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </main>
  )
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add login page with email and Google OAuth"
```

---

### Task 3.4: Signup Page

**Files:**
- Create: `src/app/[locale]/(auth)/signup/page.tsx`
- Create: `src/components/auth/signup-form.tsx`

**Step 1: Create signup form component**

Create `src/components/auth/signup-form.tsx`:
```typescript
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
```

**Step 2: Create signup page**

Create `src/app/[locale]/(auth)/signup/page.tsx`:
```typescript
import { SignupForm } from '@/components/auth/signup-form'

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <SignupForm />
    </main>
  )
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add signup page with email and Google OAuth"
```

---

### Task 3.5: Auth Guard Utility

**Files:**
- Create: `src/lib/auth/guard.ts`

**Step 1: Create auth guard for protected pages**

Create `src/lib/auth/guard.ts`:
```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@/lib/types/database'

export async function requireAuth(): Promise<User> {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!user) {
    redirect('/login')
  }

  return user as User
}

export async function requireRole(allowedRoles: string[]): Promise<User> {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role)) {
    redirect('/dashboard')
  }

  return user
}

export async function requireAdmin(): Promise<User> {
  return requireRole(['admin'])
}

export async function requireTutor(): Promise<User> {
  return requireRole(['community_tutor', 'certified_tutor', 'admin'])
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add auth guard utilities for protected routes"
```

---

## Phase 4: Layout & Navigation

### Task 4.1: Public Layout with Navbar

**Files:**
- Create: `src/components/layout/public-navbar.tsx`
- Create: `src/components/layout/language-toggle.tsx`
- Create: `src/app/[locale]/(public)/layout.tsx`

**Step 1: Create language toggle component**

Create `src/components/layout/language-toggle.tsx`:
```typescript
'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale() {
    const newLocale = locale === 'ja' ? 'en' : 'ja'
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
  }

  return (
    <Button variant="ghost" size="sm" onClick={switchLocale}>
      {locale === 'ja' ? 'EN' : '日本語'}
    </Button>
  )
}
```

**Step 2: Create public navbar**

Create `src/components/layout/public-navbar.tsx`:
```typescript
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { LanguageToggle } from './language-toggle'

export function PublicNavbar() {
  const t = useTranslations('nav')
  const tc = useTranslations('common')

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-primary">
            {tc('appName')}
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              {t('pricing')}
            </Link>
            <Link href="/tutors" className="text-sm text-muted-foreground hover:text-foreground">
              {t('tutors')}
            </Link>
            <Link href="/courses" className="text-sm text-muted-foreground hover:text-foreground">
              {t('courses')}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">{tc('login')}</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">{tc('signup')}</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
```

**Step 3: Create public layout**

Create `src/app/[locale]/(public)/layout.tsx`:
```typescript
import { PublicNavbar } from '@/components/layout/public-navbar'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PublicNavbar />
      {children}
    </>
  )
}
```

**Step 4: Move the landing page into the public group**

Move `src/app/[locale]/page.tsx` to `src/app/[locale]/(public)/page.tsx`.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add public layout with navbar and language toggle"
```

---

### Task 4.2: Dashboard Layout with Sidebar

**Files:**
- Create: `src/components/layout/dashboard-sidebar.tsx`
- Create: `src/components/layout/dashboard-header.tsx`
- Create: `src/app/[locale]/(dashboard)/layout.tsx`

**Step 1: Create dashboard sidebar**

Create `src/components/layout/dashboard-sidebar.tsx`:
```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  MessageSquare,
  Mic,
  BookOpen,
  Calendar,
  Users,
  TrendingUp,
  Settings,
} from 'lucide-react'

const learnerLinks = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { href: '/dashboard/ai-chat', icon: MessageSquare, labelKey: 'aiChat' },
  { href: '/dashboard/ai-voice', icon: Mic, labelKey: 'aiVoice' },
  { href: '/dashboard/courses', icon: BookOpen, labelKey: 'courses' },
  { href: '/dashboard/lessons', icon: Calendar, labelKey: 'lessons' },
  { href: '/dashboard/tutors', icon: Users, labelKey: 'tutors' },
  { href: '/dashboard/progress', icon: TrendingUp, labelKey: 'progress' },
  { href: '/dashboard/settings', icon: Settings, labelKey: 'settings' },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const tc = useTranslations('common')

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="text-lg font-bold text-primary">
          {tc('appName')}
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {learnerLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <link.icon className="h-4 w-4" />
              {t(link.labelKey)}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

**Step 2: Create dashboard header**

Create `src/components/layout/dashboard-header.tsx`:
```typescript
import { requireAuth } from '@/lib/auth/guard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LanguageToggle } from './language-toggle'
import { signOut } from '@/lib/actions/auth'

export async function DashboardHeader() {
  const user = await requireAuth()

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div />
      <div className="flex items-center gap-4">
        <LanguageToggle />
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback>{user.display_name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{user.display_name}</span>
        </div>
        <form action={signOut}>
          <Button variant="ghost" size="sm" type="submit">
            ログアウト
          </Button>
        </form>
      </div>
    </header>
  )
}
```

**Step 3: Create dashboard layout**

Create `src/app/[locale]/(dashboard)/layout.tsx`:
```typescript
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Step 4: Create dashboard index page**

Create `src/app/[locale]/(dashboard)/dashboard/page.tsx`:
```typescript
import { requireAuth } from '@/lib/auth/guard'

export default async function DashboardPage() {
  const user = await requireAuth()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        こんにちは、{user.display_name}さん
      </h1>
      <p className="text-muted-foreground">
        今日も英語の練習を始めましょう！
      </p>
    </div>
  )
}
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add dashboard layout with sidebar and header"
```

---

## Phase 5: Stripe Payments & Subscriptions

### Task 5.1: Stripe Utilities

**Files:**
- Create: `src/lib/stripe/client.ts`
- Create: `src/lib/stripe/config.ts`

**Step 1: Create Stripe config**

Create `src/lib/stripe/config.ts`:
```typescript
export const STRIPE_PLANS = {
  free: {
    name: 'Free',
    name_ja: 'フリー',
    price: 0,
    priceId: null,
  },
  pro: {
    name: 'Pro',
    name_ja: 'プロ',
    price: 2980,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
  },
  premium: {
    name: 'Premium',
    name_ja: 'プレミアム',
    price: 6980,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
  },
} as const

export const CREDIT_PRODUCTS = {
  ai_voice_10: {
    name: 'AI Voice Sessions (10-pack)',
    name_ja: 'AI音声セッション（10回パック）',
    price: 980,
    priceId: process.env.STRIPE_AI_VOICE_PACK_PRICE_ID!,
    credits: 10,
    type: 'ai_voice' as const,
  },
  lesson_certified: {
    name: 'Certified Tutor Lesson',
    name_ja: '認定講師レッスン',
    price: 2500,
    priceId: process.env.STRIPE_CERTIFIED_LESSON_PRICE_ID!,
    credits: 1,
    type: 'lesson_certified' as const,
  },
} as const
```

**Step 2: Create Stripe server client**

Create `src/lib/stripe/client.ts`:
```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
})
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Stripe client and plan configuration"
```

---

### Task 5.2: Stripe Checkout & Webhook

**Files:**
- Create: `src/app/api/stripe/checkout/route.ts`
- Create: `src/app/api/stripe/webhook/route.ts`

**Step 1: Create checkout route**

Create `src/app/api/stripe/checkout/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { STRIPE_PLANS } from '@/lib/stripe/config'
import type { SubscriptionTier } from '@/lib/types/database'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { tier } = await request.json() as { tier: SubscriptionTier }
  const plan = STRIPE_PLANS[tier]

  if (!plan || !plan.priceId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  // Get or create Stripe customer
  const { data: dbUser } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  let customerId = dbUser?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await supabase
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { supabase_user_id: user.id, tier },
  })

  return NextResponse.json({ url: session.url })
}
```

**Step 2: Create webhook route**

Create `src/app/api/stripe/webhook/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@supabase/supabase-js'
import type { SubscriptionTier } from '@/lib/types/database'

// Use service role for webhook (no user context)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata?.supabase_user_id
      const tier = session.metadata?.tier as SubscriptionTier

      if (userId && tier) {
        await supabase
          .from('users')
          .update({
            subscription_tier: tier,
            subscription_status: 'active',
          })
          .eq('id', userId)

        // Grant monthly credits for Premium
        if (tier === 'premium') {
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + 30)

          await supabase.from('credits').insert({
            user_id: userId,
            type: 'lesson_certified',
            amount: 4,
            source: 'subscription',
            expires_at: expiresAt.toISOString(),
          })
        }
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object
      const customerId = subscription.customer as string

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (user) {
        const status = subscription.status === 'active' ? 'active'
          : subscription.status === 'past_due' ? 'past_due'
          : 'canceled'

        await supabase
          .from('users')
          .update({ subscription_status: status })
          .eq('id', user.id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const customerId = subscription.customer as string

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (user) {
        await supabase
          .from('users')
          .update({
            subscription_tier: 'free',
            subscription_status: 'canceled',
          })
          .eq('id', user.id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Stripe checkout and webhook routes"
```

---

## Phase 6: AI Text Chat

### Task 6.1: Rate Limiting Utility

**Files:**
- Create: `src/lib/rate-limit.ts`

**Step 1: Create rate limiter with Upstash**

Create `src/lib/rate-limit.ts`:
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const aiChatLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 d'), // fallback, actual limit checked per tier
  analytics: true,
  prefix: 'ratelimit:ai-chat',
})

export const aiVoiceLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 d'),
  analytics: true,
  prefix: 'ratelimit:ai-voice',
})

export async function checkAIChatLimit(
  userId: string,
  tier: string
): Promise<{ allowed: boolean; remaining: number }> {
  if (tier === 'pro' || tier === 'premium') {
    return { allowed: true, remaining: -1 }
  }

  // Free tier: 3 chats per day
  const key = `ai-chat:${userId}`
  const count = await redis.incr(key)

  if (count === 1) {
    await redis.expire(key, 86400) // 24 hours
  }

  return {
    allowed: count <= 3,
    remaining: Math.max(0, 3 - count),
  }
}

export async function checkAIVoiceLimit(
  userId: string,
  tier: string
): Promise<{ allowed: boolean; remaining: number }> {
  if (tier === 'free') {
    return { allowed: false, remaining: 0 }
  }

  if (tier === 'premium') {
    return { allowed: true, remaining: -1 }
  }

  // Pro tier: 5 voice sessions per day
  const key = `ai-voice:${userId}`
  const count = await redis.incr(key)

  if (count === 1) {
    await redis.expire(key, 86400)
  }

  return {
    allowed: count <= 5,
    remaining: Math.max(0, 5 - count),
  }
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add rate limiting utilities with Upstash Redis"
```

---

### Task 6.2: AI Chat API Route (Streaming)

**Files:**
- Create: `src/lib/ai/system-prompts.ts`
- Create: `src/app/api/ai/chat/route.ts`

**Step 1: Create system prompt builder**

Create `src/lib/ai/system-prompts.ts`:
```typescript
import type { CEFRLevel } from '@/lib/types/database'

export function buildTutorSystemPrompt(params: {
  name: string
  level: CEFRLevel
  mode: 'text_chat' | 'voice_guided' | 'roleplay'
  scenario?: string
}): string {
  const { name, level, mode, scenario } = params

  let prompt = `You are a friendly, patient English tutor for Japanese learners.

Context:
- Learner's name: ${name}
- Current CEFR level: ${level}
- Native language: Japanese
- Mode: ${mode}

Behavior:
- Match complexity to their CEFR level (${level})
- When they make errors, gently correct with the natural English form
- Understand common Japanese→English mistakes (L1 interference):
  - Article omission (a/the)
  - R/L confusion in meaning
  - Plural/singular confusion
  - Word order (SOV→SVO)
  - Preposition misuse
- Encourage them, celebrate progress
- If they use Japanese, respond in English but acknowledge what they said
- Keep responses concise${mode !== 'text_chat' ? ' (1-3 sentences for voice mode)' : ''}
- After corrections, continue the conversation naturally`

  if (mode === 'roleplay' && scenario) {
    prompt += `\n\nScenario: ${scenario}
Stay in character as the scenario counterpart. Do not break character unless the learner is confused.`
  }

  return prompt
}

export const ROLEPLAY_SCENARIOS = {
  restaurant: {
    name: 'Ordering at a Restaurant',
    name_ja: 'レストランで注文する',
    prompt: 'You are a waiter at a casual restaurant. Greet the customer, describe today\'s specials, take their order, and handle any questions about the menu.',
  },
  job_interview: {
    name: 'Job Interview',
    name_ja: '面接練習',
    prompt: 'You are an interviewer at an international company. Conduct a professional job interview. Ask about their experience, strengths, and why they want the job.',
  },
  airport: {
    name: 'At the Airport',
    name_ja: '空港にて',
    prompt: 'You are an airport staff member. Help the traveler with check-in, finding their gate, or handling a flight delay situation.',
  },
  business_meeting: {
    name: 'Business Meeting',
    name_ja: 'ビジネスミーティング',
    prompt: 'You are a colleague in a business meeting. Discuss a project update, ask for opinions, and work through a simple business decision together.',
  },
  small_talk: {
    name: 'Making Small Talk',
    name_ja: '雑談する',
    prompt: 'You are a friendly person at a social event. Make small talk about hobbies, weather, travel, or current events. Keep it light and natural.',
  },
  doctor: {
    name: 'Doctor\'s Visit',
    name_ja: '病院にて',
    prompt: 'You are a doctor. The patient has come in with a minor ailment. Ask about symptoms, give advice, and explain any treatment simply.',
  },
} as const
```

**Step 2: Create the streaming chat API route**

Create `src/app/api/ai/chat/route.ts`:
```typescript
import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { buildTutorSystemPrompt } from '@/lib/ai/system-prompts'
import { checkAIChatLimit } from '@/lib/rate-limit'
import type { AIMessage } from '@/lib/types/database'

const anthropic = new Anthropic()

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!user) {
    return new Response('User not found', { status: 404 })
  }

  // Check rate limit
  const limit = await checkAIChatLimit(user.id, user.subscription_tier)
  if (!limit.allowed) {
    return new Response(
      JSON.stringify({ error: 'Daily chat limit reached', remaining: limit.remaining }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { messages, conversationId, scenario } = await request.json() as {
    messages: AIMessage[]
    conversationId?: string
    scenario?: string
  }

  const systemPrompt = buildTutorSystemPrompt({
    name: user.display_name || user.full_name,
    level: user.english_level,
    mode: scenario ? 'roleplay' : 'text_chat',
    scenario,
  })

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  })

  // Return streaming response
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
          )
        }
      }

      // Get the final message for storage
      const finalMessage = await stream.finalMessage()
      const assistantContent = finalMessage.content
        .filter((c) => c.type === 'text')
        .map((c) => c.text)
        .join('')

      // Save conversation to DB
      const allMessages = [
        ...messages,
        { role: 'assistant' as const, content: assistantContent, timestamp: new Date().toISOString() },
      ]

      if (conversationId) {
        await supabase
          .from('ai_conversations')
          .update({ messages: allMessages })
          .eq('id', conversationId)
      } else {
        const { data: conv } = await supabase
          .from('ai_conversations')
          .insert({
            user_id: user.id,
            mode: 'text_chat',
            scenario: scenario ?? null,
            messages: allMessages,
          })
          .select('id')
          .single()

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ conversationId: conv?.id })}\n\n`)
        )
      }

      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add streaming AI chat API route with rate limiting"
```

---

### Task 6.3: AI Chat UI

**Files:**
- Create: `src/components/ai/chat-interface.tsx`
- Create: `src/components/ai/chat-message.tsx`
- Create: `src/hooks/use-ai-chat.ts`
- Create: `src/app/[locale]/(dashboard)/dashboard/ai-chat/page.tsx`

**Step 1: Create the chat hook**

Create `src/hooks/use-ai-chat.ts`:
```typescript
'use client'

import { useState, useCallback, useRef } from 'react'
import type { AIMessage } from '@/lib/types/database'

export function useAIChat() {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string, scenario?: string) => {
    setError(null)
    const userMessage: AIMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsStreaming(true)

    const abortController = new AbortController()
    abortRef.current = abortController

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          conversationId,
          scenario,
        }),
        signal: abortController.signal,
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to send message')
        setIsStreaming(false)
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      }

      setMessages([...updatedMessages, assistantMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n\n').filter(Boolean)

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)

          if (data === '[DONE]') continue

          const parsed = JSON.parse(data)

          if (parsed.text) {
            assistantContent += parsed.text
            setMessages((prev) => {
              const updated = [...prev]
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: assistantContent,
              }
              return updated
            })
          }

          if (parsed.conversationId) {
            setConversationId(parsed.conversationId)
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError('Failed to send message')
      }
    } finally {
      setIsStreaming(false)
    }
  }, [messages, conversationId])

  const reset = useCallback(() => {
    setMessages([])
    setConversationId(null)
    setError(null)
    abortRef.current?.abort()
  }, [])

  return { messages, isStreaming, error, sendMessage, reset }
}
```

**Step 2: Create chat message component**

Create `src/components/ai/chat-message.tsx`:
```typescript
import { cn } from '@/lib/utils'
import type { AIMessage } from '@/lib/types/database'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bot, User } from 'lucide-react'

interface ChatMessageProps {
  message: AIMessage
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={cn(isUser ? 'bg-primary' : 'bg-blue-600')}>
          {isUser ? <User className="h-4 w-4 text-primary-foreground" /> : <Bot className="h-4 w-4 text-white" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-2 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}
```

**Step 3: Create chat interface component**

Create `src/components/ai/chat-interface.tsx`:
```typescript
'use client'

import { useRef, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChatMessage } from './chat-message'
import { useAIChat } from '@/hooks/use-ai-chat'
import { Send, RotateCcw } from 'lucide-react'

export function ChatInterface() {
  const t = useTranslations('common')
  const { messages, isStreaming, error, sendMessage, reset } = useAIChat()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || isStreaming) return
    const message = input.trim()
    setInput('')
    await sendMessage(message)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-lg font-semibold">AI英会話チャット</h2>
          <p className="text-sm text-muted-foreground">英語で話しかけてみましょう</p>
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          新しい会話
        </Button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto py-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>メッセージを入力して会話を始めましょう！</p>
          </div>
        )}
        {messages.map((message, i) => (
          <ChatMessage key={i} message={message} />
        ))}
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message in English..."
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button onClick={handleSend} disabled={isStreaming || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
```

**Step 4: Create the AI chat page**

Create `src/app/[locale]/(dashboard)/dashboard/ai-chat/page.tsx`:
```typescript
import { requireAuth } from '@/lib/auth/guard'
import { ChatInterface } from '@/components/ai/chat-interface'

export default async function AIChatPage() {
  await requireAuth()

  return (
    <div className="h-[calc(100vh-8rem)]">
      <ChatInterface />
    </div>
  )
}
```

**Step 5: Verify it builds**

Run: `npm run build`
Expected: Build succeeds (may have warnings about env vars in dev, that's OK).

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add AI text chat interface with streaming responses"
```

---

## Phase 7: Course Platform

### Task 7.1: Course Listing Page

**Files:**
- Create: `src/app/[locale]/(dashboard)/dashboard/courses/page.tsx`
- Create: `src/components/courses/course-card.tsx`

**Step 1: Create course card component**

Create `src/components/courses/course-card.tsx`:
```typescript
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Course } from '@/lib/types/database'

interface CourseCardProps {
  course: Course
  progress?: number
}

export function CourseCard({ course, progress }: CourseCardProps) {
  const locale = useLocale()
  const title = locale === 'ja' ? course.title_ja : course.title
  const description = locale === 'ja' ? course.description_ja : course.description

  return (
    <Link href={`/dashboard/courses/${course.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        {course.thumbnail_url && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img
              src={course.thumbnail_url}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{course.level}</Badge>
            <Badge variant="outline">{course.category}</Badge>
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          {progress !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>進捗</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
```

**Step 2: Create courses listing page**

Create `src/app/[locale]/(dashboard)/dashboard/courses/page.tsx`:
```typescript
import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { CourseCard } from '@/components/courses/course-card'

export default async function CoursesPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('sort_order')

  const { data: progress } = await supabase
    .from('learner_progress')
    .select('course_id, status, score')
    .eq('user_id', user.id)

  const progressMap = new Map<string, number>()
  if (progress) {
    for (const p of progress) {
      if (p.status === 'completed') {
        progressMap.set(p.course_id, 100)
      } else if (p.score) {
        progressMap.set(p.course_id, Math.round(p.score))
      }
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">コース一覧</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            progress={progressMap.get(course.id)}
          />
        ))}
        {!courses?.length && (
          <p className="text-muted-foreground col-span-full text-center py-12">
            コースはまだありません
          </p>
        )}
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add course listing page with progress tracking"
```

---

### Task 7.2: Course Detail & Exercise Pages

**Files:**
- Create: `src/app/[locale]/(dashboard)/dashboard/courses/[id]/page.tsx`
- Create: `src/components/courses/exercise-renderer.tsx`

**Step 1: Create exercise renderer**

Create `src/components/courses/exercise-renderer.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-react'
import type { CourseExercise } from '@/lib/types/database'

interface ExerciseRendererProps {
  exercise: CourseExercise
  locale: string
  onComplete: (score: number) => void
}

export function ExerciseRenderer({ exercise, locale, onComplete }: ExerciseRendererProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const question = locale === 'ja' ? exercise.question_ja || exercise.question : exercise.question
  const explanation = locale === 'ja' ? exercise.explanation_ja || exercise.explanation : exercise.explanation

  function handleSubmit() {
    const answer = exercise.type === 'multiple_choice' ? selectedAnswer : textAnswer.trim()
    const correct = answer?.toLowerCase() === exercise.correct_answer.toLowerCase()
    setIsCorrect(correct)
    setSubmitted(true)
    onComplete(correct ? 100 : 0)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{exercise.type.replace('_', ' ')}</Badge>
          {submitted && (
            isCorrect
              ? <Badge className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" /> 正解</Badge>
              : <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> 不正解</Badge>
          )}
        </div>
        <CardTitle className="text-base">{question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {exercise.type === 'multiple_choice' && (
          <div className="space-y-2">
            {(exercise.options as string[]).map((option, i) => (
              <button
                key={i}
                onClick={() => !submitted && setSelectedAnswer(option)}
                className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                  submitted && option === exercise.correct_answer
                    ? 'border-green-500 bg-green-50'
                    : submitted && option === selectedAnswer && !isCorrect
                    ? 'border-destructive bg-destructive/10'
                    : selectedAnswer === option
                    ? 'border-primary bg-primary/10'
                    : 'hover:bg-muted'
                }`}
                disabled={submitted}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {(exercise.type === 'fill_blank' || exercise.type === 'free_response') && (
          <Input
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="答えを入力..."
            disabled={submitted}
          />
        )}

        {!submitted && (
          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswer && !textAnswer.trim()}
          >
            回答する
          </Button>
        )}

        {submitted && explanation && (
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium">解説:</p>
            <p>{explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

**Step 2: Create course detail page**

Create `src/app/[locale]/(dashboard)/dashboard/courses/[id]/page.tsx`:
```typescript
import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Circle } from 'lucide-react'
import Link from 'next/link'

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id, locale } = await params
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()

  if (!course) notFound()

  const { data: units } = await supabase
    .from('course_units')
    .select('*')
    .eq('course_id', id)
    .order('sort_order')

  const { data: progress } = await supabase
    .from('learner_progress')
    .select('unit_id, status, score')
    .eq('user_id', user.id)
    .eq('course_id', id)

  const progressMap = new Map(progress?.map((p) => [p.unit_id, p]) ?? [])

  const title = locale === 'ja' ? course.title_ja : course.title
  const description = locale === 'ja' ? course.description_ja : course.description

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">{course.level}</Badge>
          <Badge variant="outline">{course.category}</Badge>
        </div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">ユニット</h2>
        {units?.map((unit, i) => {
          const unitProgress = progressMap.get(unit.id)
          const isCompleted = unitProgress?.status === 'completed'
          const unitTitle = locale === 'ja' ? unit.title_ja : unit.title

          return (
            <Link key={unit.id} href={`/dashboard/courses/${id}/units/${unit.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-4">
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-base">
                      Unit {i + 1}: {unitTitle}
                    </CardTitle>
                    {unitProgress?.score && (
                      <p className="text-sm text-muted-foreground">
                        スコア: {Math.round(unitProgress.score)}%
                      </p>
                    )}
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add course detail page with units and exercise renderer"
```

---

## Phase 8: Tutor Marketplace & Booking

### Task 8.1: Tutor Browse Page

**Files:**
- Create: `src/app/[locale]/(dashboard)/dashboard/tutors/page.tsx`
- Create: `src/components/tutors/tutor-card.tsx`

**Step 1: Create tutor card component**

Create `src/components/tutors/tutor-card.tsx`:
```typescript
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import type { TutorProfile, User } from '@/lib/types/database'

interface TutorCardProps {
  tutor: TutorProfile & { user: Pick<User, 'display_name' | 'avatar_url' | 'role'> }
  locale: string
}

export function TutorCard({ tutor, locale }: TutorCardProps) {
  const bio = locale === 'ja' ? tutor.bio_ja || tutor.bio : tutor.bio
  const isCertified = tutor.user.role === 'certified_tutor'

  return (
    <Link href={`/dashboard/tutors/${tutor.user_id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={tutor.user.avatar_url ?? undefined} />
            <AvatarFallback>{tutor.user.display_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{tutor.user.display_name}</CardTitle>
              {isCertified && (
                <Badge className="bg-blue-600 text-white">認定講師</Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{tutor.average_rating.toFixed(1)}</span>
              <span>({tutor.total_lessons} レッスン)</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">{bio}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {(tutor.specialties as string[]).map((s) => (
              <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
            ))}
          </div>
          <p className="mt-3 text-sm font-medium">
            {isCertified ? '¥2,500 / 25分' : `¥${tutor.hourly_rate?.toLocaleString()} / 25分`}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
```

**Step 2: Create tutor browse page**

Create `src/app/[locale]/(dashboard)/dashboard/tutors/page.tsx`:
```typescript
import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { TutorCard } from '@/components/tutors/tutor-card'

export default async function TutorsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireAuth()
  const supabase = await createClient()

  const { data: tutors } = await supabase
    .from('tutor_profiles')
    .select(`
      *,
      user:users!tutor_profiles_user_id_fkey(display_name, avatar_url, role)
    `)
    .eq('is_available', true)
    .in('certification_status', ['approved'])
    .order('average_rating', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">講師一覧</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tutors?.map((tutor) => (
          <TutorCard key={tutor.id} tutor={tutor as any} locale={locale} />
        ))}
        {!tutors?.length && (
          <p className="text-muted-foreground col-span-full text-center py-12">
            現在利用可能な講師はいません
          </p>
        )}
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add tutor browse page with filtering"
```

---

### Task 8.2: Lesson Booking Server Action

**Files:**
- Create: `src/lib/actions/lessons.ts`

**Step 1: Create lesson booking action**

Create `src/lib/actions/lessons.ts`:
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function bookLesson(formData: {
  tutorId: string
  scheduledAt: string
  durationMinutes: 25 | 50
}) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return { error: 'Unauthorized' }
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, subscription_tier')
    .eq('id', authUser.id)
    .single()

  if (!user) {
    return { error: 'User not found' }
  }

  // Check tutor exists and get role
  const { data: tutor } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', formData.tutorId)
    .single()

  if (!tutor) {
    return { error: 'Tutor not found' }
  }

  const creditType = tutor.role === 'certified_tutor' ? 'lesson_certified' : 'lesson_community'

  // Check available credits
  const { data: credits } = await supabase
    .from('credits')
    .select('id, amount')
    .eq('user_id', user.id)
    .eq('type', creditType)
    .gt('amount', 0)
    .gt('expires_at', new Date().toISOString())
    .order('expires_at')
    .limit(1)

  if (!credits?.length) {
    return { error: 'レッスンクレジットが足りません。クレジットを購入してください。' }
  }

  // Deduct credit
  const credit = credits[0]
  await supabase
    .from('credits')
    .update({ amount: credit.amount - 1 })
    .eq('id', credit.id)

  // Create lesson
  const { data: lesson, error } = await supabase
    .from('lessons')
    .insert({
      learner_id: user.id,
      tutor_id: formData.tutorId,
      scheduled_at: formData.scheduledAt,
      duration_minutes: formData.durationMinutes,
    })
    .select()
    .single()

  if (error) {
    return { error: 'レッスンの予約に失敗しました' }
  }

  // Create notifications for both parties
  await supabase.from('notifications').insert([
    {
      user_id: user.id,
      type: 'lesson_reminder',
      title: 'レッスン予約完了',
      body: `レッスンが予約されました: ${new Date(formData.scheduledAt).toLocaleString('ja-JP')}`,
      action_url: `/dashboard/lessons/${lesson.id}`,
    },
    {
      user_id: formData.tutorId,
      type: 'lesson_reminder',
      title: '新しいレッスン予約',
      body: `新しいレッスンが予約されました: ${new Date(formData.scheduledAt).toLocaleString('ja-JP')}`,
      action_url: `/tutor/lessons/${lesson.id}`,
    },
  ])

  revalidatePath('/dashboard/lessons')
  return { success: true, lessonId: lesson.id }
}

export async function cancelLesson(lessonId: string) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return { error: 'Unauthorized' }
  }

  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()

  if (!lesson) {
    return { error: 'Lesson not found' }
  }

  if (lesson.learner_id !== authUser.id && lesson.tutor_id !== authUser.id) {
    return { error: 'Unauthorized' }
  }

  const hoursUntil = (new Date(lesson.scheduled_at).getTime() - Date.now()) / (1000 * 60 * 60)

  // Determine refund based on cancellation policy
  let refundAmount = 0
  if (hoursUntil >= 24) {
    refundAmount = 1 // full credit
  } else if (hoursUntil >= 2) {
    refundAmount = 0.5 // partial — we'll round up to 1 for simplicity since credits are integers
    refundAmount = 1 // simplify: full refund if > 2 hours
  }

  await supabase
    .from('lessons')
    .update({ status: 'canceled' })
    .eq('id', lessonId)

  // Refund credit if applicable
  if (refundAmount > 0) {
    const tutor = await supabase.from('users').select('role').eq('id', lesson.tutor_id).single()
    const creditType = tutor.data?.role === 'certified_tutor' ? 'lesson_certified' : 'lesson_community'

    await supabase.from('credits').insert({
      user_id: lesson.learner_id,
      type: creditType,
      amount: 1,
      source: 'subscription',
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }

  revalidatePath('/dashboard/lessons')
  return { success: true }
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add lesson booking and cancellation server actions"
```

---

## Phase 9: Lesson Room (Daily.co)

### Task 9.1: Daily.co Room Creation API

**Files:**
- Create: `src/app/api/lessons/room/route.ts`

**Step 1: Create the room creation endpoint**

Create `src/app/api/lessons/room/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { lessonId } = await request.json()

  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()

  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
  }

  if (lesson.learner_id !== user.id && lesson.tutor_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Return existing room if already created
  if (lesson.daily_room_url) {
    return NextResponse.json({ url: lesson.daily_room_url })
  }

  // Create Daily.co room
  const res = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      name: `lesson-${lessonId}`,
      properties: {
        max_participants: 2,
        enable_recording: 'cloud',
        exp: Math.floor(Date.now() / 1000) + lesson.duration_minutes * 60 + 600, // lesson + 10 min buffer
      },
    }),
  })

  const room = await res.json()

  // Save room URL to lesson
  await supabase
    .from('lessons')
    .update({ daily_room_url: room.url })
    .eq('id', lessonId)

  return NextResponse.json({ url: room.url })
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add Daily.co room creation API for lessons"
```

---

### Task 9.2: Lesson Room Page

**Files:**
- Create: `src/app/[locale]/(dashboard)/dashboard/lessons/[id]/page.tsx`
- Create: `src/components/lessons/lesson-room.tsx`

**Step 1: Create the lesson room component**

Create `src/components/lessons/lesson-room.tsx`:
```typescript
'use client'

import { useEffect, useState } from 'react'
import DailyIframe from '@daily-co/daily-js'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Phone, PhoneOff } from 'lucide-react'

interface LessonRoomProps {
  lessonId: string
  roomUrl?: string | null
}

export function LessonRoom({ lessonId, roomUrl: initialRoomUrl }: LessonRoomProps) {
  const [roomUrl, setRoomUrl] = useState(initialRoomUrl)
  const [callFrame, setCallFrame] = useState<ReturnType<typeof DailyIframe.createFrame> | null>(null)
  const [joined, setJoined] = useState(false)
  const [loading, setLoading] = useState(false)

  async function startCall() {
    setLoading(true)

    let url = roomUrl
    if (!url) {
      const res = await fetch('/api/lessons/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId }),
      })
      const data = await res.json()
      url = data.url
      setRoomUrl(url)
    }

    const frame = DailyIframe.createFrame(
      document.getElementById('daily-container')!,
      {
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: '0',
          borderRadius: '0.5rem',
        },
        showLeaveButton: true,
        showFullscreenButton: true,
      }
    )

    frame.on('left-meeting', () => {
      setJoined(false)
      frame.destroy()
      setCallFrame(null)
    })

    await frame.join({ url: url! })
    setCallFrame(frame)
    setJoined(true)
    setLoading(false)
  }

  function leaveCall() {
    callFrame?.leave()
    callFrame?.destroy()
    setCallFrame(null)
    setJoined(false)
  }

  useEffect(() => {
    return () => {
      callFrame?.destroy()
    }
  }, [callFrame])

  return (
    <div className="space-y-4">
      {!joined && (
        <div className="flex justify-center py-12">
          <Button onClick={startCall} disabled={loading} size="lg">
            <Phone className="mr-2 h-5 w-5" />
            {loading ? '接続中...' : 'レッスンを開始する'}
          </Button>
        </div>
      )}

      <div
        id="daily-container"
        className={`aspect-video w-full rounded-lg bg-black ${!joined ? 'hidden' : ''}`}
      />

      {joined && (
        <div className="flex justify-center">
          <Button variant="destructive" onClick={leaveCall}>
            <PhoneOff className="mr-2 h-4 w-4" />
            退出する
          </Button>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Create the lesson detail page**

Create `src/app/[locale]/(dashboard)/dashboard/lessons/[id]/page.tsx`:
```typescript
import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { LessonRoom } from '@/components/lessons/lesson-room'
import { Badge } from '@/components/ui/badge'

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: lesson } = await supabase
    .from('lessons')
    .select(`
      *,
      tutor:users!lessons_tutor_id_fkey(display_name, avatar_url),
      learner:users!lessons_learner_id_fkey(display_name, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (!lesson) notFound()

  if (lesson.learner_id !== user.id && lesson.tutor_id !== user.id) {
    notFound()
  }

  const scheduledDate = new Date(lesson.scheduled_at).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">レッスン</h1>
          <p className="text-muted-foreground">{scheduledDate} ({lesson.duration_minutes}分)</p>
        </div>
        <Badge>{lesson.status}</Badge>
      </div>

      <LessonRoom lessonId={lesson.id} roomUrl={lesson.daily_room_url} />
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add lesson room with Daily.co video integration"
```

---

## Phase 10: Landing Page & Pricing

### Task 10.1: Landing Page

**Files:**
- Modify: `src/app/[locale]/(public)/page.tsx`

**Step 1: Build the full landing page**

Replace `src/app/[locale]/(public)/page.tsx`:
```typescript
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { MessageSquare, BookOpen, Users, Mic, Star, Shield } from 'lucide-react'

export default function HomePage() {
  const t = useTranslations('landing')
  const tc = useTranslations('common')

  return (
    <main>
      {/* Hero */}
      <section className="container flex flex-col items-center justify-center gap-6 py-24 text-center">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          {t('hero.title')}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          {t('hero.subtitle')}
        </p>
        <div className="flex gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">{t('hero.cta')}</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/pricing">料金プラン</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{t('features.ai.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('features.ai.description')}</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{t('features.courses.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('features.courses.description')}</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{t('features.tutors.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('features.tutors.description')}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/50 py-16">
        <div className="container space-y-12">
          <h2 className="text-center text-3xl font-bold">学習の流れ</h2>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { step: '1', title: '無料登録', desc: 'メールまたはGoogleで簡単登録' },
              { step: '2', title: 'レベル選択', desc: 'CEFRレベルを選んでスタート' },
              { step: '3', title: '学習開始', desc: 'AI英会話・コース・レッスンで練習' },
              { step: '4', title: 'レベルアップ', desc: '継続的な学習で着実に成長' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Blue Connect Eikaiwa. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: build landing page with hero, features, and how-it-works sections"
```

---

### Task 10.2: Pricing Page

**Files:**
- Create: `src/app/[locale]/(public)/pricing/page.tsx`

**Step 1: Create pricing page**

Create `src/app/[locale]/(public)/pricing/page.tsx`:
```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    name_ja: 'フリー',
    price: '¥0',
    period: '',
    features: [
      'AI英会話テキストチャット（1日3回）',
      'コースプレビュー（1コース）',
      '講師プロフィール閲覧',
    ],
    cta: '無料で始める',
    highlighted: false,
  },
  {
    name: 'Pro',
    name_ja: 'プロ',
    price: '¥2,980',
    period: '/月',
    features: [
      'AI英会話テキストチャット（無制限）',
      'AI音声セッション（1日5回）',
      '全コースアクセス',
      'レッスン履歴',
      '学習分析',
    ],
    cta: 'プロプランを始める',
    highlighted: true,
  },
  {
    name: 'Premium',
    name_ja: 'プレミアム',
    price: '¥6,980',
    period: '/月',
    features: [
      'プロの全機能',
      'AI音声セッション（無制限）',
      '認定講師レッスン（月4回）',
      '優先予約',
      '発音レポート',
    ],
    cta: 'プレミアムを始める',
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <main className="container py-16">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold">料金プラン</h1>
        <p className="text-lg text-muted-foreground">
          あなたに合ったプランを選んで、英語学習を始めましょう
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.highlighted ? 'border-primary shadow-lg relative' : ''}
          >
            {plan.highlighted && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                おすすめ
              </Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle>
                <span className="text-lg">{plan.name_ja}</span>
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.highlighted ? 'default' : 'outline'}
                asChild
              >
                <Link href="/signup">{plan.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add pricing page with three subscription tiers"
```

---

## Phase 11: AI Voice (WebSocket Server)

### Task 11.1: Voice WebSocket Server Setup

**Files:**
- Create: `voice-server/package.json`
- Create: `voice-server/tsconfig.json`
- Create: `voice-server/src/index.ts`
- Create: `voice-server/src/voice-pipeline.ts`

**Step 1: Initialize the voice server project**

```bash
mkdir -p voice-server/src
cd voice-server
npm init -y
npm install ws @anthropic-ai/sdk dotenv
npm install -D typescript @types/ws @types/node tsx
```

**Step 2: Create tsconfig.json**

Create `voice-server/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "esModuleInterop": true
  },
  "include": ["src"]
}
```

**Step 3: Create voice pipeline**

Create `voice-server/src/voice-pipeline.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export interface VoiceSession {
  userId: string
  mode: 'voice_chat' | 'voice_immersive'
  scenario?: string
  level: string
  name: string
  messages: { role: 'user' | 'assistant'; content: string }[]
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  // Deepgram STT
  const res = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&language=en', {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
      'Content-Type': 'audio/webm',
    },
    body: audioBuffer,
  })

  const data = await res.json()
  return data.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? ''
}

export async function generateResponse(session: VoiceSession, userText: string): Promise<string> {
  session.messages.push({ role: 'user', content: userText })

  const systemPrompt = `You are a friendly English tutor. Student: ${session.name}, Level: ${session.level}. Keep responses concise (1-3 sentences) for voice mode. Correct errors gently.${session.scenario ? ` Scenario: ${session.scenario}` : ''}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    system: systemPrompt,
    messages: session.messages,
  })

  const text = response.content
    .filter((c) => c.type === 'text')
    .map((c) => c.text)
    .join('')

  session.messages.push({ role: 'assistant', content: text })
  return text
}

export async function synthesizeSpeech(text: string): Promise<Buffer> {
  const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  })

  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function scorePronunciation(audioBuffer: Buffer, referenceText: string): Promise<number> {
  // Azure Speech pronunciation assessment
  const endpoint = `https://${process.env.AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY!,
      'Content-Type': 'audio/webm',
      'Pronunciation-Assessment': Buffer.from(JSON.stringify({
        ReferenceText: referenceText,
        GradingSystem: 'HundredMark',
        Granularity: 'Phoneme',
      })).toString('base64'),
    },
    body: audioBuffer,
  })

  const data = await res.json()
  return data.NBest?.[0]?.PronunciationAssessment?.PronScore ?? 0
}
```

**Step 4: Create WebSocket server**

Create `voice-server/src/index.ts`:
```typescript
import { WebSocketServer, WebSocket } from 'ws'
import { config } from 'dotenv'
import { transcribeAudio, generateResponse, synthesizeSpeech, scorePronunciation, type VoiceSession } from './voice-pipeline'

config()

const PORT = parseInt(process.env.PORT || '8080')
const wss = new WebSocketServer({ port: PORT })

const sessions = new Map<WebSocket, VoiceSession>()

wss.on('connection', (ws) => {
  console.log('Client connected')

  ws.on('message', async (data, isBinary) => {
    try {
      if (!isBinary) {
        // JSON control messages
        const message = JSON.parse(data.toString())

        if (message.type === 'start') {
          sessions.set(ws, {
            userId: message.userId,
            mode: message.mode,
            scenario: message.scenario,
            level: message.level,
            name: message.name,
            messages: [],
          })
          ws.send(JSON.stringify({ type: 'ready' }))
          return
        }

        if (message.type === 'stop') {
          const session = sessions.get(ws)
          ws.send(JSON.stringify({
            type: 'session_end',
            messages: session?.messages ?? [],
          }))
          sessions.delete(ws)
          return
        }
      } else {
        // Binary audio data
        const session = sessions.get(ws)
        if (!session) return

        const audioBuffer = Buffer.from(data as Buffer)

        // 1. Transcribe
        const transcript = await transcribeAudio(audioBuffer)
        if (!transcript) return

        ws.send(JSON.stringify({ type: 'transcript', text: transcript }))

        // 2. Get AI response
        const response = await generateResponse(session, transcript)
        ws.send(JSON.stringify({ type: 'response_text', text: response }))

        // 3. Synthesize speech
        const speechBuffer = await synthesizeSpeech(response)
        ws.send(speechBuffer)

        // 4. Pronunciation score (async, non-blocking)
        scorePronunciation(audioBuffer, transcript).then((score) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'pronunciation', score }))
          }
        })
      }
    } catch (err) {
      console.error('Error processing message:', err)
      ws.send(JSON.stringify({ type: 'error', message: 'Processing error' }))
    }
  })

  ws.on('close', () => {
    sessions.delete(ws)
    console.log('Client disconnected')
  })
})

console.log(`Voice WebSocket server running on port ${PORT}`)
```

**Step 5: Add scripts to voice-server/package.json**

Add to scripts:
```json
"dev": "tsx watch src/index.ts",
"build": "tsc",
"start": "node dist/index.js"
```

**Step 6: Commit**

```bash
cd /Users/ramonvallejerajr/Developer/blue-connect-eikaiwa
git add -A
git commit -m "feat: add voice WebSocket server with Deepgram, Claude, ElevenLabs, and Azure Speech"
```

---

## Phase 12: Admin Dashboard

### Task 12.1: Admin Layout & Stats Page

**Files:**
- Create: `src/app/[locale]/(admin)/admin/layout.tsx`
- Create: `src/app/[locale]/(admin)/admin/page.tsx`

**Step 1: Create admin layout**

Create `src/app/[locale]/(admin)/admin/layout.tsx`:
```typescript
import { requireAdmin } from '@/lib/auth/guard'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  BarChart3,
  Settings,
} from 'lucide-react'

const adminLinks = [
  { href: '/admin', icon: LayoutDashboard, label: 'ダッシュボード' },
  { href: '/admin/users', icon: Users, label: 'ユーザー管理' },
  { href: '/admin/tutors', icon: GraduationCap, label: '講師管理' },
  { href: '/admin/courses', icon: BookOpen, label: 'コース管理' },
  { href: '/admin/analytics', icon: BarChart3, label: '分析' },
  { href: '/admin/settings', icon: Settings, label: '設定' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="flex h-screen">
      <aside className="hidden md:flex w-64 flex-col border-r bg-background">
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-lg font-bold text-primary">管理画面</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Step 2: Create admin dashboard page**

Create `src/app/[locale]/(admin)/admin/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, Calendar, TrendingUp } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: userCount },
    { count: tutorCount },
    { count: lessonCount },
    { count: courseCount },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('tutor_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('lessons').select('*', { count: 'exact', head: true }),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: '総ユーザー数', value: userCount ?? 0, icon: Users },
    { label: '講師数', value: tutorCount ?? 0, icon: TrendingUp },
    { label: '総レッスン数', value: lessonCount ?? 0, icon: Calendar },
    { label: 'コース数', value: courseCount ?? 0, icon: BookOpen },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">管理ダッシュボード</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add admin dashboard with stats overview"
```

---

## Phase 13: Progress & Gamification

### Task 13.1: XP & Streak Server Actions

**Files:**
- Create: `src/lib/actions/progress.ts`

**Step 1: Create progress tracking actions**

Create `src/lib/actions/progress.ts`:
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

const XP_VALUES = {
  exercise: 20,
  ai_chat: 30,
  ai_voice: 50,
  lesson: 100,
} as const

export async function awardXP(userId: string, activity: keyof typeof XP_VALUES) {
  const supabase = await createClient()
  const xp = XP_VALUES[activity]
  const today = new Date().toISOString().split('T')[0]

  const { data: user } = await supabase
    .from('users')
    .select('xp, streak_days, last_activity_date')
    .eq('id', userId)
    .single()

  if (!user) return

  let newStreak = user.streak_days
  const lastDate = user.last_activity_date

  if (lastDate !== today) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (lastDate === yesterdayStr) {
      newStreak = user.streak_days + 1
    } else if (lastDate !== today) {
      newStreak = 1
    }
  }

  await supabase
    .from('users')
    .update({
      xp: user.xp + xp,
      streak_days: newStreak,
      last_activity_date: today,
    })
    .eq('id', userId)
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add XP and streak tracking server actions"
```

---

### Task 13.2: Progress Dashboard Page

**Files:**
- Create: `src/app/[locale]/(dashboard)/dashboard/progress/page.tsx`

**Step 1: Create progress page**

Create `src/app/[locale]/(dashboard)/dashboard/progress/page.tsx`:
```typescript
import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flame, Star, BookOpen, MessageSquare, Mic } from 'lucide-react'

export default async function ProgressPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: conversations } = await supabase
    .from('ai_conversations')
    .select('mode, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  const { data: completedLessons } = await supabase
    .from('lessons')
    .select('id')
    .eq('learner_id', user.id)
    .eq('status', 'completed')

  const { data: courseProgress } = await supabase
    .from('learner_progress')
    .select('status')
    .eq('user_id', user.id)
    .eq('status', 'completed')

  const textChats = conversations?.filter((c) => c.mode === 'text_chat').length ?? 0
  const voiceSessions = conversations?.filter((c) => c.mode !== 'text_chat').length ?? 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">学習進捗</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">XP</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.xp.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">連続学習</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.streak_days}日</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CEFRレベル</CardTitle>
            <Badge variant="secondary">{user.english_level}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.english_level}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">完了レッスン</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedLessons?.length ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              AI テキストチャット
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{textChats} 回</p>
            <p className="text-sm text-muted-foreground">過去30日間</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              AI 音声セッション
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{voiceSessions} 回</p>
            <p className="text-sm text-muted-foreground">過去30日間</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add progress dashboard with XP, streak, and activity stats"
```

---

## Phase 14: Notifications & Email

### Task 14.1: Resend Email Utility

**Files:**
- Create: `src/lib/email/send.ts`

**Step 1: Create email sending utility**

Create `src/lib/email/send.ts`:
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendLessonReminder(params: {
  to: string
  learnerName: string
  tutorName: string
  scheduledAt: string
  lessonUrl: string
}) {
  const date = new Date(params.scheduledAt).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  await resend.emails.send({
    from: 'Blue Connect Eikaiwa <noreply@blueconnect.jp>',
    to: params.to,
    subject: `レッスンリマインダー: ${date}`,
    html: `
      <h2>レッスンリマインダー</h2>
      <p>${params.learnerName}さん、</p>
      <p>${params.tutorName}先生とのレッスンが近づいています。</p>
      <p><strong>日時:</strong> ${date}</p>
      <p><a href="${params.lessonUrl}">レッスンルームに入る</a></p>
      <p>Blue Connect Eikaiwa</p>
    `,
  })
}

export async function sendWeeklySummary(params: {
  to: string
  name: string
  streakDays: number
  xpEarned: number
  lessonsCompleted: number
  minutesPracticed: number
}) {
  await resend.emails.send({
    from: 'Blue Connect Eikaiwa <noreply@blueconnect.jp>',
    to: params.to,
    subject: '今週の学習レポート',
    html: `
      <h2>${params.name}さんの今週の学習レポート</h2>
      <ul>
        <li>連続学習: ${params.streakDays}日</li>
        <li>獲得XP: ${params.xpEarned}</li>
        <li>完了レッスン: ${params.lessonsCompleted}回</li>
        <li>学習時間: ${params.minutesPracticed}分</li>
      </ul>
      <p>来週も頑張りましょう！</p>
      <p>Blue Connect Eikaiwa</p>
    `,
  })
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add email utilities for lesson reminders and weekly summaries"
```

---

## Phase 15: Tutor Dashboard

### Task 15.1: Tutor Layout & Pages

**Files:**
- Create: `src/app/[locale]/(tutor)/tutor/layout.tsx`
- Create: `src/app/[locale]/(tutor)/tutor/page.tsx`
- Create: `src/app/[locale]/(tutor)/tutor/schedule/page.tsx`

**Step 1: Create tutor layout**

Create `src/app/[locale]/(tutor)/tutor/layout.tsx`:
```typescript
import { requireTutor } from '@/lib/auth/guard'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import Link from 'next/link'
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  UserCircle,
  Wallet,
} from 'lucide-react'

const tutorLinks = [
  { href: '/tutor', icon: LayoutDashboard, label: 'ダッシュボード' },
  { href: '/tutor/schedule', icon: Calendar, label: 'スケジュール' },
  { href: '/tutor/lessons', icon: BookOpen, label: 'レッスン' },
  { href: '/tutor/students', icon: Users, label: '生徒' },
  { href: '/tutor/profile', icon: UserCircle, label: 'プロフィール' },
  { href: '/tutor/earnings', icon: Wallet, label: '収益' },
]

export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireTutor()

  return (
    <div className="flex h-screen">
      <aside className="hidden md:flex w-64 flex-col border-r bg-background">
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-lg font-bold text-primary">講師画面</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {tutorLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Step 2: Create tutor dashboard page**

Create `src/app/[locale]/(tutor)/tutor/page.tsx`:
```typescript
import { requireTutor } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, Star, Wallet } from 'lucide-react'

export default async function TutorDashboardPage() {
  const user = await requireTutor()
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  const { data: todayLessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('tutor_id', user.id)
    .gte('scheduled_at', `${today}T00:00:00`)
    .lte('scheduled_at', `${today}T23:59:59`)
    .order('scheduled_at')

  const { data: profile } = await supabase
    .from('tutor_profiles')
    .select('average_rating, total_lessons')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">講師ダッシュボード</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">今日のレッスン</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayLessons?.length ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">総レッスン数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profile?.total_lessons ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">平均評価</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profile?.average_rating?.toFixed(1) ?? '-'}</div>
          </CardContent>
        </Card>
      </div>

      {todayLessons && todayLessons.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">今日のスケジュール</h2>
          <div className="space-y-2">
            {todayLessons.map((lesson) => (
              <Card key={lesson.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <span className="font-medium">
                    {new Date(lesson.scheduled_at).toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {lesson.duration_minutes}分
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add tutor dashboard layout and overview page"
```

---

## Phase 16: Final Polish

### Task 16.1: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Create CI workflow**

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - run: npm run lint

      - run: npm test

  build:
    runs-on: ubuntu-latest
    needs: lint-and-test

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: placeholder
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: pk_test_placeholder
          NEXT_PUBLIC_APP_URL: http://localhost:3000
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add GitHub Actions CI workflow"
```

---

### Task 16.2: CLAUDE.md Project Configuration

**Files:**
- Create: `CLAUDE.md`

**Step 1: Create CLAUDE.md**

Create `CLAUDE.md`:
```markdown
# Blue Connect Eikaiwa

ESL SaaS platform for Japanese English learners.

## Stack
- Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Supabase (auth, PostgreSQL, realtime, storage)
- Stripe (subscriptions, Connect payouts)
- AI: Claude API, Deepgram, ElevenLabs, Azure Speech
- Daily.co (video calls)
- Upstash Redis (rate limiting)
- next-intl (i18n: Japanese default, English secondary)

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm test` — run Vitest tests
- `npm run lint` — ESLint

## Structure
- `src/app/[locale]/(public)/` — public pages (landing, pricing)
- `src/app/[locale]/(dashboard)/` — learner dashboard
- `src/app/[locale]/(tutor)/` — tutor dashboard
- `src/app/[locale]/(admin)/` — admin dashboard
- `src/app/[locale]/(auth)/` — login, signup
- `src/app/api/` — API routes (Stripe webhooks, AI chat, Daily.co)
- `src/components/` — React components
- `src/lib/` — utilities, server actions, types
- `src/messages/` — i18n JSON files (ja.json, en.json)
- `voice-server/` — separate WebSocket server for real-time voice AI
- `supabase/migrations/` — database migrations

## Conventions
- Bilingual content: use `title` / `title_ja` pattern in DB
- Auth: use `requireAuth()` / `requireRole()` from `src/lib/auth/guard.ts`
- Server mutations: use Server Actions in `src/lib/actions/`
- Database types: `src/lib/types/database.ts`
- Supabase clients: `src/lib/supabase/client.ts` (browser), `server.ts` (server)
- All user-facing strings in `src/messages/` via next-intl
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add CLAUDE.md project configuration"
```

---

## Execution Summary

**Total Phases:** 16
**Total Tasks:** ~25

**Phase order and dependencies:**
1. Scaffolding (no deps)
2. Database (needs Supabase project)
3. Auth (needs Phase 1-2)
4. Layout & Nav (needs Phase 3)
5. Stripe Payments (needs Phase 3)
6. AI Text Chat (needs Phase 3, 5 for limits)
7. Course Platform (needs Phase 4)
8. Tutor Marketplace (needs Phase 4, 5)
9. Lesson Room (needs Phase 8)
10. Landing & Pricing (needs Phase 4)
11. AI Voice Server (independent, needs Phase 6 concepts)
12. Admin Dashboard (needs Phase 4)
13. Progress & Gamification (needs Phase 4)
14. Email Notifications (needs Phase 8)
15. Tutor Dashboard (needs Phase 4)
16. Final Polish (needs all above)
