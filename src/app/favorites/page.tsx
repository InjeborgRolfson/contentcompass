'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ContentType } from '@/types/content';
import { Plus, X, Loader2, Sparkles } from 'lucide-react';
import FavoriteCard from '@/components/FavoriteCard';

const contentTypes: ContentType[] = [
  'Book', 'Movie', 'Tv Show', 'Podcast', 'Music', 'Game', 'Article', 'Youtube', 'Other'
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    title: '',
    creator: '',
    year: '',
    type: 'Book' as ContentType,
    note: '',
  });

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    try {
      // 1. Generate tags via AI
      const tagRes = await fetch('/api/generate-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      let tags = [];
      if (tagRes.ok) {
        const tagData = await tagRes.json().catch(() => ({ tags: [] }));
        tags = tagData.tags || [];
      }

      // 2. Save favorite with tags
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tags }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ title: '', creator: '', year: '', type: 'Book', note: '' });
        fetchFavorites();
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Failed to save favorite:', errorData);
      }
    } catch (err) {
      console.error('Error adding favorite:', err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-indigo-900 mb-2">{t('myCollection')}</h1>
          <p className="text-indigo-900/60">{t('tagline')}</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          {t('addFavorite')}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-indigo-100">
          <p className="text-indigo-900/40 text-lg">{t('tagline')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <FavoriteCard key={fav._id} favorite={fav} />
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-indigo-50 flex justify-between items-center bg-indigo-50/30">
              <h2 className="text-2xl font-bold text-indigo-900">{t('addFavorite')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors">
                <X className="w-6 h-6 text-indigo-900/40" />
              </button>
            </div>
            
            <form onSubmit={handleAddFavorite} className="p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-semibold text-indigo-900/70 ml-1">{t('title')}</label>
                  <input
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-indigo-900/70 ml-1">{t('creator')}</label>
                  <input
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.creator}
                    onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-indigo-900/70 ml-1">{t('year')}</label>
                  <input
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-semibold text-indigo-900/70 ml-1">{t('contentType')}</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {contentTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={`px-2 py-2 text-xs font-bold rounded-xl transition-all border ${
                          formData.type === type 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' 
                            : 'bg-white text-indigo-900/40 border-indigo-50 hover:border-indigo-200'
                        }`}
                      >
                        {t(type.toLowerCase() as any)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-semibold text-indigo-900/70 ml-1">{t('note')}</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border border-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {adding ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </>
                ) : (
                  t('addFavorite')
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
