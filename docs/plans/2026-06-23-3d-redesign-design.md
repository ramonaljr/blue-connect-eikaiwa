# 3D / WebGL Redesign — Design Document

**Date:** 2026-06-23
**Branch:** `feat/3d-redesign`
**Scope:** Full visual redesign of Landing, Login/Signup, Dashboard home, and all 10 dashboard modules with real WebGL 3D and bold, immersive motion.

## Decisions (locked)

| Decision | Choice |
|---|---|
| 3D technique | **Full WebGL everywhere** (Three.js / react-three-fiber) |
| Phasing | **Everything in one pass** (all 13 surfaces) |
| Intensity | **Bold & immersive** |
| Canvas architecture | **Option A — one global canvas + DOM-tracked `<View>` regions** |
| Verification | **Playwright MCP visual verification** of every surface |

## Why one global canvas (Option A)

Browsers cap live WebGL contexts (~16). Mounting a `<Canvas>` per surface (and per nested component) would exhaust contexts and multiply GPU/CPU cost. A single `<Canvas>` mounted in the app shell, with each surface declaring lightweight `@react-three/drei` `<View>` regions tracked to DOM elements, gives: one context, one render loop, shared geometry/materials, cross-route continuity, and a single global kill-switch for fallbacks. This is the only pattern that makes "WebGL on every surface + bold" affordable on data-heavy dashboard pages and Japanese mobile networks.

## Architecture

- **Server/client split is preserved.** Every route stays a server component that fetches data via Supabase and `requireAuth()`/`requireRole()`. All 3D lives inside the existing client `*-content.tsx` components. No data-fetching, auth, or RLS changes.
- **Global canvas** mounted once in `src/app/[locale]/layout.tsx` via a client-only `dynamic(ssr:false)` `<SceneCanvas>`, using `eventSource={document.body}`, `frameloop="demand"` (upgraded to `"always"` on the landing hero).
- **Theme bridge.** Scene colors read the existing OKLCH design tokens (converted to linear RGB) and the hand-rolled `.dark` class signal (set in `layout.tsx` via the localStorage script), so 3D matches light/dark.

### Capability tiers — the safety net

`useDepthCapability()` returns a tier:

- `full` — WebGL2 + no reduced-motion + capable device → full scenes, postprocessing.
- `lite` — capable but constrained (coarse pointer / low cores / `deviceMemory`) → simpler geometry, no heavy postprocessing, `frameloop="demand"`.
- `off` — no WebGL, or `prefers-reduced-motion` → **fall back to the existing `.bg-gradient-mesh` + framer-motion**. No canvas mounts.

Signals: WebGL2 support probe, `prefers-reduced-motion`, `navigator.hardwareConcurrency`, `navigator.deviceMemory`, coarse-pointer / mobile media query.

## The shared "Depth System" (reusable kit) — `src/components/three/`

- `SceneCanvas` — the single global `<Canvas>` + tunnel host + `<Preload>`.
- `View3D` — wrapper around drei `<View>` so any DOM region hosts a scene through the one canvas.
- `ShaderBackdrop` — animated fbm mesh-gradient plane in brand blue/amber; slow drift + pointer parallax.
- `GlassObjects` — soft glassy primitives (rounded bubbles, torus) via `MeshTransmissionMaterial`.
- `ParticleField` — GPU-instanced word/letter motes for depth.
- `FloatRig` / `ParallaxRig` — pointer + scroll reactive multi-Z-layer wrappers.
- `TiltCard` — CSS `preserve-3d` hover-tilt for DOM cards (near-zero cost; used heavily on dashboards).
- `Postprocessing` — Bloom + subtle chromatic aberration + vignette (DOF added on the Landing hero).
- `useDepthCapability` — tier detection hook.

Existing `src/components/ui/motion.tsx` helpers (`SectionReveal`, `StaggerContainer`, `AnimatedCounter`, `ProgressRing`, `FloatingElement`) are kept and layered on top of the 3D.

## Per-surface plan

### Landing (`src/app/[locale]/(public)/page.tsx`)
Full-bleed scroll-driven hero in the global canvas: floating glass conversation bubbles + instanced word-particle cloud orbiting a brand-blue core on `ShaderBackdrop`; camera/group reacts to pointer parallax and **scroll progress** (objects disperse/re-form). Bloom + DOF. Section accents (stats, problem→solution, feature tabs, how-it-works, testimonials) get `View3D` accents and `TiltCard`s, keeping existing reveal/stagger choreography. Landing mockups re-mounted on tilted glass panels. `off` tier → current gradient-mesh hero.

### Login / Signup (`src/app/[locale]/(auth)/login`, `/signup`)
Left brand panel → live WebGL scene (rotating glass orb / aurora shader + motes). `LoginForm` floats on a `TiltCard` glass panel with pointer parallax. Mobile (panel hidden) → compact ambient backdrop behind the form.

### Dashboard home (`src/components/.../dashboard-content.tsx`)
Welcome band gets ambient `View3D` with floating XP/streak orbs; `ProgressRing` upgraded to a 3D torus ring in a `View3D`; stat cards + quick actions become `TiltCard`s with depth shadow. `frameloop="demand"` + `lite` motifs so data stays primary.

### 10 modules — themed motifs (lazy `View3D`, instanced, demand-rendered)

| Module | 3D motif |
|---|---|
| ai-chat | floating message-bubble cluster, reacts to send |
| ai-voice | audio-reactive distorted sphere / waveform |
| assessment | animated 3D gauge / score dial |
| courses | floating stack of glass "books" |
| lessons | orbiting calendar tokens |
| tutors | orbiting tutor-avatar ring |
| progress | 3D bars + XP heatmap on a tilted plane |
| phrases | 3D flashcard flip |
| onboarding | guided multi-step 3D journey/path |
| settings | calm ambient backdrop only |

Data UIs are wrapped, not rewritten.

## Performance guardrails

- Single canvas + instancing + `frameloop="demand"` on modules; `<View>` regions cull when offscreen.
- `three` imported via `dynamic(ssr:false)` and route-code-split; dashboard data pages don't pay until a canvas mounts.
- Capability tiers gate everything; `prefers-reduced-motion` freezes to a static frame.

## Testing

Vitest (configured). Unit-test logic, not pixels:
- `useDepthCapability` tier decisions across mocked signals.
- WebGL/reduced-motion fallback path (returns static, no canvas).
- Each redesigned page renders without crashing (canvas mocked).

## Visual verification (Playwright MCP)

After each surface is built:
- Navigate to every redesigned route (landing, login, signup, dashboard home, all 10 modules).
- Screenshot in **light + dark** and **desktop + mobile** viewports.
- Confirm WebGL scenes render, and that forced `off`/reduced-motion **fallback** renders correctly.
- Check console for WebGL/runtime errors; watch for dropped frames.

## Out of scope

- No changes to data fetching, auth, RLS, Stripe, or Supabase schema.
- No new copy/i18n keys beyond what new visual sections strictly require.
