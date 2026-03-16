# ContentCompass Workspace Instructions

## Build & Test Commands

- **Development:** `pnpm dev`
- **Build:** `pnpm build`
- **Start:** `pnpm start`
- **Lint:** `pnpm lint`

## Architecture & Conventions

- **Framework:** Next.js (App Router, TypeScript, Tailwind, NextAuth, Mongoose)
- **App Structure:**
  - Pages: login, register, discover, favorites, saved
  - API routes: authentication, favorites, recommendations, tag generation
- **MongoDB:** Requires `MONGODB_URI` in `.env.local`
- **OpenRouter AI:** Requires `OPENROUTER_API_KEY` in `.env.local`
- **Localization:**
  - Uses `LanguageContext` for EN/TR translations
  - Turkish case utilities in `src/utils/turkish-case.ts`
- **Content Types:** Defined in `src/types/content.ts` and used for filtering/recommendations

## Recommendations Engine

- API routes call OpenRouter AI for tag generation and recommendations
- Recommendations returned as JSON arrays with strict schema
- Diversity and balance across content types enforced

## Favorites & Saved

- CRUD operations for favorites and saved recommendations
- API routes ensure user ownership for modifications

## Error Handling & Pitfalls

- API routes return detailed error messages and status codes
- Most pages/components require a valid session

## Key Files/Directories

- `src/app/` — Main app pages and API routes
- `src/components/` — UI components
- `src/context/LanguageContext.tsx` — Localization logic
- `src/lib/mongodb.ts` — MongoDB connection logic
- `src/models/` — Mongoose schemas
- `src/types/content.ts` — Content type definitions

## Example Prompts

- "How do I add a new content type to recommendations?"
- "What environment variables are required for local development?"
- "How does localization work in the UI?"

---

For agent customization, consider applyTo-based instructions for frontend (UI/components), backend (API/routes), and tests. Suggest creating `/create-agent`, `/create-prompt`, or `/create-skill` for specialized workflows (e.g., Turkish-only recommendations, admin tools, etc.).
