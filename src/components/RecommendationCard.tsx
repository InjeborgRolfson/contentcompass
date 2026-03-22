'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Bookmark, BookmarkCheck, Sparkles, User, Calendar, Info, Trash2, Eye } from 'lucide-react';

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
interface RecommendationProps {
  recommendation: {
    _id?: string;
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
  const [userMarkedAsSeenThisSession, setUserMarkedAsSeenThisSession] = useState(false);
  const [marking, setMarking] = useState(false);
  const { t, formatText, language } = useLanguage();

  const getContentTypeEmoji = (type: string): string => {
    return contentTypeEmojis[type.toLowerCase()] || '🌐';
  };

  const getLanguageSpecificField = (
    bilingualField: string,
    fallbackField: string
  ): string => {
    const isTurkish = String(language).toUpperCase() === 'TR';
    const langSuffix = isTurkish ? '_tr' : '_en';
    const bilingualValue = (recommendation as any)[`${bilingualField}${langSuffix}`];
    
    if (bilingualValue && bilingualValue.trim()) {
      return bilingualValue;
    }
    
    return fallbackField;
  };

  const handleSave = async () => {
    if (isSaved && !isSavedPage) return;
    if (isSavedPage && onRemove && recommendation._id) {
      // Logic for deleting on Saved page
      try {
        const res = await fetch('/api/recommendations/save', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: recommendation._id }),
        });
        if (res.ok) onRemove(recommendation._id);
      } catch (err) {
        console.error(err);
      }
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/recommendations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recommendation),
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
      const res = await fetch('/api/seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      console.error('Error marking as seen:', err);
    } finally {
      setMarking(false);
    }
  };

  const isFaded = isSeenInDB || userMarkedAsSeenThisSession;
  const isWildcard = recommendation.isWildcard === true;

  return (
    <div className={`rounded-[2rem] p-8 transition-all group flex flex-col h-full relative overflow-hidden ${
      isWildcard 
        ? 'bg-gradient-to-br from-purple-50 via-white to-purple-50/40 border-2 border-purple-400 shadow-lg shadow-purple-200/60 hover:shadow-2xl hover:shadow-purple-300/80' 
        : 'bg-white border border-indigo-50 shadow-sm hover:shadow-2xl hover:shadow-indigo-100'
    } ${
      isFaded ? 'opacity-40 pointer-events-none' : 'opacity-100'
    } transition-all duration-500`}
    style={isWildcard ? {
      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)'
    } : {}}>
      {isWildcard && (
        <>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-2 right-4 text-purple-200/40 text-xl">✦</div>
            <div className="absolute top-1/4 left-2 text-purple-200/30 text-lg">✦</div>
            <div className="absolute bottom-1/3 right-1/4 text-purple-200/25 text-base">✦</div>
            <div className="absolute bottom-4 left-1/3 text-purple-200/35 text-sm">✦</div>
          </div>
        </>
      )}
      <div className="flex justify-between items-start mb-6 gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <span
            className="px-4 py-1.5 text-[10px] font-black rounded-full tracking-widest border"
            style={getTypeBadgeStyle(recommendation.type)}
          >
            {formatText(t(recommendation.type.toLowerCase() as any) || recommendation.type, 'upper')}
          </span>
          {isWildcard && (
            <span className="px-3 py-1 bg-gradient-to-r from-purple-200 to-purple-100 text-purple-800 text-[10px] font-black rounded-full tracking-widest border-2 border-purple-400 flex items-center gap-1.5 shadow-md">
              <span className="text-sm">✦</span> {t('wildcard')}
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
                  ? 'bg-gray-200 text-gray-400 cursor-default'
                  : 'bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-200'
              }`}
              title={t('alreadySeen')}
            >
              <Eye className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={handleSave}
            disabled={saving || (isSaved && !isSavedPage)}
            className={`p-3 rounded-2xl transition-all ${
              isSaved 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'bg-indigo-50/50 text-indigo-200 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100'
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>

          {isSavedPage && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="p-3 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-100 hover:border-red-500 shadow-sm hover:shadow-lg hover:shadow-red-100 group/delete"
              title={t('delete')}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      
{recommendation.photo ? (
        <div className="mb-6 w-full h-20 flex items-center relative z-10">
          <img
            src={recommendation.photo}
            alt={recommendation.title}
            className={`w-16 h-16 object-cover rounded-xl transition-all ${
              isWildcard ? 'ring-2 ring-purple-300 shadow-lg shadow-purple-200/50' : ''
            }`}
          />
        </div>
      ) : (
        <div className="mb-6 w-full h-20 flex items-center relative z-10">
          <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center transition-all ${
            isWildcard
              ? 'bg-gradient-to-br from-purple-100 to-purple-50 ring-2 ring-purple-300'
              : 'bg-indigo-50'
          }`}>
            <div className="text-2xl">{getContentTypeEmoji(recommendation.type)}</div>
            <div className={`text-[9px] font-bold mt-1 text-center px-1 ${
              isWildcard ? 'text-purple-600' : 'text-indigo-400'
            }`}>
              {recommendation.type.substring(0, 8)}
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6 relative z-10">
        <h3 className={`text-2xl font-black mb-4 transition-colors leading-tight ${
          isWildcard 
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-800 group-hover:from-purple-700 group-hover:to-purple-900' 
            : 'text-indigo-950 group-hover:text-indigo-600'
        }`}>
          {recommendation.title}
        </h3>
        
        <div className={`flex flex-wrap gap-4 text-xs font-bold uppercase tracking-tighter ${
          isWildcard ? 'text-purple-900/60' : 'text-indigo-900/40'
        }`}>
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
          <Info className={`w-4 h-4 absolute -left-6 top-1 ${
            isWildcard ? 'text-purple-300' : 'text-indigo-200'
          }`} />
          <p className={`text-sm leading-relaxed font-medium ${
            isWildcard ? 'text-purple-900/75' : 'text-indigo-900/70'
          }`}>
            {getLanguageSpecificField('description', recommendation.description)}
          </p>
        </div>

        <div className={`rounded-3xl p-6 border-2 relative overflow-hidden ${
          isWildcard
            ? 'bg-gradient-to-br from-purple-100/60 to-purple-50/40 border-purple-300 shadow-md shadow-purple-200/40'
            : 'bg-indigo-50/40 border-indigo-100'
        }`}>
          <div className={`absolute top-0 right-0 p-4 opacity-15 ${
            isWildcard ? 'text-purple-600' : 'text-indigo-600'
          }`}>
            <Sparkles className="w-8 h-8" />
          </div>
          <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${
            isWildcard ? 'text-purple-700' : 'text-indigo-600'
          }`}>
            <Sparkles className={`w-3.5 h-3.5 ${isWildcard ? 'animate-pulse' : ''}`} />
            {t('whyWeRecommend')}
          </h4>
          <p className={`text-sm leading-relaxed italic font-medium ${whyExpanded ? '' : 'line-clamp-2'} ${
            isWildcard ? 'text-purple-900/85' : 'text-indigo-900/80'
          }`}>
            "{getLanguageSpecificField('why', recommendation.why)}"
          </p>
          <button
            onClick={() => setWhyExpanded(!whyExpanded)}
            className={`text-[10px] font-bold mt-1 transition-colors ${
              isWildcard
                ? 'text-purple-500 hover:text-purple-700'
                : 'text-indigo-400 hover:text-indigo-600'
            }`}
          >
            {whyExpanded ? '↑ daha az' : '↓ devamını gör'}
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 relative z-10">
        {recommendation.tags.map((tag, idx) => (
          <span 
            key={idx}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-xl uppercase transition-all ${
              isWildcard
                ? 'bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-300 text-purple-700 shadow-md shadow-purple-200/30'
                : 'bg-white border border-indigo-50 text-indigo-600/60 shadow-sm'
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
