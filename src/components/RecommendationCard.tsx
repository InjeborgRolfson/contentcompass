"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { normalizeContentType } from "@/utils/content-type";
import {
  Bookmark,
  BookmarkCheck,
  Sparkles,
  User,
  Calendar,
  Info,
  Trash2,
  Eye,
} from "lucide-react";

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
  other: "🌐",
};
const getTypeBadgeStyle = (type: string): React.CSSProperties => {
  const styles: Record<string, React.CSSProperties> = {
    book: {
      backgroundColor: "#EAF3DE",
      color: "#3B6D11",
      borderColor: "#C0DD97",
    },
    movie: {
      backgroundColor: "#E6F1FB",
      color: "#185FA5",
      borderColor: "#B5D4F4",
    },
    "tv show": {
      backgroundColor: "#EEEDFE",
      color: "#534AB7",
      borderColor: "#CECBF6",
    },
    game: {
      backgroundColor: "#FAEEDA",
      color: "#854F0B",
      borderColor: "#FAC775",
    },
    music: {
      backgroundColor: "#FBEAF0",
      color: "#993556",
      borderColor: "#F4C0D1",
    },
    podcast: {
      backgroundColor: "#FAECE7",
      color: "#993C1D",
      borderColor: "#F5C4B3",
    },
    creator: {
      backgroundColor: "#E0E7FF",
      color: "#3730A3",
      borderColor: "#C7D2FE",
    },
    article: {
      backgroundColor: "#E1F5EE",
      color: "#0F6E56",
      borderColor: "#9FE1CB",
    },
    youtube: {
      backgroundColor: "#FCEBEB",
      color: "#A32D2D",
      borderColor: "#F7C1C1",
    },
  };
  return (
    styles[type.toLowerCase()] ?? {
      backgroundColor: "#EEF2FF",
      color: "#4338CA",
      borderColor: "#C7D2FE",
    }
  );
};
interface RecommendationProps {
  recommendation: {
    id: string;
    type: string;
    title: string;
    creator: string;
    year: string;
    description: string;
    description_en?: string;
    description_tr?: string;
    why: string;
    why_en?: string;
    why_tr?: string;
    tags: string[];
    photo?: string;
    isWildcard?: boolean;
    savedFrom?: "library" | "discover";
  };
  isSavedPage?: boolean;
  onRemove?: (id: string) => void;
  isSeenInDB?: boolean;
  onMarkAsSeen?: (title: string, type: string) => void;
}

const RecommendationCard: React.FC<RecommendationProps> = ({
  recommendation,
  isSavedPage = false,
  onRemove,
  isSeenInDB = false,
  onMarkAsSeen,
}) => {
  const [isSaved, setIsSaved] = useState(isSavedPage);
  const [saving, setSaving] = useState(false);
  const [whyExpanded, setWhyExpanded] = useState(false);
  const [userMarkedAsSeenThisSession, setUserMarkedAsSeenThisSession] =
    useState(false);
  const [marking, setMarking] = useState(false);
  const { t, formatText, language } = useLanguage();

  const getContentTypeEmoji = (type: string): string => {
    return contentTypeEmojis[type.toLowerCase()] || "🌐";
  };

  const getLanguageSpecificField = (
    bilingualField: string,
    fallbackField: string,
  ): string => {
    const isTurkish = String(language).toUpperCase() === "TR";
    const langSuffix = isTurkish ? "_tr" : "_en";
    const bilingualValue = (recommendation as any)[
      `${bilingualField}${langSuffix}`
    ];

    if (bilingualValue && bilingualValue.trim()) {
      return bilingualValue;
    }

    return fallbackField;
  };

  const handleSave = async () => {
    if (isSaved && !isSavedPage) return;
    if (isSavedPage && onRemove && recommendation.id) {
      setSaving(true);
      try {
        const res = await fetch("/api/recommendations/save", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: recommendation.id }),
        });
        if (res.ok) onRemove(recommendation.id);
      } catch (err) {
        console.error(err);
      } finally {
        setSaving(false);
      }
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/recommendations/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...recommendation, savedFrom: "discover" }),
      });

      if (res.ok) {
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsSeen = async () => {
    setMarking(true);
    setUserMarkedAsSeenThisSession(true);
    try {
      const res = await fetch("/api/seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: recommendation.title,
          type: recommendation.type,
        }),
      });

      if (res.ok) {
        if (onMarkAsSeen) {
          onMarkAsSeen(recommendation.title, recommendation.type);
        }
      }
    } catch (err) {
      console.error("Error marking as seen:", err);
    } finally {
      setMarking(false);
    }
  };

  const isFaded = isSeenInDB || userMarkedAsSeenThisSession;
  const isWildcard = recommendation.isWildcard === true;
  const displayType = normalizeContentType(recommendation.type || "Other");

  return (
    <div
      className={`rounded-[2rem] p-8 transition-all group flex flex-col h-full relative overflow-hidden ${
        isWildcard
          ? "bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-high border-2 border-primary/30 shadow-lg shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30"
          : "bg-surface-container border border-outline-variant shadow-sm hover:shadow-2xl hover:shadow-surface-container"
      } ${
        isFaded ? "opacity-40 pointer-events-none" : "opacity-100"
      } transition-all duration-500`}
      style={
        isWildcard
          ? {
              backgroundImage:
                "radial-gradient(circle at 20% 50%, rgba(73, 12, 15, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(73, 12, 15, 0.05) 0%, transparent 50%)",
            }
          : {}
      }
    >
      {isWildcard && (
        <>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-2 right-4 text-primary/20 text-xl">
              ✦
            </div>
            <div className="absolute top-1/4 left-2 text-primary/15 text-lg">
              ✦
            </div>
            <div className="absolute bottom-1/3 right-1/4 text-primary/10 text-base">
              ✦
            </div>
            <div className="absolute bottom-4 left-1/3 text-primary/20 text-sm">
              ✦
            </div>
          </div>
        </>
      )}
      <div className="flex justify-between items-start mb-6 gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <span
            className="px-4 py-1.5 text-[10px] font-black rounded-full tracking-widest border font-label"
            style={getTypeBadgeStyle(displayType)}
          >
            {formatText(
              t(displayType.toLowerCase() as any) || displayType,
              "upper",
            )}
          </span>
          {isWildcard && (
            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full tracking-widest border-2 border-primary/30 flex items-center gap-1.5 shadow-md font-label">
              <span className="text-sm">✦</span> {t("wildcard")}
            </span>
          )}
          {isSavedPage && recommendation.savedFrom === "library" && (
            <span className="px-2.5 py-1 text-[9px] font-black rounded-full tracking-widest border bg-surface-container text-on-surface/70 border-outline-variant font-label">
              {t("library")}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {!isSavedPage && (
            <button
              onClick={handleMarkAsSeen}
              disabled={marking || isFaded}
              className={`p-3 rounded-2xl transition-all ${
                isFaded
                  ? "bg-surface-container-high text-on-surface/30 cursor-default"
                  : "bg-surface-container text-on-surface/50 hover:text-on-surface hover:bg-surface-container-high border border-transparent hover:border-outline-variant"
              }`}
              title={t("alreadySeen")}
            >
              <Eye className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving || (isSaved && !isSavedPage)}
            className={`p-3 rounded-2xl transition-all ${
              isSaved
                ? "bg-primary text-on-primary shadow-lg shadow-primary/40"
                : "bg-surface-container/50 text-on-surface/30 hover:text-primary hover:bg-surface-container-high border border-transparent hover:border-primary/30"
            }`}
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>

          {isSavedPage && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="p-3 rounded-2xl bg-error/10 text-error hover:bg-error hover:text-on-primary transition-all border border-error/30 hover:border-error shadow-sm hover:shadow-lg hover:shadow-error/20 group/delete"
              title={t("delete")}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 items-center mb-6 relative z-10">
        {recommendation.photo ? (
          <div className="rounded-xl overflow-hidden shrink-0">
            <img
              src={recommendation.photo}
              alt={recommendation.title}
              className={`w-16 h-16 object-cover rounded-xl transition-all ${
                isWildcard
                  ? "ring-2 ring-primary/30 shadow-lg shadow-primary/20"
                  : ""
              }`}
            />
          </div>
        ) : (
          <div
            className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 transition-all ${
              isWildcard
                ? "bg-primary/10 ring-2 ring-primary/30"
                : "bg-surface-container-high"
            }`}
          >
            <div className="text-2xl">
              {getContentTypeEmoji(displayType)}
            </div>
            <div
              className={`text-[9px] font-bold mt-1 text-center px-1 font-label ${
                isWildcard ? "text-primary" : "text-primary/40"
              }`}
            >
              {displayType.substring(0, 8)}
            </div>
          </div>
        )}

        <h3
          className={`text-2xl font-black transition-colors leading-tight font-headline ${
            isWildcard
              ? "text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary group-hover:from-primary/90 group-hover:to-secondary/90"
              : "text-on-surface group-hover:text-primary"
          }`}
        >
          {recommendation.title}
        </h3>
      </div>

      <div className="mb-6 relative z-10">
        <div
          className={`flex flex-wrap gap-4 text-xs font-bold uppercase tracking-tighter font-label ${
            isWildcard ? "text-primary/50" : "text-on-surface/40"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>{recommendation.creator}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{recommendation.year}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6 flex-grow relative z-10">
        <div className="relative">
          <Info
            className={`w-4 h-4 absolute -left-6 top-1 ${
              isWildcard ? "text-primary/30" : "text-outline-variant"
            }`}
          />
          <p
            className={`text-sm leading-relaxed font-medium font-body ${
              isWildcard ? "text-primary/75" : "text-on-surface/70"
            }`}
          >
            {getLanguageSpecificField(
              "description",
              recommendation.description,
            )}
          </p>
        </div>

        {(getLanguageSpecificField("why", recommendation.why) || "").trim() && recommendation.savedFrom === "discover" && <div
          className={`rounded-3xl p-6 border-2 relative overflow-hidden ${
            isWildcard
              ? "bg-primary/5 border-primary/30 shadow-md shadow-primary/10"
              : "bg-surface-container-high border-outline-variant"
          }`}
        >
          <div
            className={`absolute top-0 right-0 p-4 opacity-10 ${
              isWildcard ? "text-primary" : "text-primary"
            }`}
          >
            <Sparkles className="w-8 h-8" />
          </div>
          <h4
            className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 font-label ${
              isWildcard ? "text-primary" : "text-primary"
            }`}
          >
            <Sparkles
              className={`w-3.5 h-3.5 ${isWildcard ? "animate-pulse" : ""}`}
            />
            {t("whyWeRecommend")}
          </h4>
          <p
            className={`text-sm leading-relaxed italic font-medium font-body ${whyExpanded ? "" : "line-clamp-2"} ${
              isWildcard ? "text-primary/85" : "text-on-surface/80"
            }`}
          >
            "{getLanguageSpecificField("why", recommendation.why)}"
          </p>
          <button
            onClick={() => setWhyExpanded(!whyExpanded)}
            className={`text-[10px] font-bold mt-1 transition-colors font-label ${
              isWildcard
                ? "text-primary/60 hover:text-primary"
                : "text-primary/40 hover:text-primary"
            }`}
          >
            {whyExpanded ? "↑ daha az" : "↓ devamını gör"}
          </button>
        </div>}
      </div>

      <div className="mt-8 flex flex-wrap gap-2 relative z-10">
        {(recommendation.tags || []).map((tag, idx) => (
          <span
            key={idx}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-xl uppercase transition-all font-label ${
              isWildcard
                ? "bg-primary/10 border border-primary/30 text-primary shadow-md shadow-primary/10"
                : "bg-surface-container border border-outline-variant text-primary/60 shadow-sm"
            }`}
          >
            # {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RecommendationCard;
