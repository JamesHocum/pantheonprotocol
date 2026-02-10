

## Era Theme Visual Polish + Live Wiring + Testing

### Overview

This plan adds visual polish to era themes (Google Fonts, era-specific animations, sound effects), and ensures all existing features are properly wired and functional rather than prototype stubs. It also addresses testing the PWA install flow, model selector, and era theme switching.

---

### Phase 1: Google Fonts for Each Era

**Update `index.html`**

Add Google Fonts preconnect and font imports:
- **1980s**: `Press Start 2P` (pixel arcade font)
- **1990s**: `VT323` (terminal monospace)
- **2000s**: `Trebuchet MS` already available system-wide; add `Tahoma` fallback
- **2020s**: `JetBrains Mono` (modern dev font)

**Update `src/styles/era-themes.css`**

Replace placeholder font references with the imported Google Fonts and add proper fallback stacks.

---

### Phase 2: Era-Specific Animations and Effects

**Update `src/styles/era-themes.css`** with new keyframes and effects per era:

**1980s - Arcade Era:**
- CRT screen flicker animation on the body overlay
- Pixel text shadow on headings
- Arcade-style button press animation (scale down + color flash)
- Rainbow border shimmer on active cards

**1990s - Matrix Era:**
- Digital rain background effect (CSS-only falling characters)
- Terminal typing cursor on input fields
- Glitch text effect on `.neon-text` elements
- Green phosphor glow on all text

**2000s - Web 2.0 Era:**
- Glossy/aqua button shine sweep animation
- Drop shadow depth on cards (classic Web 2.0 raised look)
- Rounded corners increased to match 2000s bubbly aesthetic
- Gradient text on headings

**2020s - Cyberpunk Era (current default):**
- Keep existing neon-pulse and cyber-glow
- Add subtle holographic shimmer on cards
- Glassmorphism blur enhancement

---

### Phase 3: Sound Effects System

**Create `src/hooks/useEraSound.ts`**

A lightweight hook that plays short sound effects using the Web Audio API (no external files needed -- generate tones programmatically):

| Era | Click Sound | Success Sound | Error Sound |
|-----|-------------|---------------|-------------|
| 1980s | Arcade "blip" (square wave 440Hz, 50ms) | Coin collect (ascending arpeggio) | "Game Over" descending tone |
| 1990s | Keyboard "tick" (noise burst, 30ms) | Modem-style chirp | Dial-up disconnect buzz |
| 2000s | Soft click (sine wave 600Hz, 40ms) | Windows-style chime (C-E-G chord) | Gentle error bonk |
| 2020s | Cyber "zap" (sawtooth 800Hz, 60ms) | Neon power-up sweep | Glitch static burst |

- Sounds generated via `AudioContext` and `OscillatorNode` -- zero file downloads
- Volume control via a `soundEnabled` setting in localStorage
- Hook: `useEraSound()` returns `{ playClick, playSuccess, playError }`

**Wire sounds into components:**
- `EraSkinToggle.tsx` -- play click on theme selection, success on theme change
- `ExerciseRunner.tsx` -- success/error on answer check
- `ChatInterface.tsx` -- click on send message
- Tab switches in `Index.tsx` -- subtle click

---

### Phase 4: Wire Era Theme Switching to Work Live

**Current issue**: The `EraSkinToggle` component reads `isEraUnlocked` which requires badges. For testing and immediate usability, add a **dev/demo mode** that unlocks all eras for anonymous users or when no badges exist yet.

**Update `src/contexts/ThemeContext.tsx`:**
- For anonymous users: unlock all eras (so theme switching can be tested without login)
- For logged-in users without badges yet: unlock 2020s only (existing behavior)
- Ensure `data-era` attribute is applied correctly on `document.documentElement`
- Ensure CSS variables cascade properly by importing `era-themes.css` in the right order

**Update `src/components/features/EraSkinToggle.tsx`:**
- Add animated preview: when hovering an era card, briefly show a mini-preview of the color scheme
- Add a "Preview" button for locked eras (applies theme for 5 seconds, then reverts)
- Show sound toggle in the era skin section

---

### Phase 5: Wire Model Selector End-to-End

**Current state**: The `ModelSelector` in `ChatInterface.tsx` sets `selectedModel` in local state and passes it to the edge function. The edge function already validates and uses it. This is already wired.

**Fix needed**: The `selectedModel` state in `ChatInterface` initializes to `google/gemini-2.5-flash` but should load from `profile.preferred_model` if the user is logged in.

**Update `src/components/chat/ChatInterface.tsx`:**
- Initialize `selectedModel` from `profile?.preferred_model` when available
- Persist model changes to profile via `supabase.from('profiles').update()`
- Ensure the model selector and the AppSettings model selector stay in sync

---

### Phase 6: Wire PWA Install Banner Properly

**Current state**: `usePWA.ts` registers the service worker and listens for `beforeinstallprompt`. `PWAInstallBanner` renders based on that state. This is already wired.

**Fixes needed:**
- Remove duplicate `<meta>` tags in `index.html` (theme-color and apple-mobile-web-app-capable appear twice)
- Add the `navigateFallbackDenylist` note: the service worker should skip `/~oauth` routes
- Update `sw.js` to not cache OAuth redirect routes

**Update `public/sw.js`:**
- Add check to skip `/~oauth` requests in the fetch handler

**Update `index.html`:**
- Remove duplicate meta tags
- Keep single set of PWA meta tags

---

### Phase 7: Add Sound Toggle to Settings

**Update `src/components/features/AppSettings.tsx`:**
- Add "Sound Effects" toggle in the Visual Theme section
- Persisted to localStorage key `era_sounds_enabled`
- Default: enabled

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useEraSound.ts` | Web Audio API sound effects per era theme |

### Files to Update

| File | Changes |
|------|---------|
| `index.html` | Add Google Fonts, remove duplicate meta tags |
| `src/styles/era-themes.css` | Google Font families, new animations per era |
| `src/contexts/ThemeContext.tsx` | Unlock all eras for anonymous users |
| `src/components/features/EraSkinToggle.tsx` | Preview button, sound on selection |
| `src/components/chat/ChatInterface.tsx` | Init selectedModel from profile |
| `src/components/features/AppSettings.tsx` | Sound toggle |
| `src/components/training/ExerciseRunner.tsx` | Wire sound effects |
| `public/sw.js` | Skip /~oauth routes |
| `src/pages/Index.tsx` | Wire sound effects on tab switch |

### Testing Checklist

After implementation:
1. Switch between all 4 era themes in Settings -- verify colors, fonts, and animations change
2. Check that the PWA install banner appears on desktop Chrome (or mobile)
3. Switch AI models in the chat dropdown, send a message, confirm the edge function logs show the correct model
4. Complete an exercise and verify XP is awarded and badge checks run
5. Toggle sound effects on/off and verify audio plays on interactions

