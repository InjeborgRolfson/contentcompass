'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Bookmark, Clock, User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FavoriteProps {
  favorite: {
    _id: string;
    type: string;
    title: string;
    creator: string;
    year: string;
    note: string;
    tags: string[];
  };
}

const FavoriteCard: React.FC<FavoriteProps> = ({ favorite }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-indigo-50 hover:shadow-xl hover:shadow-indigo-100 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider">
          {t(favorite.type.toLowerCase() as any)}
        </span>
        <Bookmark className="w-5 h-5 text-indigo-100 group-hover:text-indigo-300 transition-colors" />
      </div>
      
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
