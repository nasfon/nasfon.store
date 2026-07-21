# Commit 001

**Message:** Initialize Next.js project with core dependencies and design system

**Date:** 2026-07-21

---

## Changes

### Scaffolding
- Created Next.js 16 project in `apps/web` (App Router, TypeScript, Tailwind CSS v4)
- Installed dependencies: Supabase, TanStack Query, React Hook Form, Zod, Lucide, Sonner, Cloudinary
- Configured Tailwind CSS v4 theme with design tokens (brand colors, spacing, typography, shadows, radii)

### Project Structure
```
src/
├── app/
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
├── features/
├── hooks/
├── lib/
├── services/
├── types/
└── utils/
```

### Files Created
| File | Purpose |
|------|---------|
| `apps/web/package.json` | Project manifest with all dependencies |
| `apps/web/src/app/globals.css` | Global styles with design system tokens |
| `apps/web/src/app/layout.tsx` | Root layout with Geist font and metadata |
| `apps/web/src/app/page.tsx` | Home page placeholder |
| `apps/web/src/lib/supabase.ts` | Supabase client initialization |
| `apps/web/src/types/index.ts` | TypeScript types for all entities |
| `apps/web/.env.example` | Environment variable template |

### Cleanup
- Removed default Next.js static assets (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`)
- Removed default `favicon.ico`

### Other
- Created `to-do.md` — full project checklist from repo creation to deployment
- Created `docs/commits/` — commit documentation directory
