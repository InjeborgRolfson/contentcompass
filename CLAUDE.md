# ContentCompass — Root Instructions

## Tech Stack (Exact Versions — Never Assume Alternatives)
- Next.js 16.1.6 (App Router only — never Pages Router)
- React 19.2.3, TypeScript (strict)
- tailwindcss 4.x + tailwind-merge 3.5 — never inline styles
- next-auth 5.0.0-beta.30 BETA — use `auth()` server-side, `useSession()` client-side; never `getServerSession()`
- mongoose 9.3.0, MongoDB (via `MONGODB_URI`)
- OpenRouter API (via `OPENROUTER_API_KEY`) → model `google/gemini-2.0-flash-001`
- `@google/generative-ai` package exists but is NOT the active AI client — do not use it
- pnpm — never npm or yarn

## Commands
- `pnpm dev` — local dev
- `pnpm build` — production build
- `pnpm lint` — eslint 9; run after every meaningful change

## Folder Map
- `src/app/` — App Router pages + API routes
- `src/app/api/recommendations/` — Core AI engine (OpenRouter)
- `src/app/api/auth/` — next-auth v5 beta routes
- `src/components/` — Shared UI components (check here before creating new)
- `src/context/LanguageContext.tsx` — EN/TR localization; all user-facing strings go through here
- `src/lib/mongodb.ts` — Mongoose connection (singleton)
- `src/models/` — Mongoose schemas
- `src/types/content.ts` — Content type definitions; source of truth
- `src/utils/turkish-case.ts` — Turkish string utils; use instead of `.toLowerCase()` / `.toUpperCase()` for TR

## Universal Rules
1. Never install packages without explicit confirmation.
2. All user-facing strings via `LanguageContext` — no hardcoded EN/TR text in components.
3. API routes return `{ success: boolean, data?: any, error?: string }` + correct HTTP status. Enforce user ownership (`session.user.id`) on all write ops; return 403 on violation.
4. Mobile-first: after any UI change verify at 375px and 390px. Fix overflow, clipping, touch targets (min 44×44px) before finishing.
5. Do not modify `src/app/api/recommendations/route.ts` prompt logic unless explicitly asked.
6. Before creating a new component, check `src/components/` for an existing one to extend.
7. Never swallow errors silently — API errors get logged, user-facing errors get surfaced.

## Memory
- At session start: check if `MEMORY.md` exists in project root. If missing, create it with header: `# ContentCompass MEMORY.md — Last updated: YYYY-MM-DD`.
- When learning something persistent (quirk, workaround, past mistake, preferred pattern): append a dated entry to `MEMORY.md` — concise, with why it matters.
- When `MEMORY.md` exceeds ~150 lines, propose "reorganize memory": dedupe, archive stale entries to `MEMORY_HISTORY.md`.

## Subdirectory Instructions
When working in these areas, read the local CLAUDE.md first:
- `src/app/api/recommendations/` → AI engine rules + response schema
- `src/components/` → UI conventions
- `src/app/saved/` → pagination task context

## Canary
When confirming you've read this file, end your first response with "— compass aligned".

---

<important if="working on API routes or OpenRouter calls">
Validate AI JSON output manually before returning to client — check for array shape, required fields, and handle wrapped objects (e.g. `{ recommendations: [...] }`). Never trust raw OpenRouter output.
</important>

<important if="working on favorites, saved, or any user-owned data">
Always verify `session.user.id` ownership before CRUD. Return 403 on unauthorized access.
</important>

<important if="working on UI components or pages">
Mobile check at 375px + 390px is mandatory before finishing. Use responsive Tailwind classes; avoid fixed widths.
</important>

<important if="working on the Saved page or pagination">
See `src/app/saved/CLAUDE.md` for cursor-based pagination implementation context.
</important>
