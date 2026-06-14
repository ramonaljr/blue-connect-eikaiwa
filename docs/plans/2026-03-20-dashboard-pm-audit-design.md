# Dashboard PM Audit & Feature Roadmap

**Date:** 2026-03-20
**Strategy:** Approach C — AI-Powered Hybrid Platform
**Monetization:** Balanced hybrid (AI engagement + tutor revenue)
**Stage:** Pre-launch MVP → targeting soft launch

---

## Strategic Direction

Use AI as the daily engagement engine and tutors as the high-value conversion event. Build a continuous loop: AI practice → tutor session → AI review → targeted practice. No competitor in the Japan market executes this hybrid well.

**Competitive frame:** All angles — Japan-market English apps, AI-first platforms, and hybrid AI + human tutor platforms.

---

## Current State Summary

### Strengths
- 12 dashboard pages, 70+ components, fully bilingual (JA/EN)
- AI Chat with 11 scenarios + customizable AI personality/correction level
- AI Voice with 3 modes (chat, roleplay, pronunciation) — gated behind Pro
- 7 exercise types with hints, retry, scoring
- Tutor marketplace with booking, Daily.co video, post-lesson reviews
- Gamification: XP, streaks, achievements (11 categories), leaderboard, goals, heatmap
- Solid architecture: Next.js 15, Supabase, Stripe, proper auth guards

### Critical Weaknesses
1. **Cold start** — Dashboard shows all zeros for new users
2. **No onboarding flow** — Users land on empty dashboard with no guidance
3. **Empty course catalog** — Zero courses in database
4. **Empty tutor marketplace** — Zero tutors available
5. **Gamification partially wired** — todayXP null, todayMinutes placeholder, skill scores default to zeros
6. **No placement test** — Users self-select CEFR (most don't know their level)
7. **AI Voice paywall is bare** — No preview, no sample, just text + button
8. **Hydration errors on every page** — Script tag rendering issue
9. **Untranslated filter labels** — "all", "recommended" in English on Japanese UI

---

## Feature Roadmap

### P0 — Launch Prerequisites (Fix Cold Start)

| # | Feature | Description | Effort |
|---|---------|-------------|--------|
| 1 | Onboarding Wizard | 3-step: placement quiz → goal setting → first AI chat | Med |
| 2 | Seed Course Content | 5-10 courses (Foundations A1-A2, Daily Conversation, TOEIC) | High (content) |
| 3 | AI Quick-Start | Auto-launch guided first AI conversation post-onboarding | Low |
| 4 | Fix XP/Streak Wiring | Connect todayXP, todayMinutes, skill scores to real data | Med |
| 5 | Seed Tutor Profiles | Recruit 5-10 tutors, add featured tutor cards on dashboard | Low (ops) |

### P1 — Competitive Differentiators (Build Moat)

| # | Feature | Description |
|---|---------|-------------|
| 6 | AI → Tutor Handoff | Post-AI-chat suggestion to book tutor for struggled topics. Auto-generate lesson prep from conversation. |
| 7 | Post-Lesson AI Review | AI generates review from tutor session notes. Creates personalized exercises. |
| 8 | Pronunciation Journey | Track pronunciation over time. Focus on JA-specific phonemes (L/R, TH, V/B). |
| 9 | JLPT/TOEIC/EIKEN Prep | Timed practice, mock tests, score prediction. |
| 10 | Today's Mission System | Daily personalized micro-challenges with bonus XP. |

### P2 — Engagement & Growth

| # | Feature | Description |
|---|---------|-------------|
| 11 | Phrase Book / Vocab Review | Surface saved_phrases with spaced repetition flashcards. |
| 12 | Weekly Progress Email | Activate existing cron job with email template. |
| 13 | AI Voice Paywall Upgrade | 30-sec demo, sample score, before/after examples. |
| 14 | Study Buddies / Friends | Add friends, see streaks, challenge each other. |
| 15 | LINE Notifications | Push reminders via LINE (95% penetration in Japan). |

### P3 — Advanced (Post-Launch)

| # | Feature | Description |
|---|---------|-------------|
| 16 | Adaptive Learning Path | AI-generated personalized course sequences. |
| 17 | Lesson Recording Playback | Re-watch sessions with AI-annotated corrections. |
| 18 | Group Lessons | 2-4 learners + 1 tutor for lower-cost sessions. |
| 19 | Corporate B2B Portal | Company admin, team progress, bulk billing. |
| 20 | CEFR Level-Up Ceremony | Assessment + celebration animation on level progression. |

### Quick UX Wins (Days, Not Weeks)

1. Translate filter dropdowns ("all" → "すべて")
2. Add empty state illustrations with CTAs
3. Fix streak fire animation for 1+ day streaks
4. Fix /api/ai/tip 404 or hide component gracefully
5. AI Voice paywall — show interface preview
6. Hide empty progress tabs or show "unlock" previews
7. Fix hydration errors (script tag rendering)

---

## Key Architectural Decision

**The AI → Tutor → AI Flywheel** is the core differentiator. Data flow:

```
AI Chat (ai_conversations)
  → identifies weak areas (skill_profiles)
  → suggests tutor booking (lesson_preparations auto-filled)
  → tutor session (lessons + lesson_notes)
  → AI generates review exercises (course_exercises)
  → targeted practice → AI Chat again
```

All tables already exist in the schema. The flywheel is an orchestration layer, not a rebuild.

---

## Success Criteria

- **Day 1 retention:** >40% (requires onboarding + AI quick-start)
- **Week 1 streak rate:** >25% (requires gamification wiring)
- **Free → Pro conversion:** >5% (requires voice paywall upgrade + AI value demonstration)
- **First tutor booking rate:** >10% of active users within 30 days
- **AI sessions per user per week:** >3 (requires Today's Mission + variety)
