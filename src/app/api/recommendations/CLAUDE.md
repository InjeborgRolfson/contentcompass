# Recommendations API — Instructions

## AI Client

- Provider: OpenRouter (`https://openrouter.ai/api/v1/chat/completions`)
- Model: `google/gemini-3.1-flash-lite`
- Auth: `Authorization: Bearer ${process.env.OPENROUTER_API_KEY}`
- Response format: `{ "type": "json_object" }` — always set this

## Response Schema (source of truth)

Each recommendation object must have:

```
type, title, creator, year,
description, description_en, description_tr,
why, why_en, why_tr,
tags (string[]),
isWildcard (boolean),
photo (string | null)
```

Never remove or rename these fields.

## Rules

1. Exactly 8 recommendations per call — never more, never less.
2. Exactly 1 wildcard (`isWildcard: true`) among the 8.
3. Both `_tr` and `_en` fields must always be populated regardless of interface language.
4. Photos are fetched post-AI via Wikidata → Wikipedia pipeline — do not modify this flow unless explicitly asked.
5. OpenRouter sometimes wraps the array in a `recommendations` key — the unwrap logic must stay in place.
6. The prompt is built from 7 composable string fragments (filtersStr, diversityStr, etc.) — keep them modular.

## Gotchas

- OpenRouter returns `data.choices[0].message.content`, not `data.content` — don't confuse with Anthropic API shape.
- `response_format: { type: "json_object" }` does not guarantee a JSON array — always handle the wrapped object case.
- Wikidata image fetch can fail silently; `photo` must fall back to `null`, never throw.
