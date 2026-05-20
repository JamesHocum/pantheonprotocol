# Pantheon Protocol

> Cyberpunk Cafe for ethical hackers — seven AI personas, a live code canvas, an SDXL studio, a Hacker Academy, and an arcade of infosec mini-games. Built on React + Vite + Tailwind, powered by Lovable Cloud.

**Live:** https://pantheonprotocol.lovable.app

---

## What it is

Pantheon Protocol is a learning platform disguised as a neon-lit late-night cafe. You walk in, pick a seat at the bar, and a roster of AI assistants — each with their own personality, expertise, and visual theme — help you learn offensive security, defensive hardening, and the surrounding craft.

It is built around three pillars:

1. **Personas** — seven distinct AI agents (LadyViolet, DarkBERT, GhostGPT, DemonGPT, WormGPT, Venice, FraudGPT) that you can chat with, customize, and assign to different tasks.
2. **Studio** — a creative workbench: live JavaScript code canvas, SDXL image generation, LoRA training, and a multi-model AI gateway.
3. **Academy** — structured CTF-style curriculum taught by LadyViolet, with XP, levels (1–50), badges, a leaderboard, and a Classroom mode for instructors.

## Features at a glance

- **7 AI personas** with custom system prompts, conversation starters, themed avatars, and per-agent settings (custom instructions, custom avatar upload, Tor toggle)
- **Multi-model gateway** — 10+ LLMs (Gemini 2.5/3.x, GPT-5 family) routed through a single key
- **Offline AI** — Qwen2.5-0.5B-Instruct in WebAssembly via IndexedDB for no-network use
- **SDXL Studio** — SDXL 1.0 and SDXL Lightning via Replicate, with a results gallery and a free-model fallback
- **LoRA Trainer** — upload dataset ZIPs, tune steps / rank / learning rate, kick off training jobs
- **Live Code Canvas** — real-time JS workspace with hot eval
- **Web Search + Tor** — clear-web search plus optional proxy routing through `TOR_PROXY_URL`
- **Gamification** — XP, levels 1–50, milestone badges, unlockable avatars
- **Hacker Academy** — LadyViolet-instructed curriculum, CTF challenges, progress tracking
- **Classroom mode** — instructor analytics, leaderboard, assignment tracking
- **Arcade** — `CIPHER_BREAK` (cryptanalysis puzzle) and `HACK THE PLANET` (terminal-hacking sim)
- **Hacker News feed** — curated infosec headlines
- **Era skins** — 80s / 90s / 00s / 20s visual themes with matching fonts and ambient audio
- **PWA** — installable, offline-capable, mobile-optimized backgrounds

## Tech stack

- **Frontend:** React 18, Vite 5, TypeScript 5, Tailwind CSS v3, shadcn-ui, Motion
- **Backend:** Lovable Cloud (managed Supabase) — Postgres + RLS, Storage, Auth, Edge Functions
- **AI:** Lovable AI Gateway (Gemini + GPT families), Replicate (SDXL / LoRA), local Qwen2.5 WASM
- **Auth:** email/password with auto-confirm, Google OAuth ready
- **PWA:** service worker, manifest, iOS background optimization

## Quick start

```bash
git clone <repo-url>
cd pantheon-protocol
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Lovable Cloud handles the backend automatically — no `.env` editing required.

### Optional secrets

Configured in Lovable Cloud → Secrets:

| Secret | Purpose |
|---|---|
| `REPLICATE_API_TOKEN` | SDXL image generation + LoRA training |
| `TOR_PROXY_URL` | Routes outbound edge-function traffic through a SOCKS/HTTP relay |
| `LOVABLE_API_KEY` | Auto-provisioned for the AI gateway |

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) — system overview, data flow, edge functions
- [Personas](./docs/PERSONAS.md) — the seven agents and how to customize them
- [Studio](./docs/STUDIO.md) — code canvas, SDXL, LoRA
- [Academy](./docs/ACADEMY.md) — curriculum, XP, classrooms
- [Security](./docs/SECURITY.md) — ethical-use policy, RLS model, secrets
- [Contributing](./docs/CONTRIBUTING.md) — coding conventions, design system

## Ethical use

Pantheon Protocol teaches **defensive** security and **authorized** testing only. Every agent is prompted to refuse instructions for illegal activity and to redirect toward detection, mitigation, and protection. Don't use this platform — or anything you learn here — against systems you don't own or aren't explicitly authorized to test.

## License

MIT — see [LICENSE](./LICENSE).
