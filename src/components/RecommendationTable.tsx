'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Sparkles, Info, ChevronDown, ChevronUp, Bookmark, BookmarkCheck } from 'lucide-react';

interface RecommendationTableProps {
  recommendations: any[];
  isSavedPage?: boolean;
  onRemove?: (id: string) => void;
}

const RecommendationTable: React.FC<RecommendationTableProps> = ({ 
  recommendations, 
  isSavedPage = false,
  onRemove
}) => {
  const { t } = useLanguage();
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const toggleRow = (idx: number) => {
    setExpandedRow(expandedRow === idx ? null : idx);
  };

  const handleSave = async (rec: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isSavedPage && onRemove && rec._id) {
      try {
        const res = await fetch('/api/recommendations/save', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: rec._id }),
        });
        if (res.ok) onRemove(rec._id);
      } catch (err) {
        console.error(err);
      }
      return;
    }

    const id = rec._id || rec.title;
    if (savedIds.includes(id)) return;

    setSavingId(id);
    try {
      const res = await fetch('/api/recommendations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rec),
      });

      if (res.ok) {
        setSavedIds(prev => [...prev, id]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
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
              <th className="px-8 py-6 text-center w-32"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-50">
            {recommendations.map((rec, idx) => {
              const id = rec._id || rec.title;
              const isSaved = isSavedPage || savedIds.includes(id);
              const isSaving = savingId === id;

              return (
                <React.Fragment key={idx}>
                  <tr 
                    onClick={() => toggleRow(idx)}
                    className="hover:bg-indigo-50/20 cursor-pointer transition-colors group relative"
                  >
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-full uppercase tracking-widest border border-indigo-100">
                        {t(rec.type.toLowerCase() as any) || rec.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-indigo-950 group-hover:text-indigo-600 transition-colors block max-w-xs md:max-w-md overflow-hidden text-overflow-ellipsis whitespace-nowrap">
                        {rec.title}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-indigo-900/60 font-medium">
                      {rec.creator}
                    </td>
                    <td className="px-8 py-6 text-sm text-indigo-900/40 font-bold tabular-nums">
                      {rec.year}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center gap-4 justify-center">
                        <button
                          onClick={(e) => handleSave(rec, e)}
                          disabled={isSaving || (isSaved && !isSavedPage)}
                          className={`p-2 rounded-xl transition-all ${
                            isSaved 
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                              : 'bg-indigo-50/50 text-indigo-200 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100'
                          }`}
                        >
                          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                        {expandedRow === idx ? (
                          <ChevronUp className="w-4 h-4 text-indigo-300 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-indigo-300 shrink-0 group-hover:text-indigo-600" />
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedRow === idx && (
                    <tr className="bg-indigo-50/10">
                      <td colSpan={5} className="px-8 py-8">
                        <div className="flex flex-col md:flex-row gap-8">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-start gap-4">
                              <Info className="w-4 h-4 text-indigo-300 mt-1 shrink-0" />
                              <p className="text-sm text-indigo-900/70 leading-relaxed font-medium">
                                {rec.description}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                              {rec.tags?.map((tag: string, tidx: number) => (
                                <span 
                                  key={tidx}
                                  className="px-2 py-1 bg-white border border-indigo-50 text-indigo-600/60 text-[9px] font-bold rounded-lg uppercase"
                                >
                                  # {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="md:w-1/3 bg-indigo-50/40 rounded-3xl p-6 border border-indigo-100 relative overflow-hidden shrink-0 self-start">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                              <Sparkles className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <Sparkles className="w-3 h-3" />
                              {t('whyWeRecommend')}
                            </h4>
                            <p className="text-sm text-indigo-900/80 leading-relaxed italic font-medium">
                              "{rec.why}"
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecommendationTable;
