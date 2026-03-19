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
- Lazy initialization for SDK clients that need env vars (wrap in getter functions)
