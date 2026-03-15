'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ContentType } from '@/types/content';
import { Search, Loader2, Sparkles, RefreshCw, Star, Info, LayoutGrid, List } from 'lucide-react';
import RecommendationCard from '@/components/RecommendationCard';
import ViewToggle from '@/components/ViewToggle';
import RecommendationTable from '@/components/RecommendationTable';

const contentTypes: ContentType[] = [
  'Book', 'Movie', 'Tv Show', 'Podcast', 'Music', 'Game', 'Article', 'Youtube', 'Other'
];

export default function DiscoverPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<ContentType[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { t, language } = useLanguage();

  useEffect(() => {
    fetchFavorites();
    const savedView = localStorage.getItem('viewMode') as 'grid' | 'list';
    if (savedView) setViewMode(savedView);
  }, []);

  const handleViewChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
  };

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
      setFavorites([]);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const toggleFavorite = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === favorites.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(favorites.map(f => f._id));
    }
  };

  const toggleFilter = (type: ContentType) => {
    setFilters(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const selectedFavorites = useMemo(() => 
    favorites.filter(f => selectedIds.includes(f._id)),
    [favorites, selectedIds]
  );

  const refreshLimit = useMemo(() => {
    const count = selectedIds.length;
    if (count >= 1 && count <= 5) return 2;
    if (count >= 6 && count <= 7) return 3;
    if (count >= 8) return 4;
    return 0;
  }, [selectedIds]);

  const findMatches = async (isRefresh = false) => {
    if (selectedIds.length === 0) return;
    
    if (isRefresh) {
      setRefreshing(true);
      setRefreshCount(prev => prev + 1);
    } else {
      setLoading(true);
      setRefreshCount(0);
      setRecommendations([]);
    }

    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedFavorites,
          filters,
          language,
          excludeTitles: isRefresh ? recommendations.map(r => r.title) : [],
        }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to find matches:', err);
      setRecommendations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const selectionText = useMemo(() => {
    if (selectedIds.length === 0) return t('noneSelected');
    if (selectedIds.length === favorites.length) return t('allFavoritesSelected');
    return `${selectedIds.length} ${t('selected')}`;
  }, [selectedIds, favorites, t]);

  const subtitleText = useMemo(() => {
    if (selectedFavorites.length === 0) return '';
    if (selectedFavorites.length === 1) return selectedFavorites[0].title;
    if (selectedFavorites.length === 2) return `${selectedFavorites[0].title} & ${selectedFavorites[1].title}`;
    if (selectedFavorites.length === 3) return `${selectedFavorites[0].title}, ${selectedFavorites[1].title} & ${selectedFavorites[2].title}`;
    return `${selectedFavorites[0].title}, ${selectedFavorites[1].title} + ${selectedFavorites.length - 2} more`;
  }, [selectedFavorites]);

  return (
    <div className="flex flex-col min-h-screen pb-32 md:pb-20">
      {/* Hero Panel */}
      <div className="bg-[#0f172a] text-white pt-24 pb-16 md:pt-32 md:pb-24 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-8 mb-12">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-2">{t('discover')}</h2>
              <h1 className="text-2xl md:text-5xl font-extrabold flex flex-wrap items-center gap-2 md:gap-3">
                {t('yourCustomCompassReading')}
                <span className="text-indigo-400/30 font-light text-xl md:text-2xl hidden md:inline">/</span>
                <span className="text-indigo-300/80 font-medium text-base md:text-lg italic w-full md:w-auto mt-1 md:mt-0">{selectionText}</span>
              </h1>
            </div>
            
            <button
              onClick={() => findMatches(false)}
              disabled={selectedIds.length === 0 || loading}
              className={`w-full md:w-auto justify-center px-10 py-4 rounded-2xl font-bold shadow-2xl transition-all flex items-center gap-2 relative group overflow-hidden ${
                selectedIds.length === 0 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:-translate-y-1 active:scale-95'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              {t('findMatches')}
            </button>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                <button
                  onClick={toggleAll}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${
                    selectedIds.length === favorites.length
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/40'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <Star className={`w-4 h-4 ${selectedIds.length === favorites.length ? 'fill-white' : ''}`} />
                  {t('allFavorites')}
                </button>

                {favorites.map((fav) => (
                  <button
                    key={fav._id}
                    onClick={() => toggleFavorite(fav._id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                      selectedIds.includes(fav._id)
                        ? 'bg-indigo-500/20 border-indigo-400 text-indigo-100 shadow-md shadow-indigo-900/20'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    {fav.title} <span className="text-[10px] opacity-40 ml-1">({t(fav.type.toLowerCase() as any)})</span>
                  </button>
                ))}
                
                {favorites.length === 0 && !favoritesLoading && (
                  <div className="flex items-center gap-2 text-slate-500 italic text-sm py-2">
                    <Info className="w-4 h-4" />
                    {t('tagline')}
                  </div>
                )}
              </div>
              
              {selectedIds.length === 0 && (
                <p className="text-xs text-indigo-400/60 animate-pulse font-medium">
                  {t('selectHint')}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800">
              <div className="flex flex-wrap gap-2">
                {contentTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleFilter(type)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      filters.includes(type)
                        ? 'bg-purple-600/30 border-purple-400 text-purple-100'
                        : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    {t(type.toLowerCase() as any)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {(recommendations.length > 0 || loading) && (
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-indigo-100 pb-8">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-3xl font-extrabold text-indigo-950">{t('yourCustomCompassReading')}</h3>
                  <ViewToggle viewMode={viewMode} onViewChange={handleViewChange} />
                </div>
                <p className="text-indigo-900/60 font-medium italic">
                  {subtitleText}
                </p>
              </div>

              {recommendations.length > 0 && (
                <div className="flex flex-col items-start gap-2">
                  <button
                    onClick={() => findMatches(true)}
                    disabled={refreshing || refreshCount >= refreshLimit}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border ${
                      refreshCount >= refreshLimit
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm'
                    }`}
                  >
                    {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {t('refreshRecommendations')}
                    <span className="text-[10px] bg-indigo-100 px-2 py-0.5 rounded-full ml-1">
                      {refreshCount}/{refreshLimit}
                    </span>
                  </button>
                  {refreshCount >= refreshLimit && (
                    <p className="text-[10px] font-bold text-red-400 bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                      {t('explorationLimit')}
                    </p>
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute top-0"></div>
                </div>
                <p className="text-indigo-900/40 font-bold animate-pulse">Calculating your trajectory...</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {recommendations.map((rec, idx) => (
                  <RecommendationCard key={idx} recommendation={rec} />
                ))}
              </div>
            ) : (
              <RecommendationTable recommendations={recommendations} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
