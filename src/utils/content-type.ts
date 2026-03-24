/**
 * Maps any content type string (including AI-generated or legacy values)
 * to the canonical ContentType used across the app.
 */
const CANONICAL_MAP: Record<string, string> = {
  book: "Book",
  novel: "Book",
  "book series": "Book",
  movie: "Movie",
  film: "Movie",
  "short film": "Movie",
  "tv show": "Tv Show",
  "tv series": "Tv Show",
  "television show": "Tv Show",
  "television series": "Tv Show",
  series: "Tv Show",
  podcast: "Podcast",
  "podcast episode": "Podcast",
  "podcast series": "Podcast",
  music: "Music",
  song: "Music",
  album: "Music",
  "music album": "Music",
  game: "Game",
  "video game": "Game",
  videogame: "Game",
  creator: "Creator",
  article: "Article",
  essay: "Article",
  blog: "Article",
  painting: "Painting",
  artwork: "Painting",
  other: "Other",
};

export function normalizeContentType(type: string): string {
  const lower = (type || "").toLowerCase().trim();
  // All youtube variants (YouTube Channel, Youtube Video, YouTube, etc.)
  if (lower.startsWith("youtube") || lower.includes("youtube channel")) {
    return "Youtube";
  }
  return CANONICAL_MAP[lower] ?? type;
}
