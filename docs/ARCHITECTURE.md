# Architecture

## Overview

Pantheon Protocol is a single-page React app backed by Lovable Cloud (Supabase). All persistent state lives in Postgres with Row Level Security; long-running or third-party work happens in edge functions.

```text
┌──────────────────────────────────────────────────────────┐
│                      React SPA (Vite)                    │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐    │
│  │ Personas   │  │ Studio     │  │ Academy / Games  │    │
│  └─────┬──────┘  └─────┬──────┘  └────────┬─────────┘    │
│        └────────┬──────┴───────────┬──────┘              │
│                 │ Supabase JS SDK  │                     │
└─────────────────┼──────────────────┼─────────────────────┘
                  ▼                  ▼
        ┌──────────────────┐  ┌─────────────────────┐
        │  Postgres + RLS  │  │   Edge Functions    │
        │  Storage Buckets │  │  chat, web-search,  │
        │  Auth            │  │  sdxl-generate,     │
        └──────────────────┘  │  lora-train,        │
                              │  generate-image,    │
                              │  hacker-news        │
                              └──────────┬──────────┘
                                         ▼
                    ┌────────────────────────────────────┐
                    │  Lovable AI Gateway  │  Replicate  │
                    │  (Gemini, GPT)       │  (SDXL/LoRA)│
                    │            ↑ optional Tor proxy    │
                    └────────────────────────────────────┘
```

## Frontend layout

```
src/
├── components/
│   ├── chat/         ChatInterface, ConversationSidebar, AIAvatars, ModelSelector
│   ├── dashboard/    AppSidebar shell, InstructorRail, WorkspacePanel, StatusBar
│   ├── features/     ImageGeneration, SDXLPanel, LoraTrainer, CodeCanvas, GameLauncher
│   ├── games/        CipherBreak, HackThePlanet
│   ├── classroom/    InstructorView, StudentView, Leaderboard, Analytics
│   └── training/     CourseLibrary, CourseViewer, ExerciseRunner
├── contexts/         AuthContext, ThemeContext
├── hooks/            useAgentSettings, useChatHistory, useXP, useImageGallery, …
├── lib/              assistants.ts (persona definitions), offlineAI.ts (WASM Qwen)
└── pages/            Index, Auth, NotFound
```

`BrowserRouter` wraps every Context Provider — moving it breaks navigation inside contexts.

## Backend

### Tables (public schema)

- `profiles` — user metadata, avatar URL, level, XP
- `conversations`, `messages` — chat history per persona
- `user_agent_settings` — per-user × per-persona overrides (custom instructions, custom avatar, Tor toggle)
- `generated_images` — SDXL/Gemini outputs tracked in the `generated-images` bucket
- `lora_jobs` — Replicate training job state
- `user_roles` — `admin | moderator | user` via `has_role()` security-definer function
- Academy: `courses`, `lessons`, `exercises`, `user_progress`, `classrooms`, `enrollments`

All tables enable RLS. Roles never live on `profiles` — see [Security](./SECURITY.md).

### Storage buckets

| Bucket | Visibility | Use |
|---|---|---|
| `avatars` | public | profile + per-agent avatars |
| `generated-images` | public | SDXL / Gemini outputs |
| `lora-datasets` | private | training ZIP uploads (signed URLs) |

### Edge functions

| Function | Purpose |
|---|---|
| `chat` | Streams chat completions through the AI gateway; honors per-agent system prompts and custom instructions |
| `web-search` | Clear-web search; routes through `TOR_PROXY_URL` when the calling agent has `tor_enabled` |
| `generate-image` | Gemini / Nano-Banana image generation (free tier) |
| `sdxl-generate` | Replicate SDXL 1.0 / SDXL Lightning |
| `lora-train` | Kicks off a Replicate LoRA training run from a signed dataset URL |
| `hacker-news` | Curated infosec headline feed |

Most functions deploy with `verify_jwt = false`; auth-gated logic checks the user inside the handler.

## Environment-aware secrets

`getSecret(name)` resolves `${name}_DEV` on the dev branch and `${name}_PROD` on main, falling back to the bare name. This lets dev/prod use separate Replicate keys, Tor relays, etc., without code changes.

## Offline AI

`src/lib/offlineAI.ts` loads Qwen2.5-0.5B-Instruct via Transformers.js, caches the weights in IndexedDB, and exposes a streaming `generate()` for fully-offline persona chat. The first load is ~500 MB; subsequent loads are instant.

## PWA

`public/manifest.json` + `public/sw.js`. iOS Safari needs special background handling — see `mem://style/mobile-background-optimization`.
