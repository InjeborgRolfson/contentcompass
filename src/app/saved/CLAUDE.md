# Saved Page — Instructions

## Current Task
Faz 4 son madde: pagination for the Saved page.

## Context
- Saved page displays user's saved recommendations (fetched from MongoDB).
- Currently loads all saved items at once — needs numbered pagination.
- API route: `src/app/api/saved/` — check existing route before creating new endpoints.

## Implementation Approach
- Pattern: numbered pagination with "← 1 2 3 →" controls at page bottom.
- Page size: 12 items per page.
- Sort: `_id: -1` (newest first).
- Use offset-based pagination: `skip(page * 12).limit(12)` in MongoDB query.
- Also fetch total count for page number calculation.

## UI
- Page controls sit at the bottom of the item grid.
- Show: previous arrow, page numbers (max 5 visible), next arrow.
- Disable previous on page 1, disable next on last page.
- Current page number visually highlighted.
- If total items ≤ 12, hide pagination controls entirely.
- Reuse existing recommendation card component — do not create a duplicate.
- Empty state: "Henüz kaydedilmiş içerik yok" / "No saved content yet" via LanguageContext.

## Rules
1. Do not change the saved item data schema.
2. Mobile check at 375px + 390px mandatory — pagination controls must not overflow.
3. next-auth v5 beta: validate session in API route via `auth()`, not `getServerSession()`.
4. API route returns `{ success: boolean, data: items[], total: number, page: number, totalPages: number }`.
