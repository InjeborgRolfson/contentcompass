'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Loader2, Bookmark } from 'lucide-react';
import RecommendationCard from '@/components/RecommendationCard';
import ViewToggle from '@/components/ViewToggle';
import RecommendationTable from '@/components/RecommendationTable';

export default function SavedPage() {
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { t } = useLanguage();

  useEffect(() => {
    fetchSaved();
    const savedView = localStorage.getItem('viewMode') as 'grid' | 'list';
    if (savedView) setViewMode(savedView);
  }, []);

  const handleViewChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
  };

  const fetchSaved = async () => {
    try {
      const res = await fetch('/api/recommendations/save');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setSaved(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch saved items:', err);
      setSaved([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (id: string) => {
    setSaved(prev => prev.filter(s => s._id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-indigo-900 mb-2">{t('saved')}</h1>
          <div className="flex items-center gap-4">
            <p className="text-indigo-900/60 font-medium">{t('yourCustomCompassReading')}</p>
            <ViewToggle viewMode={viewMode} onViewChange={handleViewChange} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      ) : saved.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-indigo-100 flex flex-col items-center gap-4">
          <Bookmark className="w-12 h-12 text-indigo-100" />
          <p className="text-indigo-900/40 text-lg font-bold">{t('noneSelected')}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
          {saved.map((rec) => (
            <RecommendationCard 
              key={rec._id} 
              recommendation={rec} 
              isSavedPage={true}
              onRemove={handleRemove}
            />
          ))}
        </div>
      ) : (
        <RecommendationTable 
          recommendations={saved} 
          isSavedPage={true}
          onRemove={handleRemove}
        />
      )}
    </div>
  );
}
