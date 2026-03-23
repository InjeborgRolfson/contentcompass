"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Clock, User } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
interface FavoriteProps {
  favorite: {
    _id: string;
    type: string;
    title: string;
    creator: string;
    year: string;
    note: string;
    tags: string[];
    photo?: string;
    isCreator?: boolean;
  };
  onEdit?: (fav: any) => void;
}

const FavoriteCard: React.FC<FavoriteProps> = ({ favorite, onEdit }) => {
  const { t, formatText } = useLanguage();

  const getContentTypeEmoji = (type: string): string => {
    return contentTypeEmojis[type.toLowerCase()] || "🌐";
  };

  return (
    <div
      onClick={() => onEdit?.(favorite)}
      className="bg-white rounded-3xl p-6 shadow-sm border border-theme-50 hover:shadow-xl hover:shadow-theme-100 transition-all group relative cursor-pointer active:scale-[0.98]"
    >
      <div className="flex gap-4 items-center mb-4">
        {favorite.photo ? (
          <div className="rounded-xl overflow-hidden shrink-0">
            <img
              src={favorite.photo}
              alt={favorite.title}
              className="w-16 h-16 object-cover rounded-xl"
            />
          </div>
        ) : (
          <div className="w-16 h-16 bg-theme-50 rounded-xl flex flex-col items-center justify-center shrink-0">
            <div className="text-2xl">{getContentTypeEmoji(favorite.type)}</div>
            <div className="text-[9px] text-theme-400 font-bold mt-1 text-center px-1">
              {favorite.type.substring(0, 8)}
            </div>
          </div>
        )}

        <h3 className="text-xl font-extrabold text-theme-950 group-hover:text-theme-600 transition-colors line-clamp-2">
          {favorite.title}
        </h3>
      </div>

      <div className="flex items-center gap-3 mb-6 text-sm text-theme-900/60 font-medium">
        {favorite.creator && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{favorite.creator}</span>
          </div>
        )}
        {favorite.year && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{favorite.year}</span>
          </div>
        )}
      </div>

      {favorite.note && (
        <div className="bg-theme-50/50 p-4 rounded-2xl mb-6 relative">
          <p className="text-sm italic text-theme-900/80 leading-relaxed">
            "{favorite.note}"
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {favorite.tags.map((tag, idx) => (
          <span
            key={idx}
            className="px-3 py-1.5 bg-white border border-theme-50 text-theme-600/70 text-[10px] font-bold rounded-xl uppercase"
          >
            # {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default FavoriteCard;
