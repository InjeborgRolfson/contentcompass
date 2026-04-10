"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { User, Calendar, ArrowLeft, Tag, Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { normalizeContentType } from "@/utils/content-type";
import { getTypeBadgeStyle } from "@/utils/categoryColors";

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

interface ContentEntry {
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

export default function ContentDetailClient({ entry }: { entry: ContentEntry }) {
  const { t, formatText, language } = useLanguage();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        const res = await fetch("/api/recommendations/save");
        if (!res.ok) return;
        const data = await res.json();
        const saved = (Array.isArray(data?.data) ? data.data : []).some(
          (item: any) => item.title === entry.title,
        );
        setIsSaved(saved);
      } catch (err) {
        console.error("Failed to check saved state:", err);
      }
    };
    checkIfSaved();
  }, [entry.title]);

  const handleSave = async () => {
    if (isSaved || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/recommendations/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: entry.type,
          title: entry.title,
          creator: entry.creator,
          year: entry.year,
          description: entry.description_en || entry.description_tr || "",
          description_en: entry.description_en,
          description_tr: entry.description_tr,
          why: "",
          tags: entry.tags,
          photo: entry.photo,
          savedFrom: "library",
        }),
      });
      if (res.ok) setIsSaved(true);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  const description =
    language === "TR" && entry.description_tr
      ? entry.description_tr
      : entry.description_en || entry.description_tr || "";

  const displayType = normalizeContentType(entry.type || "Other");
  const badgeStyle = getTypeBadgeStyle(displayType);
  const emoji = contentTypeEmojis[displayType.toLowerCase()] ?? "🌐";

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero image section */}
      <div className="relative w-full bg-primary overflow-hidden" style={{ minHeight: "60vh" }}>
        {entry.photo ? (
          <>
            {/* Blurred background fill */}
            <div
              className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-40"
              style={{ backgroundImage: `url(${entry.photo})` }}
              aria-hidden="true"
            />
            {/* Main image centered */}
            <div className="relative z-10 flex items-center justify-center py-12 px-4" style={{ minHeight: "60vh" }}>
              <img
                src={entry.photo}
                alt={entry.title}
                className="max-h-[70vh] w-auto max-w-full rounded-3xl shadow-2xl object-contain"
                style={{ maxWidth: "min(480px, 90vw)" }}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-24" style={{ minHeight: "40vh" }}>
            <span className="text-8xl">{emoji}</span>
            <span className="text-on-primary/30 text-lg font-bold uppercase tracking-widest">
              {displayType}
            </span>
          </div>
        )}

        <div className="absolute top-4 left-4 z-20">
          <Link
            href="/library"
            className="flex items-center gap-2 px-4 py-2 bg-on-primary/10 backdrop-blur-md text-on-primary rounded-xl text-sm font-bold hover:bg-on-primary/20 transition-colors border border-on-primary/20"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToLibrary")}
          </Link>
        </div>

        {/* Save button overlay */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={handleSave}
            disabled={saving || isSaved}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border font-label ${
              isSaved
                ? "bg-surface text-on-surface border-outline shadow-lg shadow-primary/20"
                : "bg-on-primary/10 backdrop-blur-md text-on-primary border-on-primary/20 hover:bg-on-primary/20"
            }`}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSaved ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
            {isSaved ? t("saved") : t("saveItem")}
          </button>
        </div>
      </div>

      {/* Content section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Type badge */}
        <div className="mb-4">
          <span
            className="px-4 py-1.5 text-[10px] font-black rounded-full tracking-widest border font-label"
            style={badgeStyle}
          >
            {formatText(t(displayType.toLowerCase() as any) || displayType, "upper")}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-black text-on-surface leading-tight mb-6 font-headline">
          {entry.title}
        </h1>

        {/* Meta info */}
        <div className="flex flex-wrap gap-6 text-sm font-bold text-on-surface/50 uppercase tracking-tight mb-8 font-label">
          {entry.creator && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{entry.creator}</span>
            </div>
          )}
          {entry.year && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{entry.year}</span>
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="mb-8">
          <button
            onClick={handleSave}
            disabled={saving || isSaved}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all border shadow-sm font-label ${
              isSaved
                ? "bg-primary text-on-primary border-primary/80 shadow-primary/20 cursor-default"
                : "bg-surface-container text-primary border-outline-variant hover:bg-surface-container-high hover:border-outline hover:shadow-md"
            }`}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSaved ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
            {isSaved ? t("saved") : t("saveItem")}
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-outline-variant mb-8" />

        {/* Description */}
        {description && (
          <p className="text-lg leading-relaxed text-on-surface/75 font-medium mb-10 font-body">
            {description}
          </p>
        )}

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {entry.tags.map((tag, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container border border-outline-variant text-primary/70 text-xs font-bold rounded-xl shadow-sm uppercase tracking-wider font-label"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Back link */}
        <Link
          href="/library"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/70 transition-colors font-label"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backToLibrary")}
        </Link>
      </div>
    </div>
  );
}
