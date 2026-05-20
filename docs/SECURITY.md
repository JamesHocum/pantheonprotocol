# Security & Ethics

## Ethical use policy

Pantheon Protocol is an **educational defensive-security** platform. Every persona's system prompt explicitly refuses:

- Live exploit code or weaponized payloads
- Instructions for unauthorized access, fraud, harassment, or doxing
- Help with attacks against systems the user does not own or is not authorized to test

Personas redirect those requests toward detection, mitigation, threat modeling, and authorized lab work. Do not modify the system prompts to remove these guardrails.

## Authentication

- Email/password via Supabase Auth, with `auto_confirm_email = true` for low-friction onboarding.
- Google OAuth provider is wired and can be enabled from Lovable Cloud → Auth.
- No anonymous sign-ins.

## Authorization model

Roles are stored in a **separate** `user_roles` table (never on `profiles`) and checked through a `SECURITY DEFINER` function:

```sql
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
```

RLS policies call `has_role(auth.uid(), 'admin')` instead of querying `user_roles` directly — this prevents recursive-policy deadlocks and privilege escalation.

## RLS posture

- Every public table has RLS **enabled**.
- Default policy: a user can `select / insert / update / delete` only rows where `user_id = auth.uid()`.
- Classroom tables additionally allow instructors (`has_role(..., 'moderator')` scoped to their classroom) to read student progress.
- Storage buckets: `avatars` and `generated-images` are public-read, user-scoped-write. `lora-datasets` is private; access is brokered by signed URLs from the `lora-train` edge function.

## Secrets

Stored in Lovable Cloud → Secrets, available as env vars inside edge functions. Never commit secrets, never log them, never echo them to the client.

| Secret | Scope | Notes |
|---|---|---|
| `LOVABLE_API_KEY` | auto | AI gateway |
| `REPLICATE_API_TOKEN` | manual | SDXL + LoRA |
| `TOR_PROXY_URL` | manual | Optional outbound proxy for `web-search` |

Use `getSecret(name)` (see `mem://architecture/environment-aware-secrets-pattern`) to pick `_DEV` / `_PROD` variants automatically.

## Tor routing

When a user toggles Tor on a persona, `user_agent_settings.tor_enabled = true`. The `web-search` edge function then routes its outbound fetch through `TOR_PROXY_URL`. The proxy itself is the user's responsibility — supply any SOCKS-over-HTTP relay URL.

## Reporting a vulnerability

Open a private GitHub security advisory, or DM the maintainer. Do not file public issues for security bugs.
