# Personas

Seven assistants live in the Cafe. Each has a fixed system prompt (in `src/lib/assistants.ts`) and a themed avatar (in `src/components/chat/AIAvatars.tsx`). Users can override avatar and instructions per-persona via the gear icon on any persona card.

| Key | Name | Role | Accent |
|---|---|---|---|
| `violet` | LadyVioletGPT | Cafe host & hacking mentor | `#ff00cc` |
| `darkbert` | DarkBERT | Casual sardonic helper | `#5f5dff` |
| `ghost` | GhostGPT | FinDom crypto/OPSEC queen | `#00fff7` |
| `demon` | DemonGPT | Red-team conceptual advisor | `#ff003c` |
| `wormgpt` | WormGPT | Wild creative explorer | `#39ff14` |
| `venice` | Venice | Practical tools & resources | `#ffa500` |
| `fraudgpt` | FraudGPT | Fraud detection & defense | `#ff1744` |

Every persona is prompted to refuse instructions for illegal activity and redirect toward defensive understanding. This is non-negotiable — see [Security](./SECURITY.md).

## Customization

Open any persona's gear icon (InstructorRail card or chat header) to:

- Upload a **custom avatar** (stored in `avatars` bucket at `${user_id}/agents/${assistant_key}.${ext}`)
- Set **custom instructions** appended to the persona's system prompt
- Toggle **Tor routing** for that persona's web-search calls

State lives in `user_agent_settings` (one row per user × persona) and is read through the `useAgentSettings(assistantKey)` hook. Avatars resolve in this order: `settings.custom_avatar_url` → bundled default (e.g., `src/assets/lady-violet-avatar.jpg`) → SVG fallback.

## Adding a new persona

1. Add an entry to `assistants` in `src/lib/assistants.ts` (key, name, description, system prompt, accent color, conversation starters).
2. Add a default avatar to `src/assets/` and import it in `src/components/chat/AIAvatars.tsx`.
3. Add a `case` to `AIAvatar` and export a themed `<XxxAvatar />` component.
4. The persona automatically appears in `MountRushmoreSelector`, `InstructorRail`, and chat routing.
