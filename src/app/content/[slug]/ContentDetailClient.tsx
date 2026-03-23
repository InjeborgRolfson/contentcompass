"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { User, Calendar, ArrowLeft, Tag } from "lucide-react";

const getTypeBadgeStyle = (type: string): React.CSSProperties => {
  const styles: Record<string, React.CSSProperties> = {
    book: { backgroundColor: "#EAF3DE", color: "#3B6D11", borderColor: "#C0DD97" },
    movie: { backgroundColor: "#E6F1FB", color: "#185FA5", borderColor: "#B5D4F4" },
    "tv show": { backgroundColor: "#EEEDFE", color: "#534AB7", borderColor: "#CECBF6" },
    game: { backgroundColor: "#FAEEDA", color: "#854F0B", borderColor: "#FAC775" },
    music: { backgroundColor: "#FBEAF0", color: "#993556", borderColor: "#F4C0D1" },
    podcast: { backgroundColor: "#FAECE7", color: "#993C1D", borderColor: "#F5C4B3" },
    creator: { backgroundColor: "#E0E7FF", color: "#3730A3", borderColor: "#C7D2FE" },
    article: { backgroundColor: "#E1F5EE", color: "#0F6E56", borderColor: "#9FE1CB" },
    youtube: { backgroundColor: "#FCEBEB", color: "#A32D2D", borderColor: "#F7C1C1" },
    painting: { backgroundColor: "#FEF9C3", color: "#854D0E", borderColor: "#FDE047" },
  };
  return (
    styles[type.toLowerCase()] ?? {
      backgroundColor: "#EEF2FF",
      color: "#4338CA",
      borderColor: "#C7D2FE",
    }
  );
};

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
  _id: string;
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

  const description =
    language === "TR" && entry.description_tr
      ? entry.description_tr
      : entry.description_en || entry.description_tr || "";

  const badgeStyle = getTypeBadgeStyle(entry.type);
  const emoji = contentTypeEmojis[entry.type.toLowerCase()] ?? "🌐";

  return (
    <div className="min-h-screen">
      {/* Hero image section */}
      <div className="relative w-full bg-theme-950 overflow-hidden" style={{ minHeight: "60vh" }}>
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
            <span className="text-white/30 text-lg font-bold uppercase tracking-widest">
              {entry.type}
            </span>
          </div>
        )}

        {/* Back button overlay */}
        <div className="absolute top-4 left-4 z-20">
          <Link
            href="/library"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-xl text-sm font-bold hover:bg-white/20 transition-colors border border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToLibrary")}
          </Link>
        </div>
      </div>

      {/* Content section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Type badge */}
        <div className="mb-4">
          <span
            className="px-4 py-1.5 text-[10px] font-black rounded-full tracking-widest border"
            style={badgeStyle}
          >
            {formatText(t(entry.type.toLowerCase() as any) || entry.type, "upper")}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-black text-theme-950 leading-tight mb-6">
          {entry.title}
        </h1>

        {/* Meta info */}
        <div className="flex flex-wrap gap-6 text-sm font-bold text-theme-900/50 uppercase tracking-tight mb-8">
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

        {/* Divider */}
        <div className="h-px bg-theme-100 mb-8" />

        {/* Description */}
        {description && (
          <p className="text-lg leading-relaxed text-theme-900/75 font-medium mb-10">
            {description}
          </p>
        )}

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {entry.tags.map((tag, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-theme-100 text-theme-600/70 text-xs font-bold rounded-xl shadow-sm uppercase tracking-wider"
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
          className="inline-flex items-center gap-2 text-sm font-bold text-theme-600 hover:text-theme-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backToLibrary")}
        </Link>
      </div>
    </div>
  );
}
