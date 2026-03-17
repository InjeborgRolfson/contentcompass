'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Bookmark, Clock, User, Pencil, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const contentTypeEmojis: Record<string, string> = {
  book: '📚',
  movie: '🎬',
  'tv show': '📺',
  podcast: '🎙️',
  music: '🎵',
  game: '🎮',
  article: '📝',
  youtube: '▶️',
  other: '🌐',
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
  };
  onEdit?: (fav: any) => void;
  onDelete?: (id: string) => void;
}

const FavoriteCard: React.FC<FavoriteProps> = ({ favorite, onEdit, onDelete }) => {
  const { t } = useLanguage();

  const getContentTypeEmoji = (type: string): string => {
    return contentTypeEmojis[type.toLowerCase()] || '🌐';
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-indigo-50 hover:shadow-xl hover:shadow-indigo-100 transition-all group relative">
      <div className="flex justify-between items-start mb-4">
        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider">
          {t(favorite.type.toLowerCase() as any)}
        </span>
        <div className="flex items-center gap-2">
          {/* Action Buttons - Always visible on mobile screens, only on hover on desktop */}
          <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit?.(favorite)}
              className="p-2 bg-white hover:bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-50 shadow-sm transition-colors"
              title={t('edit' as any)}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete?.(favorite._id)}
              className="p-2 bg-white hover:bg-red-50 text-red-500 rounded-xl border border-indigo-50 shadow-sm transition-colors"
              title={t('delete' as any)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <Bookmark className="w-5 h-5 text-indigo-100 group-hover:text-indigo-300 transition-colors" />
        </div>
      </div>
      
{favorite.photo ? (
        <div className="mb-4 rounded-xl overflow-hidden">
          <img
            src={favorite.photo}
            alt={favorite.title}
            className="w-16 h-16 object-cover rounded-xl"
          />
        </div>
      ) : (
        <div className="mb-4 w-16 h-16 bg-indigo-50 rounded-xl flex flex-col items-center justify-center">
          <div className="text-2xl">{getContentTypeEmoji(favorite.type)}</div>
          <div className="text-[9px] text-indigo-400 font-bold mt-1 text-center px-1">
            {favorite.type.substring(0, 8)}
          </div>
        </div>
      )}
      
      <h3 className="text-xl font-extrabold text-indigo-950 mb-3 group-hover:text-indigo-600 transition-colors">
        {favorite.title}
      </h3>
      
      <div className="space-y-2 mb-6 text-sm text-indigo-900/60 font-medium">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>{favorite.creator}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{favorite.year}</span>
        </div>
      </div>

      <div className="bg-indigo-50/50 p-4 rounded-2xl mb-6 relative">
        <p className="text-sm italic text-indigo-900/80 leading-relaxed">
          "{favorite.note}"
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {favorite.tags.map((tag, idx) => (
          <span 
            key={idx}
            className="px-3 py-1.5 bg-white border border-indigo-50 text-indigo-600/70 text-[10px] font-bold rounded-xl uppercase"
          >
            # {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default FavoriteCard;
