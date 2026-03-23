# Components — Instructions

## Conventions
- Tailwind 4.x utility classes only; no inline styles, no CSS modules.
- Use `tailwind-merge` (`cn()` or `twMerge()`) for conditional class merging.
- All user-facing strings via `LanguageContext` — never hardcode EN or TR text.
- Turkish string transformations: use `src/utils/turkish-case.ts`, not `.toLowerCase()` or `.toUpperCase()`.

## Structure
- One component per file; filename = PascalCase component name.
- If a component exceeds ~150 lines, consider splitting into subcomponents.
- `lucide-react` is the icon library — do not introduce other icon packages.

## Mobile
- Design mobile-first (375px base).
- Touch targets minimum 44×44px.
- Test at 375px and 390px before marking done.

## Gotchas
- `clsx` is available but prefer `tailwind-merge` for Tailwind class conflicts.
- next-auth v5 beta: `useSession()` works client-side; `auth()` for server components.
