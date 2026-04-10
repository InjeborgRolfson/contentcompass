import { NextResponse } from "next/server";

export const runtime = "nodejs";

const STOPWORDS = new Set([
  "and",
  "of",
  "the",
  "in",
  "on",
  "for",
  "to",
  "by",
  "with",
  "from",
  "at",
  "a",
  "an",
]);

const CATEGORY_BLOCKLIST = [
  "wikipedia",
  "articles",
  "pages",
  "cs1",
  "short description",
  "use dmy dates",
  "use mdy dates",
  "webarchive",
  "commons",
  "wikidata",
  "template",
  "coordinates",
  "stub",
  "harv and sfn",
  "all stub",
  "redirects",
  "disambiguation",
];

function toTitleCase(value: string): string {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function normalizeCategoryToTag(categoryTitle: string): string | null {
  const cleaned = categoryTitle
    .replace(/^Category:/i, "")
    .replace(/\(.*?\)/g, " ")
    .replace(/[0-9]/g, " ")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return null;

  const words = cleaned
    .split(" ")
    .map((w) => w.trim())
    .filter((w) => w.length > 1)
    .filter((w) => !STOPWORDS.has(w.toLowerCase()));

  if (words.length === 0) return null;

  return toTitleCase(words.slice(0, 2).join(" "));
}

function isUsefulCategory(categoryTitle: string): boolean {
  const lower = categoryTitle.toLowerCase();
  return !CATEGORY_BLOCKLIST.some((term) => lower.includes(term));
}

async function getWikipediaTitleFromWikidata(
  query: string,
  hintTerms: string[],
): Promise<string | null> {
  const searchRes = await fetch(
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
      query,
    )}&language=en&format=json&origin=*&limit=5`,
    { headers: { "User-Agent": "ContentCompass/1.0 (info@contentcompass.app)" } }
  );

  if (!searchRes.ok) return null;

  const searchData = await searchRes.json();
  const results = (searchData.search || []) as Array<{
    id?: string;
    label?: string;
    description?: string;
  }>;

  const normalizedHints = hintTerms
    .map((term) => term.toLowerCase().trim())
    .filter((term) => term.length > 0);

  const scoredResults = results
    .map((result) => {
      const label = (result.label || "").toLowerCase();
      const description = (result.description || "").toLowerCase();
      const queryLower = query.toLowerCase();

      let score = 0;
      if (label === queryLower) score += 8;
      if (label.includes(queryLower)) score += 4;

      for (const hint of normalizedHints) {
        if (label.includes(hint)) score += 3;
        if (description.includes(hint)) score += 5;
      }

      return { result, score };
    })
    .sort((a, b) => b.score - a.score);

  for (const { result } of scoredResults) {
    if (!result?.id) continue;

    const entityRes = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${result.id}&props=sitelinks&sitefilter=enwiki&format=json&origin=*`,
      { headers: { "User-Agent": "ContentCompass/1.0 (info@contentcompass.app)" } }
    );
    if (!entityRes.ok) continue;

    const entityData = await entityRes.json();
    const wikiTitle =
      entityData.entities?.[result.id]?.sitelinks?.enwiki?.title;

    if (wikiTitle) return wikiTitle;
  }

  return null;
}

async function resolveWikipediaTitle(
  candidates: string[],
  hintTerms: string[],
): Promise<string | null> {
  for (const candidate of candidates) {
    const query = candidate.trim();
    if (!query) continue;

    const wikiTitle = await getWikipediaTitleFromWikidata(query, hintTerms);
    if (wikiTitle) return wikiTitle;
  }

  return null;
}

async function getWikipediaTitleFromSearch(
  query: string,
): Promise<string | null> {
  const searchRes = await fetch(
    `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
      query,
    )}&limit=1&namespace=0&format=json&origin=*`,
    { headers: { "User-Agent": "ContentCompass/1.0 (info@contentcompass.app)" } }
  );

  if (!searchRes.ok) return null;

  const searchData = await searchRes.json();
  const title = Array.isArray(searchData?.[1]) ? searchData[1][0] : null;

  return typeof title === "string" && title.trim().length > 0 ? title : null;
}

async function resolveWikipediaTitleWithFallback(
  candidates: string[],
  hintTerms: string[],
): Promise<string | null> {
  const wikidataTitle = await resolveWikipediaTitle(candidates, hintTerms);
  if (wikidataTitle) return wikidataTitle;

  for (const candidate of candidates) {
    const query = candidate.trim();
    if (!query) continue;

    const wikipediaTitle = await getWikipediaTitleFromSearch(query);
    if (wikipediaTitle) return wikipediaTitle;
  }

  return null;
}

async function getTagsFromWikipediaTitle(wikiTitle: string): Promise<string[]> {
  const categoriesRes = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      wikiTitle,
    )}&prop=categories&cllimit=50&format=json&origin=*`,
    { headers: { "User-Agent": "ContentCompass/1.0 (info@contentcompass.app)" } }
  );

  if (!categoriesRes.ok) return [];

  const categoriesData = await categoriesRes.json();
  const pages = categoriesData.query?.pages || {};
  const pageId = Object.keys(pages)[0];
  const categories = pages[pageId]?.categories || [];

  const uniqueTags = new Set<string>();

  for (const category of categories) {
    const rawTitle = category?.title;
    if (!rawTitle || typeof rawTitle !== "string") continue;
    if (!isUsefulCategory(rawTitle)) continue;

    const normalized = normalizeCategoryToTag(rawTitle);
    if (!normalized) continue;

    uniqueTags.add(normalized);
    if (uniqueTags.size >= 4) break;
  }

  return Array.from(uniqueTags).slice(0, 4);
}

export async function POST(req: Request) {
  try {
    const { title, creator, type, note } = await req.json();

    const cleanTitle = typeof title === "string" ? title.trim() : "";
    const cleanCreator = typeof creator === "string" ? creator.trim() : "";
    const cleanType = typeof type === "string" ? type.trim() : "";
    const cleanNote = typeof note === "string" ? note.trim() : "";

    if (!cleanTitle && !cleanCreator) {
      return NextResponse.json({ tags: [] });
    }

    const candidates = [
      cleanTitle,
      cleanCreator,
      cleanType,
      [cleanTitle, cleanCreator].filter(Boolean).join(" "),
      [cleanTitle, cleanType].filter(Boolean).join(" "),
      [cleanTitle, cleanNote].filter(Boolean).join(" "),
      [cleanCreator, cleanType].filter(Boolean).join(" "),
    ];

    const hintTerms = [cleanCreator, cleanType];

    const wikiTitle = await resolveWikipediaTitleWithFallback(
      candidates,
      hintTerms,
    );
    if (!wikiTitle) {
      return NextResponse.json({ tags: [] });
    }

    const tags = await getTagsFromWikipediaTitle(wikiTitle);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Wikipedia tag generation error:", error);
    return NextResponse.json({ tags: [] });
  }
}
