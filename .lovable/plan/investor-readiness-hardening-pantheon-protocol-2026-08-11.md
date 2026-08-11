# Investor-Readiness Hardening — Pantheon Protocol

Goal: close the five gaps that a technical due-diligence reviewer would find first, without changing the product's identity or adding new personas.

## 1. Auth guard + real front door

- Add a route guard so `/` requires a session; unauthenticated visitors go to `/auth`.
- Add a real public landing route (`/`) → marketing/positioning page, and move the dashboard to `/app`. Landing gets: hero, the seven instructors, Academy/Studio/Classroom value props, "Launch Demo Mode" CTA, and proper SEO metadata.
- Result: a shareable public page for investors that does not leak the authenticated shell.

## 2. Remove or finish the theater

Anything that looks live but is not gets either finished or clearly labelled:

- `VoiceAssistant` — currently fully simulated with dead buttons. Either wire to the Web Speech API + the existing `chat` function, or move it behind a "Roadmap" label.
- `StatusBar` telemetry — label as ambient/system-flavor, or bind to real counts (messages, XP, generations).
- `GameLauncher` — the four `coming_soon` cards move into a visually distinct "Roadmap" row instead of sitting beside playable games.
- `ImageGeneration` video tab — hide until implemented.
- `web-search` and `hacker-news` — both are LLM-generated, not sourced. Relabel in the UI as "AI-synthesized briefing", or wire `hacker-news` to a real RSS/API source.

## 3. Fix the model selector contract

`ModelSelector` offers models the `chat` edge function's allow-list rejects, so those silently downgrade. Make the client list derive from a single shared constant used by both sides, and surface the actual model used in the response.

## 4. Security and data model

- Add the `user_roles` table + `has_role()` security-definer function (the architecture doc claims it exists; it does not). Needed before any instructor/admin capability is trustworthy.
- Run a security scan and resolve findings on `profiles`, `classrooms`, and the storage buckets.

## 5. Demo integrity

- Seed a realistic demo cohort: one classroom with several members, progress rows, and exercise completions, so Classroom analytics and leaderboards render populated instead of empty.
- Distinct PWA icons per size and a real screenshot in `manifest.json`; project-specific OG image.

## Technical notes

- Routing change: `App.tsx` gains `/app` plus a `RequireAuth` wrapper; `Index.tsx` stays the dashboard, new `pages/Landing.tsx` becomes `/`. `Auth.tsx` post-login redirect target becomes `/app`.
- Shared model list: new `src/lib/models.ts` imported by `ModelSelector`, mirrored in `supabase/functions/chat/index.ts`.
- Roles: one migration — enum, table, GRANTs, RLS, `has_role()`.
- Seeding: SQL inserts against `classroom_members`, `training_progress`, `exercise_completions`.
