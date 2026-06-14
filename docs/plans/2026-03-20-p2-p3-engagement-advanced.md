# P2 Engagement & P3 Advanced — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add engagement features (phrase review, study buddies, CEFR level-up) and advanced features (adaptive learning, recording playback) that drive retention and differentiation.

**Architecture:** P2 features layer on existing infrastructure (saved_phrases, email cron, achievements). P3 features introduce new capabilities. Scoped to what's buildable without external API dependencies (LINE deferred).

**Tech Stack:** Next.js 15, Supabase, TypeScript, Tailwind CSS, shadcn/ui, Resend (email)

---

## P2: Engagement & Growth

### Task 1: Phrase Book — Vocabulary Review with Spaced Repetition

saved_phrases already exists with CRUD. Add a flashcard review UI.

**Files:**
- Create: `src/app/[locale]/(dashboard)/dashboard/phrases/page.tsx`
- Create: `src/components/phrases/phrase-flashcard.tsx`
- Create: `src/components/phrases/phrase-list.tsx`
- Modify: `src/components/layout/dashboard-sidebar.tsx` (add nav item)

### Task 2: Study Buddies — Friends System

**Files:**
- Create: `supabase/migrations/20260320_add_friendships.sql`
- Create: `src/lib/actions/friends.ts`
- Create: `src/components/progress/friends-leaderboard.tsx`
- Modify: `src/lib/types/database.ts` (add Friendship type)

### Task 3: CEFR Level-Up Ceremony

**Files:**
- Create: `src/components/progress/level-up-modal.tsx`
- Modify: `src/lib/actions/progress.ts` (trigger on level change)

---

## P3: Advanced Features

### Task 4: Adaptive Learning Path

**Files:**
- Create: `src/lib/actions/adaptive-path.ts`
- Create: `src/components/dashboard/recommended-path.tsx`

### Task 5: Lesson Recording Playback

**Files:**
- Create: `src/components/lessons/recording-player.tsx`
- Modify: `src/app/[locale]/(dashboard)/dashboard/lessons/[id]/page.tsx`

### Task 6: CEFR Level-Up Assessment

**Files:**
- Create: `src/app/[locale]/(dashboard)/dashboard/assessment/page.tsx`
- Create: `src/components/progress/cefr-assessment.tsx`

### Task 7: Corporate B2B Portal — Foundation

**Files:**
- Create: `supabase/migrations/20260320_add_organizations.sql`
- Create: `src/lib/types/organization.ts`
- Create: `src/app/[locale]/(admin)/admin/organizations/page.tsx`
