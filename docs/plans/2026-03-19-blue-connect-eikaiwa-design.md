# Blue Connect Eikaiwa — Design Document

**Date:** 2026-03-19
**Status:** Approved

## Overview

Blue Connect Eikaiwa is a SaaS ESL platform targeting Japanese learners who want to learn English. It combines three learning pillars: AI-powered conversation practice, structured courses, and live 1-on-1 tutor lessons.

## Architecture

Monolithic Next.js 15 (App Router) application with Supabase as the backend, deployed on Vercel. A separate WebSocket server on Railway handles real-time AI voice conversations where serverless timeout limits would be a problem.

### Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 App Router, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes, Server Actions |
| Database | Supabase PostgreSQL with Row Level Security |
| Auth | Supabase Auth (email, Google, LINE OAuth) |
| Realtime | Supabase Realtime |
| Storage | Supabase Storage |
| Cache/Rate Limiting | Upstash Redis |
| AI Chat | Claude API (Anthropic) |
| Speech-to-Text | Deepgram |
| Text-to-Speech | ElevenLabs |
| Pronunciation | Azure Speech Services |
| Video Calls | Daily.co |
| Payments | Stripe (subscriptions + Connect for payouts) |
| Email | Resend |
| Voice Server | Railway (WebSocket) |
| Monitoring | Vercel Analytics + Sentry |
| CI/CD | GitHub Actions → Vercel |
| i18n | next-intl |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Vercel (Next.js 15)               │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Pages    │  │ Server       │  │ API Route     │  │
│  │  (App     │  │ Actions      │  │ Handlers      │  │
│  │  Router)  │  │ (mutations)  │  │ (AI streaming)│  │
│  └──────────┘  └──────────────┘  └───────────────┘  │
└──────────────┬──────────────────────┬────────────────┘
               │                      │
    ┌──────────▼──────────┐  ┌───────▼─────────────┐
    │     Supabase        │  │   External APIs      │
    │  - Auth (+ OAuth)   │  │  - Claude API        │
    │  - PostgreSQL DB    │  │  - Deepgram (STT)    │
    │  - Realtime         │  │  - ElevenLabs (TTS)  │
    │  - Storage (files)  │  │  - Azure Speech      │
    │  - Row Level Sec.   │  │  - Stripe            │
    └─────────────────────┘  │  - Daily.co          │
                             └──────────────────────┘
                    ┌──────────────────────┐
                    │  Railway (WebSocket)  │
                    │  Voice conversation   │
                    │  server for real-time │
                    │  AI voice sessions    │
                    └──────────────────────┘
```

## User Roles

| Role | Description |
|------|-------------|
| Learner | Japanese English learner — primary user |
| Community Tutor | Marketplace tutor, sets own rates |
| Certified Tutor | Blue Connect vetted tutor, standardized rates, badge |
| Admin | Platform admin — manages tutors, content, analytics |

## Subscription Tiers

| Tier | Price | Includes |
|------|-------|----------|
| Free | ¥0 | 3 AI text chats/day, 1 course preview, browse tutors |
| Pro | ~¥2,980/mo | Unlimited AI text chat, 5 AI voice sessions/day, full course access, lesson history |
| Premium | ~¥6,980/mo | Everything in Pro + 4 live tutor credits/mo (certified), priority booking, pronunciation reports |

### A La Carte Add-ons

| Item | Price |
|------|-------|
| Live lesson credit (Community Tutor) | Tutor sets rate (platform takes 15%) |
| Live lesson credit (Certified Tutor) | ~¥2,500/25min |
| Extra AI voice sessions (10-pack) | ~¥980 |

## Database Schema

### users
- id, email, full_name, display_name, native_language (default 'ja'), english_level (CEFR A1-C2), role, avatar_url, stripe_customer_id, subscription_tier, subscription_status, created_at, updated_at

### tutor_profiles
- id, user_id (FK), bio, bio_ja, hourly_rate, languages_spoken (jsonb), specialties (jsonb), certification_status, average_rating, total_lessons, is_available, created_at, updated_at

### lessons
- id, learner_id (FK), tutor_id (FK), scheduled_at, duration_minutes (25|50), status, daily_room_url, recording_url, tutor_notes, learner_rating, learner_review, created_at

### courses
- id, title, title_ja, description, description_ja, level (CEFR), category, thumbnail_url, is_published, sort_order, created_at, updated_at

### course_units
- id, course_id (FK), title, title_ja, content (jsonb), sort_order, created_at

### course_exercises
- id, unit_id (FK), type (multiple_choice|fill_blank|matching|reorder|free_response), question, question_ja, options (jsonb), correct_answer, explanation, explanation_ja, sort_order, created_at

### learner_progress
- id, user_id (FK), course_id (FK), unit_id (FK), status, score, completed_at, updated_at

### ai_conversations
- id, user_id (FK), mode (text_chat|voice_chat|voice_immersive), scenario, messages (jsonb), corrections (jsonb), duration_seconds, pronunciation_score, created_at

### credits
- id, user_id (FK), type (lesson_certified|lesson_community|ai_voice), amount, source (subscription|purchase), stripe_payment_id, expires_at, created_at

### tutor_availability
- id, tutor_id (FK), day_of_week (0-6), start_time, end_time, timezone, is_recurring

### notifications
- id, user_id (FK), type, title, body, is_read, action_url, created_at

## AI Tutor System

### Three Modes

1. **Text Chat** — Streaming chat with Claude, inline corrections, adapts to CEFR level, scenario/topic picker
2. **Voice Chat (Guided)** — Mic → Deepgram STT → Claude → ElevenLabs TTS → Speaker. Visual transcript alongside audio. Azure Speech pronunciation scoring per utterance.
3. **Immersive Roleplay** — Same voice pipeline with scenario context. Pre-built scenarios: restaurant, job interview, airport, business meeting, small talk, doctor's visit. End-of-session summary report.

### Voice WebSocket Flow

```
Client → audio chunk → Railway WS → Deepgram STT → Claude → ElevenLabs TTS → Client
                                  → Azure Speech → pronunciation score → Client
```

### Usage Limits

| Tier | Text Chat | Voice Sessions | Session Length |
|------|-----------|---------------|----------------|
| Free | 3/day | None | 5 min max |
| Pro | Unlimited | 5/day | 15 min max |
| Premium | Unlimited | Unlimited | 30 min max |

Tracked via Upstash Redis.

## Live Lessons & Tutor Marketplace

### Booking Flow

Learner browses/filters tutors → selects time slot → system checks credits → confirms booking → both parties get notifications + reminders (24hr, 1hr).

### Lesson Room

Daily.co video + shared real-time notepad (Supabase Realtime) + chat sidebar + lesson timer + opt-in recording + quick phrase panel (JP/EN).

### Tutor Types

| | Community | Certified |
|---|---|---|
| Onboarding | Self-register | Application + admin review |
| Pricing | Sets own rate | ¥2,500/25min standardized |
| Commission | 15% | 20% |
| Badge | None | "Blue Connect Certified" |
| Payouts | Monthly via Stripe Connect | Monthly via Stripe Connect |

### Cancellation Policy

- 24+ hours: full refund
- 2-24 hours: 50% refund
- < 2 hours / no-show (learner): no refund
- Tutor no-show: full refund + bonus credit

### Review System

Post-lesson rating (1-5) + optional review. Tutors below 3.5 (10+ reviews) flagged. Certified tutors below 4.0 risk losing certification.

## Course Platform

### Structure

Course → Units → Exercises. Each unit has rich content + exercises. Final assessment requires 70%+ to complete.

### Categories

Foundations (A1-A2), Daily Conversation (A2-B1), Business English (B1-B2), TOEIC Prep (A2-B2), EIKEN Prep (A1-B2), Travel English (A1-B1), Advanced Discussion (B2-C2).

### Exercise Types

Multiple choice, fill in the blank, matching, reorder, free response (AI-graded by Claude with bilingual feedback).

### Progress & Gamification

- Course progress bars
- Daily streak (consecutive days with any activity)
- XP system: exercises 10-50 XP, AI chat 30 XP, AI voice 50 XP, live lesson 100 XP
- CEFR progress indicator based on cumulative performance
- Weekly summary email (Japanese)

### Admin CMS

Rich text editor (Tiptap), drag-and-drop exercise builder, preview mode, course analytics.

## Page Structure

### Public
`/` (landing), `/pricing`, `/tutors` (browse), `/courses` (browse), `/login`, `/signup`

### Learner (`/dashboard`)
Overview, AI chat, AI voice, courses, course detail, lessons, lesson room, tutor browse, tutor profile, progress analytics, settings

### Tutor (`/tutor`)
Overview, schedule, lessons, lesson room, students, profile, earnings

### Admin (`/admin`)
Stats, users, tutor applications, course CMS, exercise builder, analytics, settings

## Internationalization

- Primary: Japanese (default), Secondary: English
- `next-intl` for UI strings
- Bilingual DB fields for content
- URL prefix: `/ja/...`, `/en/...`
- Default timezone: JST, user-configurable

## Payments

- Subscriptions via Stripe Checkout + webhooks
- A la carte credits via one-time Stripe Checkout (90-day expiration)
- Tutor payouts via Stripe Connect Express (monthly)

## Security

- Supabase RLS on all tables
- Stripe webhook signature verification
- Rate limiting on AI endpoints (Upstash)
- CSP headers, input sanitization, CORS restrictions
- Env vars via Vercel

## Performance Targets

| Metric | Target |
|--------|--------|
| Page load (LCP) | < 2.5s |
| AI text response (TTFB) | < 500ms |
| AI voice round-trip | < 2s |
| Video call connect | < 3s |
| Uptime | 99.9% |
