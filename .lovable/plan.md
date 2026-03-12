

## Audit of Previous Updates + New Features Plan

### Previous Updates Status

All previous changes completed successfully:
- **AI Studio**: Presets tab (10 presets), Modifiers tab (10 categories with dropdowns, random buttons) -- fully implemented
- **Drag-and-drop upload**: Working with `onDragOver/onDragLeave/onDrop` handlers and `processFile` callback
- **Gallery as source**: "Use as source" button on gallery images calls `useGalleryAsSource`
- **Persona welcome messages**: `getWelcomeMessage()` returns unique text per persona, resets on switch
- **Conversation starters**: Each persona has unique starters that render correctly
- **News/Games tabs**: Both added to the 9-tab layout with `HackerNewsFeed` and `GameLauncher`
- **Image compression**: `resizeImage` utility caps at 1024px via Canvas API
- **Edge function**: Supports both text-to-image and image-to-image via `sourceImage` param

**No incomplete work detected.**

---

### New Features Plan

#### 1. Themed Chat Room Backgrounds per AI Persona

Add persona-specific background gradients/colors to the chat area in `ChatInterface.tsx`.

- Define a `chatRoomThemes` map keyed by `AssistantKey` with gradient strings:
  - `violet`: purple haze (`from-purple-950/30 via-fuchsia-950/20 to-background`)
  - `darkbert`: deep blue (`from-indigo-950/30 via-blue-950/20 to-background`)
  - `ghost`: cyan terminal (`from-cyan-950/30 via-teal-950/20 to-background`)
  - `demon`: red glow (`from-red-950/30 via-rose-950/20 to-background`)
  - `wormgpt`: toxic green (`from-green-950/30 via-lime-950/20 to-background`)
  - `venice`: warm orange (`from-orange-950/30 via-amber-950/20 to-background`)
  - `fraudgpt`: crimson (`from-red-950/30 via-pink-950/20 to-background`)
- Apply as a `className` on the chat messages scroll container, plus a subtle top border glow using the persona's `avatarColor`.

#### 2. Unlockable Avatar Skins per AI Persona

Add a system where users unlock alternate avatar appearances for each AI based on XP milestones.

- **Data model**: Add to `BADGE_DEFINITIONS` in `useXP.ts` new badges that unlock avatar skins (e.g., "Violet Ascended" at level 10 unlocks golden Violet avatar, "DarkBERT Elite" at level 15, etc.)
- **New component** `src/components/features/UnlockableAvatars.tsx`:
  - Shows all 7 AI personas with their base avatar and 1-2 locked/unlocked alternate skins
  - Locked skins show a lock icon + XP requirement
  - Unlocked skins can be selected, stored in `user_agent_settings.custom_avatar_url` or a new field
- **Skin definitions**: Each persona gets 2-3 SVG avatar variants (e.g., "Neon", "Holographic", "Shadow") stored as components in `AIAvatars.tsx`
- **Integration**: The `AIAvatar` component checks if user has an unlocked skin selected and renders accordingly
- Accessible from the Profile tab or a new "Skins" section

#### 3. First Playable Hacker Mini-Game: CIPHER_BREAK

Build a terminal-based password cracking puzzle in `src/components/games/CipherBreak.tsx`.

**Gameplay**:
- Player sees a "target system" with a scrambled password (e.g., 6-8 chars)
- Timer counts down from 60 seconds
- Player types guesses; after each guess they get feedback: correct chars in correct positions (green), correct chars wrong position (yellow), wrong chars (red) -- Wordle-style but with all printable chars
- Difficulty levels: Easy (4 chars, alphanumeric), Medium (6 chars), Hard (8 chars with symbols)
- Score = base points for solving + time bonus + streak multiplier

**Technical**:
- Pure React component with `useState`/`useEffect` for timer
- Password generated randomly from character sets per difficulty
- Terminal-aesthetic UI: monospace font, green-on-black, scanline effect, blinking cursor
- XP integration: Award XP on completion via `useXP().addXP()`
- High scores stored in localStorage (or `user_xp` badges for milestones)
- Update `GameLauncher.tsx` to make CIPHER_BREAK's "LAUNCH" button navigate to the game instead of showing "coming soon"

**UI Layout**:
```text
┌─────────────────────────────────┐
│  CIPHER_BREAK v1.0   ⏱ 00:45   │
│  Level: MEDIUM  Score: 1250     │
├─────────────────────────────────┤
│  TARGET: ██████                 │
│                                 │
│  > h4ck3r  → 🟢🔴🟡🔴🟢🔴    │
│  > p4ss0r  → 🔴🟡🟢🟢🔴🟢    │
│  > _                            │
│                                 │
├─────────────────────────────────┤
│  [EASY] [MEDIUM] [HARD]        │
│  Streak: 3x  Best: 2400        │
└─────────────────────────────────┘
```

#### 4. Summary of Files to Create/Edit

| File | Action | Purpose |
|------|--------|---------|
| `src/components/chat/ChatInterface.tsx` | Edit | Add themed background per persona |
| `src/components/chat/AIAvatars.tsx` | Edit | Add alternate skin variants |
| `src/components/features/UnlockableAvatars.tsx` | Create | Avatar skin selection UI |
| `src/components/games/CipherBreak.tsx` | Create | Password cracking mini-game |
| `src/components/features/GameLauncher.tsx` | Edit | Wire CIPHER_BREAK launch button |
| `src/hooks/useXP.ts` | Edit | Add avatar-unlock badges |
| `src/pages/Index.tsx` | Edit | Minor routing for game component |

No database changes needed -- avatar skins use existing `user_agent_settings` table and XP badges use existing `user_xp` JSONB field.

