"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Loader2, Library, User, Calendar, Bookmark, BookmarkCheck } from "lucide-react";
import { getTypeBadgeStyle, getTypeColor } from "@/utils/categoryColors";
import { ContentType } from "@/types/content";
import Pagination from "@/components/Pagination";
import { normalizeContentType } from "@/utils/content-type";

const ALL_TYPES: ContentType[] = [
  "Book",
  "Movie",
  "Tv Show",
  "Podcast",
  "Music",
  "Game",
  "Creator",
  "Article",
  "Youtube",
  "Painting",
  "Other",
];

const contentTypeEmojis: Record<string, string> = {
  book: "📚",
  movie: "🎬",
  "tv show": "📺",
  podcast: "🎙️",
  music: "🎵",
  game: "🎮",
  creator: "👤",
  article: "📝",
  youtube: "▶️",
  painting: "🎨",
  other: "🌐",
};

interface ContentItem {
  id: number | string;

  type: string;
  title: string;
  creator: string;
  year: string;
  description_en: string;
  description_tr: string;
  photo: string | null;
  tags: string[];
  slug: string;
}

export default function LibraryPage() {
  const { t, formatText, language } = useLanguage();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [savedTitles, setSavedTitles] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string | number>>(new Set());


  const fetchLibrary = useCallback(async (type: string, page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (type !== "all") params.set("type", type);
      const res = await fetch(`/api/library?${params}`);
      const data = await res.json();
      if (!data.error) {
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 0);
        setCurrentPage(data.page ?? 0);
      } else {
        console.error("Library API error:", data.error, data.details);
      }
    } catch (err) {
      console.error("Failed to fetch library:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSavedTitles = useCallback(async () => {
    try {
      const res = await fetch("/api/recommendations/save");
      if (!res.ok) return;
      const data = await res.json();
      const titles = new Set<string>(
        (Array.isArray(data?.data) ? data.data : []).map((item: any) => item.title as string),
      );
      setSavedTitles(titles);
    } catch (err) {
      console.error("Failed to fetch saved titles:", err);
    }
  }, []);

  useEffect(() => {
    fetchLibrary(activeType, 0);
  }, [activeType, fetchLibrary]);

  useEffect(() => {
    fetchSavedTitles();
  }, [fetchSavedTitles]);

  const handleTypeChange = (type: string) => {
    setActiveType(type);
    setCurrentPage(0);
  };

  const handlePageChange = (page: number) => {
    fetchLibrary(activeType, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (e: React.MouseEvent, item: ContentItem) => {
    e.preventDefault();
    e.stopPropagation();
    if (savedTitles.has(item.title) || savingIds.has(item.id)) return;


    setSavingIds((prev) => new Set(prev).add(item.id));

    try {
      const res = await fetch("/api/recommendations/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: item.type,
          title: item.title,
          creator: item.creator,
          year: item.year,
          description: item.description_en || item.description_tr || "",
          description_en: item.description_en,
          description_tr: item.description_tr,
          why: "",
          tags: item.tags,
          photo: item.photo,
          savedFrom: "library",
        }),
      });
      if (res.ok) {
        setSavedTitles((prev) => new Set(prev).add(item.title));
      }
    } catch (err) {
      console.error("Failed to save item:", err);
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);

        return next;
      });
    }
  };

  const getDescription = (item: ContentItem) => {
    if (language === "TR" && item.description_tr) return item.description_tr;
    return item.description_en || item.description_tr || "";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-theme-600 p-2.5 rounded-2xl">
            <Library className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-theme-900">
            {t("publicLibrary")}
          </h1>
        </div>
        <p className="text-theme-900/50 font-medium ml-14">
          {t("librarySubtitle")}
          {total > 0 && (
            <span className="ml-2 bg-theme-50 text-theme-600 px-3 py-0.5 rounded-full text-xs font-bold border border-theme-100">
              {total}
            </span>
          )}
        </p>
      </div>

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => handleTypeChange("all")}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border ${
            activeType === "all"
              ? "bg-theme-600 text-white border-theme-600 shadow-md"
              : "bg-white text-theme-600 border-theme-100 hover:bg-theme-50"
          }`}
        >
          {t("allTypes")}
        </button>
        {ALL_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border ${
              activeType === type
                ? "border-2 shadow-md"
                : "bg-white hover:opacity-80"
            }`}
            style={
              activeType === type
                ? {
                    backgroundColor: getTypeColor(type),
                    borderColor: getTypeColor(type),
                    color: "#ffffff",
                    borderWidth: "2px",
                  }
                : {
                    ...getTypeBadgeStyle(type),
                    opacity: 0.75,
                  }
            }
          >
            {contentTypeEmojis[type.toLowerCase()] ?? "🌐"}{" "}
            {t(type.toLowerCase() as any) || type}
          </button>
        ))}
      </div>

      {/* Content grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-theme-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-theme-100 flex flex-col items-center gap-4">
          <Library className="w-12 h-12 text-theme-100" />
          <p className="text-theme-900/40 text-lg font-bold">
            {t("noLibraryResults")}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((item) => (
              <Link
                key={item.id}

                href={`/content/${item.slug}`}
                className="group bg-white rounded-3xl overflow-hidden border border-theme-50 shadow-sm hover:shadow-xl hover:shadow-theme-100 transition-all duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-theme-50">
                  {item.photo ? (
                    <img
                      src={item.photo}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <span className="text-5xl">
                        {contentTypeEmojis[normalizeContentType(item.type).toLowerCase()] ?? "🌐"}
                      </span>
                      <span className="text-xs font-bold text-theme-300 uppercase tracking-widest">
                        {item.type}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span
                      className="px-3 py-1 text-[9px] font-black rounded-full tracking-widest border"
                      style={getTypeBadgeStyle(normalizeContentType(item.type).toLowerCase())}
                    >
                      {formatText(
                        t(normalizeContentType(item.type).toLowerCase() as any) || item.type,
                        "upper",
                      )}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => handleSave(e, item)}
                      disabled={savingIds.has(item.id)}

                      className={`p-3 rounded-2xl transition-all shadow-md ${
                        savedTitles.has(item.title)
                          ? "bg-theme-600 text-white shadow-theme-200"
                          : "bg-white text-theme-400 hover:text-theme-600 hover:bg-theme-50 border border-theme-100"
                      }`}
                    >
                      {savedTitles.has(item.title) ? (
                        <BookmarkCheck className="w-5 h-5" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="text-base font-black text-theme-950 group-hover:text-theme-600 transition-colors leading-tight mb-2 line-clamp-2">
                    {item.title}
                  </h2>
                  <div className="flex flex-col gap-1 text-[11px] font-bold text-theme-900/40 uppercase tracking-tight mt-auto">
                    {item.creator && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{item.creator}</span>
                      </div>
                    )}
                    {item.year && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>{item.year}</span>
                      </div>
                    )}
                  </div>
                  {getDescription(item) && (
                    <p className="text-xs text-theme-900/55 mt-3 line-clamp-2 leading-relaxed">
                      {getDescription(item)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
