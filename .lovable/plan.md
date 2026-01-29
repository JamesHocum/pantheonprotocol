

## Pantheon Protocol Enhancement Plan
### Advanced CTF Exercises + Era Skins + XP System + PWA Enhancements + LLM Selector

---

### Overview

This plan implements five major features:
1. **Advanced CTF Exercises** - 15+ new intermediate/advanced exercises across crypto, forensics, and web exploitation
2. **Era Skin Toggle** - Switch between 1980s, 1990s, 2000s, and 2020s visual themes
3. **XP and Level System** - Gamification with points, levels, and milestone badges
4. **PWA Enhancements** - Improved install prompt and offline capabilities
5. **LLM Model Selector** - Dropdown to switch between available AI models

---

### Phase 1: Database Migration

**New Table: `user_xp`**
```sql
CREATE TABLE user_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  badges JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);
```

**Add Column to `profiles`**
```sql
ALTER TABLE profiles ADD COLUMN theme_era TEXT DEFAULT '2020s';
ALTER TABLE profiles ADD COLUMN preferred_model TEXT DEFAULT 'google/gemini-2.5-flash';
```

**Seed 15 Advanced CTF Exercises**

| Title | Category | Difficulty | Type |
|-------|----------|------------|------|
| ROT13 Decoder | crypto | intermediate | decode |
| Vigenere Cipher | crypto | advanced | crypto |
| RSA Basics | crypto | advanced | crypto |
| XOR Key Recovery | crypto | intermediate | crypto |
| EXIF Data Extraction | forensics | intermediate | forensics |
| Steganography Detection | forensics | advanced | forensics |
| Memory Dump Analysis | forensics | advanced | forensics |
| Log File Investigation | forensics | intermediate | forensics |
| SQL Injection Detection | web | intermediate | web |
| XSS Payload Identification | web | intermediate | web |
| Cookie Tampering | web | advanced | web |
| JWT Token Analysis | web | advanced | web |
| Directory Traversal | web | intermediate | web |
| HTTP Header Injection | web | advanced | web |
| Command Injection | web | advanced | web |

---

### Phase 2: Era Skin System

**Create `src/contexts/ThemeContext.tsx`**

Context providing:
- `currentEra`: '1980s' | '1990s' | '2000s' | '2020s'
- `setEra`: Function to change era
- `isUnlocked`: Function to check if era is unlocked based on XP

**Create `src/styles/era-themes.css`**

CSS custom properties for each era:

| Era | Primary | Secondary | Font | Style Description |
|-----|---------|-----------|------|-------------------|
| 1980s | Neon pink | Cyan | VT323 | Retro arcade, scanlines, CRT glow |
| 1990s | Lime green | Purple | Courier | Matrix style, early web aesthetic |
| 2000s | Blue | Orange | Verdana | Web 2.0 gradients, glossy buttons |
| 2020s | Purple | Green | Mono | Current cyberpunk theme (default) |

**Update `src/index.css`**
- Add era-specific CSS variable sets
- Add transition animations between themes

**Create `src/components/features/EraSkinToggle.tsx`**
- Visual era selector with preview thumbnails
- Lock icons for unearned eras
- localStorage persistence
- Syncs to `profiles.theme_era` for logged-in users

---

### Phase 3: XP and Level System

**Create `src/hooks/useXP.ts`**

Hook providing:
- `totalXP`: Current XP count
- `level`: Current level (1-50)
- `badges`: Array of earned badges
- `addXP(amount, source)`: Award XP
- `calculateLevel(xp)`: Convert XP to level
- `getNextLevelXP()`: XP needed for next level
- `checkBadgeEligibility()`: Check and award new badges

**XP Rewards Table:**

| Action | XP Awarded |
|--------|------------|
| Complete beginner exercise | 50 XP |
| Complete intermediate exercise | 100 XP |
| Complete advanced exercise | 200 XP |
| Complete course module | 75 XP |
| Complete full course | 500 XP |
| First login of day | 25 XP |

**Level Thresholds:**
- Level 1: 0 XP
- Level 5: 500 XP
- Level 10: 1,500 XP
- Level 20: 5,000 XP
- Level 50: 50,000 XP

**Badge System:**

| Badge | Requirement | Era Unlock |
|-------|-------------|------------|
| First Blood | Complete 1 exercise | - |
| Crypto Rookie | Complete 3 crypto exercises | 1990s |
| Forensics Hunter | Complete 3 forensics exercises | - |
| Web Warrior | Complete 3 web exercises | - |
| Triple Threat | Complete all exercise types | 2000s |
| Course Completer | Finish 1 course | - |
| Master Hacker | Complete 10 advanced exercises | 1980s |
| Pantheon Elite | Reach level 25 | All themes |

**Create `src/components/features/XPDisplay.tsx`**
- XP progress bar
- Current level badge
- Recent XP gains animation
- Badge showcase

**Update `src/components/training/ExerciseRunner.tsx`**
- Award XP on exercise completion
- Show XP gain notification
- Check for badge unlocks

---

### Phase 4: PWA Enhancements

**Update `public/manifest.json`**
- Add proper icon sizes (72, 96, 128, 144, 152, 192, 384, 512)
- Add share_target for receiving shared content
- Add shortcuts for quick actions

**Update `public/sw.js`**
- Improve cache strategies (network-first for API, cache-first for static)
- Add background sync for offline exercise completions
- Cache training course content for offline access

**Update `src/hooks/usePWA.ts`**
- Add `isOffline` state detection
- Add `offlineQueue` for pending actions
- Add `syncWhenOnline` function

**Create `src/components/ui/pwa-install-banner.tsx`**
- Persistent banner for non-installed users
- Platform-specific install instructions
- Dismiss with 24h reminder

---

### Phase 5: LLM Model Selector

**Available Models (from LOVABLE_API_KEY):**

| Model ID | Display Name | Speed | Best For |
|----------|--------------|-------|----------|
| google/gemini-2.5-flash | Gemini 2.5 Flash | Fast | Default, balanced |
| google/gemini-2.5-pro | Gemini 2.5 Pro | Medium | Complex reasoning |
| google/gemini-2.5-flash-lite | Gemini Flash Lite | Fastest | Quick responses |
| openai/gpt-5-mini | GPT-5 Mini | Medium | Strong reasoning |
| openai/gpt-5-nano | GPT-5 Nano | Fast | Simple tasks |

**Update `src/components/features/AppSettings.tsx`**
- Add "AI Model" section with dropdown
- Model descriptions and speed indicators
- Save preference to `profiles.preferred_model`

**Update `supabase/functions/chat/index.ts`**
- Accept `model` parameter from request
- Default to user's preferred model if not specified
- Fall back to `google/gemini-2.5-flash`

**Create `src/components/chat/ModelSelector.tsx`**
- Compact dropdown in chat header
- Quick model switching without leaving chat
- Shows current model with icon

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/contexts/ThemeContext.tsx` | Era theme state management |
| `src/styles/era-themes.css` | CSS variables for each era |
| `src/hooks/useXP.ts` | XP and level tracking |
| `src/components/features/EraSkinToggle.tsx` | Theme picker UI |
| `src/components/features/XPDisplay.tsx` | XP bar and level display |
| `src/components/features/LevelBadges.tsx` | Badge showcase |
| `src/components/chat/ModelSelector.tsx` | LLM model dropdown |
| `src/components/ui/pwa-install-banner.tsx` | Persistent install prompt |

### Files to Update

| File | Changes |
|------|---------|
| `src/index.css` | Add era theme CSS variables |
| `src/App.tsx` | Wrap with ThemeContext provider |
| `src/pages/Index.tsx` | Add XPDisplay to header |
| `src/components/features/AppSettings.tsx` | Add Era toggle + Model selector |
| `src/components/training/ExerciseRunner.tsx` | Integrate XP awards |
| `src/components/training/CourseViewer.tsx` | Award XP on module completion |
| `src/components/chat/ChatInterface.tsx` | Add ModelSelector |
| `supabase/functions/chat/index.ts` | Accept model parameter |
| `public/manifest.json` | Enhanced PWA config |
| `public/sw.js` | Better caching strategies |
| `src/hooks/usePWA.ts` | Offline detection |

---

### Architecture Flow

```text
User Actions
    |
    v
+-------------------+
|  XP System Hook   |
|  (useXP.ts)       |
+--------+----------+
         |
         v
+--------+----------+     +-------------------+
| Exercise/Course   |---->| Badge Check       |
| Completion        |     | Era Unlock        |
+-------------------+     +--------+----------+
                                   |
                                   v
                          +--------+----------+
                          | Theme Context     |
                          | (Era Skins)       |
                          +-------------------+

Chat Flow
    |
    v
+-------------------+
| ModelSelector     |---> User picks model
+--------+----------+
         |
         v
+--------+----------+
| chat/index.ts     |---> Send to Lovable AI Gateway
| (Edge Function)   |     with selected model
+-------------------+
```

---

### XP Earning Flow

```text
Exercise Completed
        |
        v
+------------------+
| useXP.addXP()    |
| source: exercise |
+--------+---------+
         |
         v
+--------+---------+
| Update user_xp   |
| table in Supabase|
+--------+---------+
         |
         v
+--------+---------+
| Check for:       |
| - Level up       |
| - New badges     |
| - Era unlocks    |
+--------+---------+
         |
         v
+--------+---------+
| Show toast       |
| animation        |
+------------------+
```

---

### Era Theme Preview

**1980s - Arcade Era**
- Background: Dark with CRT scanline overlay
- Primary: Hot pink (#FF1493)
- Secondary: Electric cyan (#00FFFF)
- Font: VT323 (monospace pixel font)
- Effects: Neon glow, flicker animation

**1990s - Matrix Era**
- Background: Deep black with green rain
- Primary: Matrix green (#00FF41)
- Secondary: Purple (#9400D3)
- Font: Courier New
- Effects: Text fade-in, terminal cursor

**2000s - Web 2.0 Era**
- Background: Gradient blues
- Primary: Royal blue (#4169E1)
- Secondary: Sunset orange (#FF4500)
- Font: Verdana
- Effects: Glossy buttons, drop shadows

**2020s - Cyberpunk Era (Current)**
- Background: Dark with neon accents
- Primary: Purple (#8B5CF6)
- Secondary: Neon green (#00FF41)
- Font: Mono
- Effects: Glass morphism, glow effects

---

### Summary Checklist

- [ ] Database: Create `user_xp` table
- [ ] Database: Add `theme_era` and `preferred_model` to profiles
- [ ] Database: Seed 15 advanced CTF exercises
- [ ] Context: `ThemeContext` for era management
- [ ] Hook: `useXP` for gamification
- [ ] Component: `EraSkinToggle`
- [ ] Component: `XPDisplay`
- [ ] Component: `LevelBadges`
- [ ] Component: `ModelSelector`
- [ ] CSS: Era theme stylesheets
- [ ] Update: `ExerciseRunner` with XP integration
- [ ] Update: `CourseViewer` with XP integration
- [ ] Update: `AppSettings` with Era + Model settings
- [ ] Update: `chat/index.ts` edge function for model selection
- [ ] PWA: Enhanced manifest and service worker

