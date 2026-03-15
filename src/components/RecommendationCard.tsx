'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Bookmark, BookmarkCheck, Sparkles, User, Calendar, Info, Trash2 } from 'lucide-react';

interface RecommendationProps {
  recommendation: {
    _id?: string;
    type: string;
    title: string;
    creator: string;
    year: string;
    description: string;
    why: string;
    tags: string[];
  };
  isSavedPage?: boolean;
  onRemove?: (id: string) => void;
}

const RecommendationCard: React.FC<RecommendationProps> = ({ 
  recommendation, 
  isSavedPage = false,
  onRemove
}) => {
  const [isSaved, setIsSaved] = useState(isSavedPage);
  const [saving, setSaving] = useState(false);
  const { t } = useLanguage();

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

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-indigo-50 hover:shadow-2xl hover:shadow-indigo-100 transition-all group flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-indigo-100">
          {t(recommendation.type.toLowerCase() as any) || recommendation.type}
        </span>
        
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
      
      <div className="mb-6">
        <h3 className="text-2xl font-black text-indigo-950 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">
          {recommendation.title}
        </h3>
        
        <div className="flex flex-wrap gap-4 text-xs font-bold text-indigo-900/40 uppercase tracking-tighter">
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

      <div className="space-y-6 flex-grow">
        <div className="relative">
          <Info className="w-4 h-4 text-indigo-200 absolute -left-6 top-1" />
          <p className="text-sm text-indigo-900/70 leading-relaxed font-medium">
            {recommendation.description}
          </p>
        </div>

        <div className="bg-indigo-50/40 rounded-3xl p-6 border border-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-8 h-8 text-indigo-600" />
          </div>
          <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            {t('whyWeRecommend')}
          </h4>
          <p className="text-sm text-indigo-900/80 leading-relaxed italic font-medium">
            "{recommendation.why}"
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {recommendation.tags.map((tag, idx) => (
          <span 
            key={idx}
            className="px-3 py-1.5 bg-white border border-indigo-50 text-indigo-600/60 text-[10px] font-bold rounded-xl uppercase shadow-sm"
          >
            # {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RecommendationCard;
