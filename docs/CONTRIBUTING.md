# Contributing

## Stack constraints

- React 18 + Vite 5 + TypeScript 5 + Tailwind v3 + shadcn-ui. No Next.js, no other frameworks.
- Backend is Lovable Cloud (Supabase). No custom servers in the repo — use edge functions under `supabase/functions/`.
- `src/integrations/supabase/client.ts` and `src/integrations/supabase/types.ts` are auto-generated. **Never edit them.**

## Design system

All colors, gradients, shadows, and radii are HSL design tokens defined in `src/index.css` and surfaced through `tailwind.config.ts`. Components must use semantic tokens (`bg-background`, `text-primary`, `border-border`) — never raw Tailwind colors like `bg-black` or `text-white`.

The aesthetic is cyberpunk/steampunk with neon purple and green accents. New components should use:

- `.holo-card` for elevated surfaces
- `.scanline` for the CRT-overlay effect
- The `cyberpunk-button` variants (`neon`, `ghost`, `danger`)
- Era-skin classes from `src/styles/era-themes.css` when the user has selected an era

## File conventions

- Components: PascalCase, one component per file, focused and small.
- Hooks: `useXxx.ts`, return objects not tuples.
- New persona definitions go in `src/lib/assistants.ts`. New avatars in `src/components/chat/AIAvatars.tsx`.
- Edge functions: one folder per function under `supabase/functions/`, with `index.ts` as entrypoint.

## Database changes

Use the Lovable migration tooling. Migrations live under `supabase/migrations/`. Never run `ALTER DATABASE postgres`. Never touch the `auth`, `storage`, `realtime`, `supabase_functions`, or `vault` schemas.

When adding a table:

1. Enable RLS.
2. Add policies scoped to `auth.uid()` (and `has_role()` for admin/instructor access).
3. Prefer validation **triggers** over `CHECK` constraints for anything time-based.
4. If realtime is needed: `ALTER PUBLICATION supabase_realtime ADD TABLE public.<name>;`

## Routing & providers

`BrowserRouter` must wrap every Context Provider in `src/App.tsx`. Inverting this breaks `useNavigate` inside `AuthContext` and `ThemeContext`.

## Vite

`vite.config.ts` dedupes React core deps and pre-bundles them — required to keep HMR stable. Don't remove the `optimizeDeps.include` block.

## Pull requests

- Keep PRs small and scoped to one concern.
- Run `npm run build` locally; the Lovable harness will also build on push.
- Include screenshots for UI changes.
- Don't bypass persona guardrails. Don't add backdoors. Don't introduce client-side admin checks.
