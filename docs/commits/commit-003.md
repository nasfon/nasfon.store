# Commit 003

**Message:** Set up Supabase SSR client helpers, proxy, and env configuration

**Date:** 2026-07-21

---

## Changes

### Supabase Client Helpers
- `src/utils/supabase/server.ts` — server-side Supabase client (via `@supabase/ssr`)
- `src/utils/supabase/client.ts` — browser-side Supabase client
- `src/utils/supabase/middleware.ts` — request-scoped Supabase client for proxy

### Proxy (Middleware)
- `src/proxy.ts` — Next.js 16 proxy for session refresh and route protection
- Renamed from deprecated `middleware.ts` convention to `proxy.ts`

### Environment
- `.env.local` — populated with Supabase project credentials
- `.env.example` — updated to use `SUPABASE_PUBLISHABLE_KEY` naming

### Cleanup
- Removed old `src/lib/supabase.ts` (replaced by `src/utils/supabase/`)
