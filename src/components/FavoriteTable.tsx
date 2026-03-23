'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Pencil, Trash2, Clock, User } from 'lucide-react';

interface FavoriteTableProps {
  favorites: any[];
  onEdit?: (fav: any) => void;
  onDelete?: (id: string) => void;
}

const FavoriteTable: React.FC<FavoriteTableProps> = ({ 
  favorites, 
  onEdit,
  onDelete,
}) => {
  const { t, formatText } = useLanguage();

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

  const getContentTypeEmoji = (type: string): string => {
    return contentTypeEmojis[type.toLowerCase()] || '🌐';
  };

  const getTypeBadgeStyle = (type: string): React.CSSProperties => {
    const styles: Record<string, React.CSSProperties> = {
      book:     { backgroundColor: '#EAF3DE', color: '#3B6D11', borderColor: '#C0DD97' },
      movie:    { backgroundColor: '#E6F1FB', color: '#185FA5', borderColor: '#B5D4F4' },
      'tv show':{ backgroundColor: '#EEEDFE', color: '#534AB7', borderColor: '#CECBF6' },
      game:     { backgroundColor: '#FAEEDA', color: '#854F0B', borderColor: '#FAC775' },
      music:    { backgroundColor: '#FBEAF0', color: '#993556', borderColor: '#F4C0D1' },
      podcast:  { backgroundColor: '#FAECE7', color: '#993C1D', borderColor: '#F5C4B3' },
      article:  { backgroundColor: '#E1F5EE', color: '#0F6E56', borderColor: '#9FE1CB' },
      youtube:  { backgroundColor: '#FCEBEB', color: '#A32D2D', borderColor: '#F7C1C1' },
    };
    return styles[type.toLowerCase()] ?? { backgroundColor: '#EEF2FF', color: '#4338CA', borderColor: '#C7D2FE' };
  };

  return (
    <div className="overflow-hidden bg-white rounded-[2rem] shadow-sm border border-indigo-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-indigo-50 bg-indigo-50/30 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              <th className="px-8 py-6">{t('contentType')}</th>
              <th className="px-8 py-6">{t('title')}</th>
              <th className="px-8 py-6">{t('creator')}</th>
              <th className="px-8 py-6">{t('year')}</th>
              <th className="px-8 py-6">{t('note')}</th>
              <th className="px-8 py-6 text-center w-32">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-50">
            {favorites.map((fav, idx) => (
              <tr 
                key={idx}
                className="hover:bg-indigo-50/20 transition-colors group"
              >
                <td className="px-8 py-6 whitespace-nowrap">
                  <span 
                    className="px-3 py-1 text-xs font-bold rounded-full tracking-wider border inline-flex items-center gap-1"
                    style={getTypeBadgeStyle(fav.type)}
                  >
                    <span>{getContentTypeEmoji(fav.type)}</span>
                    <span>{formatText(t(fav.type.toLowerCase() as any) || fav.type, 'upper')}</span>
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-bold text-indigo-950 group-hover:text-indigo-600 transition-colors block max-w-xs md:max-w-md overflow-hidden text-overflow-ellipsis whitespace-nowrap">
                    {fav.title}
                  </span>
                </td>
                <td className="px-8 py-6 text-sm text-indigo-900/60 font-medium">
                  {fav.creator || '—'}
                </td>
                <td className="px-8 py-6 text-sm text-indigo-900/40 font-bold tabular-nums">
                  {fav.year || '—'}
                </td>
                <td className="px-8 py-6 text-sm text-indigo-900/60 font-medium max-w-xs overflow-hidden text-overflow-ellipsis whitespace-nowrap">
                  {fav.note || '—'}
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 justify-center">
                    <button
                      onClick={() => onEdit?.(fav)}
                      className="p-2 rounded-xl transition-all bg-indigo-50/50 text-indigo-300 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100"
                      title={t('edit' as any)}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete?.(fav._id)}
                      className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100 hover:border-red-500"
                      title={t('delete' as any)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FavoriteTable;
