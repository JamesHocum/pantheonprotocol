## Pantheon Protocol — Premium Holographic Dashboard Redesign

A flagship UI/UX upgrade to the homepage. Existing personas, routes, auth, chat behavior, academy/classroom/studio tabs, and assets are preserved. The Chat tab becomes the new visual standard; other tabs inherit the new shell (sidebar + top utility bar + status bar) so the visual language is consistent app-wide.

Personas (unchanged): LadyVioletGPT, DarkBERT, GhostGPT, DemonGPT, WormGPT, Venice, FraudGPT.

### Reference Layout (1336×861)

```text
┌──┬─────────────────────────────────────────────────────────────────────────┐
│  │ PANTHEON PROTOCOL  • SECURE LINK  • TOR  • EXPOSED   [neon café sign]   │
│ I│ [LEVEL XP bar] [Neon Intensity ▭▭▭▭] [User pill] [bell] [mail]          │
│ c├──┬──────────────────────────────────────────────────────────────────────┤
│ o│ H│ Chat │ Academy │ Classroom │ Studio │ News │ Games │ Voice │ Profile│
│ n│ I├──────────────────────────────────────────────────────────────────────┤
│ R│ S│ AI INSTRUCTORS (07)                                          ‹ ›    │
│ a│ T│ ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐  big sleek persona cards w/ LAUNCH    │
│ i│ O│ └──┘└──┘└──┘└──┘└──┘└──┘└──┘                                        │
│ l│ R│ ACADEMY MODULES                              View All Modules →    │
│  │ Y│ [Recon][Prompt][Secure][Exploit][Defense][CTF][Neural]             │
│  │  │ ┌── WORKSPACE ───────────────┐  ┌── QUICK ACTIONS ───┐             │
│  │  │ │ welcome msg + chat stream  │  │ persona starters   │             │
│  │  │ │ [model][mode] [input.....] │  │ ...                │             │
│  │  │ └────────────────────────────┘  └────────────────────┘             │
│  │  │ PANTHEON PROTOCOL v1.0.0 • EDUCATIONAL ONLY  SYS CPU NET           │
└──┴──┴──────────────────────────────────────────────────────────────────────┘
```

### Visual System

- **Glassmorphism**: `holo-card` utility — `bg-[hsl(240_18%_7%/0.65)] backdrop-blur-2xl saturate-160`, 1px subtle border, animated top edge gradient (violet→magenta→cyan).
- **Palette extension** in `index.css`: `--neon-violet 280 100% 70%`, `--neon-magenta 320 100% 65%`, `--neon-cyan 180 100% 55%`, `--neon-green 140 100% 55%`, plus `--gradient-holo` (conic) and `--gradient-card-edge` (linear).
- **Typography**: JetBrains Mono retained for data; titles use uppercase + `tracking-[0.2em]`. New `.gradient-text-holo` for headings.
- **Spacing**: 24px gutters, 32px section gaps, 16px+ card padding.
- **Buttons**: extend `cyberpunk-button.tsx` with `holo` (animated gradient border via mask trick) and `launch` (persona-tinted) variants, plus `xl` and `iconSm` sizes.
- **Motion**: hover lift (`-translate-y-0.5`), scanline overlay on instructor cards, slow status-dot pulse, gradient-text shift.

### Neon Intensity (global)

- Add `neonIntensity` (0–100, default 60) to `ThemeContext`, persisted to `localStorage`.
- Sets CSS var `--neon-intensity` (0–1) on `<html>`.
- All glow tokens in `index.css` reference it: `--glow-purple: 0 0 calc(20px * var(--neon-intensity)) hsl(... / calc(0.6 * var(--neon-intensity)))` (and equivalents for green/cyan/magenta/cyber).
- `neon-pulse` keyframe also multiplies blur by intensity, so all `animate-neon-pulse`, `cyber-glow`, and `shadow-glow-*` utilities respond automatically — no per-component changes.
- Slider lives in `TopUtilityBar` next to XP (shadcn `Slider`, ~110px wide) with `Sparkles` icon and percentage tooltip.

### Files

| File | Action | Purpose |
|---|---|---|
| `src/index.css` | Edit | New tokens, intensity-aware glows, `holo-card`, `gradient-text-holo`, scanline, persona auras, premium scrollbar, holo-border. |
| `src/contexts/ThemeContext.tsx` | Edit | Add `neonIntensity` + `setNeonIntensity` (persisted, syncs CSS var). Existing era logic untouched. |
| `src/components/ui/cyberpunk-button.tsx` | Edit | Add `holo`, `launch`, `outlineGlow` variants and `xl`, `iconSm` sizes. Existing variants preserved. |
| `src/components/layout/AppSidebar.tsx` | Create | Slim 56px icon rail using shadcn Sidebar primitives (already installed). Items: Home, Toolkits, Games, Courses, Classroom, Settings. Floating trigger so it can collapse to 0. |
| `src/components/layout/TopUtilityBar.tsx` | Create | Single consolidated header: PP logo + status pills (SECURE LINK / TOR / EXPOSED — TOR is interactive) + center neon café sign + compact XP bar + Neon Intensity slider + user pill + bell/mail icons + sign-in button when logged out. |
| `src/components/layout/CyberHeader.tsx` | Replace contents | Becomes a thin re-export of `TopUtilityBar` to avoid duplicate headers anywhere it's still used. |
| `src/components/dashboard/InstructorRail.tsx` | Create | Horizontal scrollable rail of 7 large persona cards (~220×340) — large portrait + persona aura, role chip, 3-line description, full-width LAUNCH button in persona color, gradient top edge. Click sets active persona for workspace. Scroll arrows on the right. |
| `src/components/dashboard/AcademyModulesRail.tsx` | Create | 7 compact module tiles (Recon, Prompt Engineering, Secure Systems, Exploit Analysis, Defensive Ops, CTF Arena, Neural Lab) with icons + 2-line educational/defensive descriptions. Clicking switches to Academy tab + corresponding sub-tab. "View All Modules →" link. |
| `src/components/dashboard/WorkspacePanel.tsx` | Create | Embeds `ChatInterface` in compact mode without its own selector or floating sidebar; shows active persona name + Clear/Settings in its header. |
| `src/components/dashboard/QuickActionsPanel.tsx` | Create | Pulls `assistants[active].conversationStarters`; renders up to 6 holo buttons that send the prompt to the workspace via shared state. |
| `src/components/dashboard/StatusBar.tsx` | Create | Footer line with version + "FOR EDUCATIONAL PURPOSES ONLY" + animated SYS/CPU/NET telemetry pseudo-stats. |
| `src/components/chat/ChatInterface.tsx` | Edit | Accept optional props: `compact?: boolean`, `activeAssistant?: AssistantKey`, `onAssistantChange?`, `hideSelector?: boolean`, `pendingPrompt?: string` (auto-sends when set). Default behavior unchanged when props omitted, so the existing standalone Chat tab still works. |
| `src/pages/Index.tsx` | Edit | New shell: `<SidebarProvider>` wrapping `<AppSidebar/>` + main column (`<TopUtilityBar/>`, tabs, content area, `<StatusBar/>`). Chat tab renders `InstructorRail` → `AcademyModulesRail` → 2-col grid of `WorkspacePanel` + `QuickActionsPanel`. Other tabs keep existing components but inherit the new shell. Removes the old standalone `<CyberHeader/>` block since `TopUtilityBar` replaces it. |
| `src/components/chat/AIAvatars.tsx` | Edit | Add optional `size?: 'sm' \| 'md' \| 'lg'` prop. `lg` renders a 160×200 portrait card with persona-aura background; existing JPGs used for Violet/DarkBERT, enhanced SVG portraits for the other 5 with persona-colored aura ring. Existing default `sm/md` calls untouched. |

### Persona Card

- Portrait area: 160×200, persona aura radial background, scanline overlay
- Name: persona color, uppercase tracked
- Role chip: Lead Instructor / Code Architect / Recon Specialist / Exploitation Guru / Malware Engineer / Social Engineer / Fraud Analyst
- Description: existing `description` (defensive/educational tone preserved)
- LAUNCH button: full-width, persona-colored border + glow, `launch` variant
- Hover: lift + intensified aura

### Quick Action Copy (defensive framing)

LadyVioletGPT starters become more legitimate / portfolio-grade phrasing where currently borderline:
- "Start my hacking journey — what should I learn first?"
- "Teach me reconnaissance basics"
- "SQL injection lab: concepts and prevention"
- "How do I set up a home lab safely?"
- "Build me a 30-day pentesting study plan"
- "Give me a beginner CTF challenge"

(Updates `assistants.ts` `conversationStarters` for `violet` only; other personas already framed defensively.)

### Responsive

- ≥1280px: full layout (2-col workspace + actions)
- 768–1279px: sidebar collapses to icon rail; rails scroll horizontally; workspace + actions stack
- <768px: sidebar becomes off-canvas drawer; tabs icon-only; quick actions become collapsible drawer below workspace

### Reusable Tokens / Classes

- `.holo-card`, `.holo-card-hover`
- `.persona-aura-{violet|darkbert|ghost|demon|wormgpt|venice|fraudgpt}`
- `.scanline`, `.gradient-text-holo`, `.holo-border`, `.status-dot`, `.animate-lift-in`

### Guardrails

- No DB changes, no new instructors, no new routes.
- No removal of existing functionality (auth, chat history, web search, offline AI, agent settings, code canvas, conversation sidebar, ImageGeneration, Classroom, Voice, etc.).
- Primitives (`sidebar.tsx`, `slider.tsx`) already exist — no installs needed.
- After implementation, verify build and Chat tab renders without runtime errors.
