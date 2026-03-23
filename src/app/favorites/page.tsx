'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ContentType } from '@/types/content';
import { Plus, X, Loader2, Sparkles, Compass } from 'lucide-react';
import FavoriteCard from '@/components/FavoriteCard';
import FavoriteTable from '@/components/FavoriteTable';
import ViewToggle from '@/components/ViewToggle';
import Pagination from '@/components/Pagination';

const contentTypes: ContentType[] = [
  'Book', 'Movie', 'Tv Show', 'Podcast', 'Music', 'Game', 'Article', 'Youtube', 'Other'
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { t } = useLanguage();

  const [editingFavorite, setEditingFavorite] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    creator: '',
    year: '',
    type: 'Book' as ContentType,
    note: '',
    photo: '',
    creatorMode: false,
  });

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [isSelectionInProgress, setIsSelectionInProgress] = useState(false);
  const skipSearchRef = useRef(false);

  useEffect(() => {
    fetchFavorites();
    const savedView = localStorage.getItem('favoritesViewMode') as 'grid' | 'list';
    if (savedView) setViewMode(savedView);
  }, []);

  const handleViewChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('favoritesViewMode', mode);
  };

  const fetchFavorites = async (page = 0) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/favorites?page=${page}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setFavorites(data.data ?? []);
        setTotalCount(data.total ?? 0);
        setTotalPages(data.totalPages ?? 0);
        setCurrentPage(data.page ?? 0);
      } else {
        setFavorites([]);
      }
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchFavorites(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditClick = (fav: any) => {
    setEditingFavorite(fav);
    setFormData({
      title: fav.title,
      creator: fav.creator || '',
      year: fav.year || '',
      type: fav.type as ContentType,
      note: fav.note,
      photo: fav.photo || '',
      creatorMode: fav.isCreator || false,
    });
    setIsModalOpen(true);
  };

  const handleDeleteFavorite = async (id: string) => {
    if (!window.confirm(t('confirmDelete' as any) || 'Are you sure you want to delete this favorite?')) return;

    try {
      const res = await fetch(`/api/favorites/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const isLastOnPage = favorites.length === 1 && currentPage > 0;
        fetchFavorites(isLastOnPage ? currentPage - 1 : currentPage);
      } else {
        console.error('Failed to delete favorite');
      }
    } catch (err) {
      console.error('Error deleting favorite:', err);
    }
  };

  // Wikidata Autocomplete Logic for Title (only in non-creatorMode)
  useEffect(() => {
    if (formData.creatorMode || formData.title.length < 2 || isSelectionInProgress || skipSearchRef.current) {
      if (skipSearchRef.current) {
        skipSearchRef.current = false;
      }
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const debounceId = setTimeout(async () => {
      setSearching(true);
      try {
        const searchRes = await fetch(
          `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
            formData.title
          )}&language=en&format=json&origin=*&limit=10`
        );
        const searchData = await searchRes.json();
        const results = searchData.search || [];

        // Fetch thumbnails for each result from Wikipedia
        const suggestionsWithImages = await Promise.all(
          results.map(async (item: any) => {
            try {
              // 1. Get English Wikipedia title for the entity
              const entityRes = await fetch(
                `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${item.id}&props=sitelinks&sitefilter=enwiki&format=json&origin=*`
              );
              const entityData = await entityRes.json();
              const wikiTitle =
                entityData.entities?.[item.id]?.sitelinks?.enwiki?.title;

              if (!wikiTitle) return { ...item, thumbnail: null };

              // 2. Get thumbnail from Wikipedia
              const thumbRes = await fetch(
                `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
                  wikiTitle
                )}&prop=pageimages&format=json&pithumbsize=100&origin=*`
              );
              const thumbData = await thumbRes.json();
              const pages = thumbData.query?.pages || {};
              const pageId = Object.keys(pages)[0];
              const thumbnail = pages[pageId]?.thumbnail?.source || null;

              return { ...item, thumbnail, wikiTitle };
            } catch (err) {
              return { ...item, thumbnail: null };
            }
          })
        );

        setSuggestions(suggestionsWithImages);
        setShowSuggestions(suggestionsWithImages.length > 0);
      } catch (err) {
        console.error('Wikidata search failed:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceId);
  }, [formData.title]);

  const handleSelectSuggestion = async (suggestion: any) => {
    skipSearchRef.current = true;
    setSuggestions([]);
    setShowSuggestions(false);
    setIsSelectionInProgress(true);
    setFormData((prev) => ({ ...prev, title: suggestion.label }));

    try {
      // Fetch full details for the selected entity
      const detailsRes = await fetch(
        `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${suggestion.id}&props=claims|labels&languages=en&format=json&origin=*`
      );
      const detailsData = await detailsRes.json();
      const entity = detailsData.entities?.[suggestion.id];
      const claims = entity?.claims || {};

      // Strategy for Year (P577 - Publication, P585 - Point in time)
      const yearClaim = claims.P577?.[0] || claims.P585?.[0];
      const year = yearClaim?.mainsnak?.datavalue?.value?.time?.match(/\d{4}/)?.[0] || '';

      // Strategy for Creator
      // P50: Author, P57: Director, P175: Performer, P178: Developer, P170: Creator
      const creatorPIDs = ['P50', 'P57', 'P175', 'P178', 'P170'];
      let creatorId = '';
      for (const pid of creatorPIDs) {
        if (claims[pid]?.[0]?.mainsnak?.datavalue?.value?.id) {
          creatorId = claims[pid][0].mainsnak.datavalue.value.id;
          break;
        }
      }

      let creatorName = '';
      if (creatorId) {
        const creatorRes = await fetch(
          `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${creatorId}&props=labels&languages=en&format=json&origin=*`
        );
        const creatorData = await creatorRes.json();
        creatorName = creatorData.entities?.[creatorId]?.labels?.en?.value || '';
      }

      // Fetch Wikipedia infobox image
      let photoUrl = '';
      try {
        const entityRes = await fetch(
          `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${suggestion.id}&props=sitelinks&sitefilter=enwiki&format=json&origin=*`
        );
        const entityData = await entityRes.json();
        const wikiTitle = entityData.entities?.[suggestion.id]?.sitelinks?.enwiki?.title;

        if (wikiTitle) {
          // Get all images from the page
          const imagesRes = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
              wikiTitle
            )}&prop=images&imlimit=50&format=json&origin=*`
          );
          const imagesData = await imagesRes.json();
          const pages = imagesData.query?.pages || {};
          const pageId = Object.keys(pages)[0];
          const images = pages[pageId]?.images || [];
          
          // Filter out common non-infobox images (like icons, logos, etc)
          const infoboxImage = images.find((img: any) => {
            const title = img.title.toLowerCase();
            const isMediaFile = title.endsWith('.jpg') || title.endsWith('.jpeg') || title.endsWith('.png');
            return !title.includes('icon') && 
                   !title.includes('logo') && 
                   !title.includes('stamp') && 
                   !title.includes('flag') &&
                   !title.includes('commons') &&
                   isMediaFile;
          });

          if (infoboxImage) {
            // Get the image info to get the URL
            const imageInfoRes = await fetch(
              `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
                infoboxImage.title
              )}&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json&origin=*`
            );
            const imageInfoData = await imageInfoRes.json();
            const imagePages = imageInfoData.query?.pages || {};
            const imagePageId = Object.keys(imagePages)[0];
            photoUrl = imagePages[imagePageId]?.imageinfo?.[0]?.thumburl || 
                      imagePages[imagePageId]?.imageinfo?.[0]?.url || '';
          }
        }
      } catch (err) {
        console.error('Failed to fetch Wikipedia infobox image:', err);
      }

      setFormData((prev) => ({
        ...prev,
        year: year || prev.year,
        creator: creatorName || prev.creator,
        photo: photoUrl || prev.photo,
      }));
    } catch (err) {
      console.error('Failed to fetch entity details:', err);
    } finally {
      setIsSelectionInProgress(false);
    }
  };

  // Wikidata Creator Search (filtered for people)
  useEffect(() => {
    if (!formData.creatorMode || formData.title.length < 2 || isSelectionInProgress || skipSearchRef.current) {
      if (skipSearchRef.current) {
        skipSearchRef.current = false;
      }
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const debounceId = setTimeout(async () => {
      setSearching(true);
      try {
        // Search Wikidata for entities, we'll filter for people afterwards
        const searchRes = await fetch(
          `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
            formData.title
          )}&language=en&format=json&origin=*&limit=20`
        );
        const searchData = await searchRes.json();
        const results = searchData.search || [];

        // Filter for people and fetch details
        const suggestionsWithImages = await Promise.all(
          results.map(async (item: any) => {
            try {
              // Check if entity is a person by looking for human (Q5) in instance of claims
              const detailsRes = await fetch(
                `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${item.id}&props=claims|labels&languages=en&format=json&origin=*`
              );
              const detailsData = await detailsRes.json();
              const entity = detailsData.entities?.[item.id];
              const claims = entity?.claims || {};
              
              // Check for P31 (instance of) = Q5 (human) or P106 (occupation) to confirm it's a person
              const isHuman = claims.P31?.some((claim: any) => 
                claim.mainsnak?.datavalue?.value?.id === 'Q5'
              );
              const hasOccupation = claims.P106 && claims.P106.length > 0;
              
              if (!isHuman && !hasOccupation) {
                return null; // Skip non-people
              }

              // Get English Wikipedia title
              const entityRes = await fetch(
                `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${item.id}&props=sitelinks&sitefilter=enwiki&format=json&origin=*`
              );
              const entityData = await entityRes.json();
              const wikiTitle = entityData.entities?.[item.id]?.sitelinks?.enwiki?.title;

              let thumbnail = null;
              if (wikiTitle) {
                // Get thumbnail from Wikipedia
                const thumbRes = await fetch(
                  `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
                    wikiTitle
                  )}&prop=pageimages&format=json&pithumbsize=100&origin=*`
                );
                const thumbData = await thumbRes.json();
                const pages = thumbData.query?.pages || {};
                const pageId = Object.keys(pages)[0];
                thumbnail = pages[pageId]?.thumbnail?.source || null;
              }

              return { ...item, thumbnail, wikiTitle };
            } catch (err) {
              return null;
            }
          })
        );

        // Filter out nulls
        const filteredSuggestions = suggestionsWithImages.filter(s => s !== null);
        setSuggestions(filteredSuggestions);
        setShowSuggestions(filteredSuggestions.length > 0);
      } catch (err) {
        console.error('Creator search failed:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceId);
  }, [formData.title, formData.creatorMode]);

  const handleSelectCreatorSuggestion = async (suggestion: any) => {
    skipSearchRef.current = true;
    setSuggestions([]);
    setShowSuggestions(false);
    setIsSelectionInProgress(true);
    setFormData((prev) => ({ ...prev, title: suggestion.label }));

    try {
      // Fetch full details for the selected entity
      const detailsRes = await fetch(
        `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${suggestion.id}&props=claims|labels&languages=en&format=json&origin=*`
      );
      const detailsData = await detailsRes.json();
      const entity = detailsData.entities?.[suggestion.id];
      const claims = entity?.claims || {};

      // Extract year of birth/death range if available
      const birthYearClaim = claims.P569?.[0];
      const birthYear = birthYearClaim?.mainsnak?.datavalue?.value?.time?.match(/\d{4}/)?.[0] || '';

      // Fetch Wikipedia infobox image
      let photoUrl = '';
      try {
        const entityRes = await fetch(
          `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${suggestion.id}&props=sitelinks&sitefilter=enwiki&format=json&origin=*`
        );
        const entityData = await entityRes.json();
        const wikiTitle = entityData.entities?.[suggestion.id]?.sitelinks?.enwiki?.title;

        if (wikiTitle) {
          // Get all images from the page
          const imagesRes = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
              wikiTitle
            )}&prop=images&imlimit=50&format=json&origin=*`
          );
          const imagesData = await imagesRes.json();
          const pages = imagesData.query?.pages || {};
          const pageId = Object.keys(pages)[0];
          const images = pages[pageId]?.images || [];
          
          // Filter out common non-infobox images
          const infoboxImage = images.find((img: any) => {
            const title = img.title.toLowerCase();
            const isMediaFile = title.endsWith('.jpg') || title.endsWith('.jpeg') || title.endsWith('.png');
            return !title.includes('icon') && 
                   !title.includes('logo') && 
                   !title.includes('stamp') && 
                   !title.includes('flag') &&
                   !title.includes('commons') &&
                   isMediaFile;
          });

          if (infoboxImage) {
            // Get the image info to get the URL
            const imageInfoRes = await fetch(
              `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
                infoboxImage.title
              )}&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json&origin=*`
            );
            const imageInfoData = await imageInfoRes.json();
            const imagePages = imageInfoData.query?.pages || {};
            const imagePageId = Object.keys(imagePages)[0];
            photoUrl = imagePages[imagePageId]?.imageinfo?.[0]?.thumburl || 
                      imagePages[imagePageId]?.imageinfo?.[0]?.url || '';
          }
        }
      } catch (err) {
        console.error('Failed to fetch Wikipedia infobox image:', err);
      }

      setFormData((prev) => ({
        ...prev,
        year: birthYear || prev.year,
        photo: photoUrl || prev.photo,
      }));
    } catch (err) {
      console.error('Failed to fetch creator details:', err);
    } finally {
      setIsSelectionInProgress(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    try {
      let tags = editingFavorite?.tags || [];
      
      // Only generate new tags if it's a new favorite or if critical info changed (but not for creator entries)
      if (!formData.creatorMode && (!editingFavorite || (editingFavorite.title !== formData.title || editingFavorite.type !== formData.type))) {
        const tagRes = await fetch('/api/generate-tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (tagRes.ok) {
          const tagData = await tagRes.json().catch(() => ({ tags: [] }));
          tags = tagData.tags || [];
        }
      }

      const url = editingFavorite ? `/api/favorites/${editingFavorite._id}` : '/api/favorites';
      const method = editingFavorite ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          tags,
          isCreator: formData.creatorMode,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingFavorite(null);
        setFormData({ title: '', creator: '', year: '', type: 'Book', note: '', photo: '', creatorMode: false });
        fetchFavorites(editingFavorite ? currentPage : 0);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Failed to save favorite:', errorData);
      }
    } catch (err) {
      console.error('Error adding/editing favorite:', err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
        <div className="flex-1">
          <div className="flex items-end gap-4 mb-2">
            <h1 className="text-4xl font-extrabold text-indigo-900">{t('myCollection')}</h1>
            {favorites.length > 0 && <ViewToggle viewMode={viewMode} onViewChange={handleViewChange} />}
          </div>
          <p className="text-indigo-900/60">{t('tagline')}</p>
        </div>
        
        <button
          onClick={() => {
            setEditingFavorite(null);
            setFormData({ title: '', creator: '', year: '', type: 'Book', note: '', photo: '', creatorMode: false });
            setIsModalOpen(true);
          }}
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
        <div className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-[32px] border-2 border-dashed border-indigo-100 text-center animate-in fade-in duration-500">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-200 mb-8">
            <Compass className="w-12 h-12 animate-[spin_10s_linear_infinite]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-indigo-950 mb-3">
            {t('emptyFavoritesTitle')}
          </h2>
          <p className="text-indigo-900/50 max-w-sm mb-10 leading-relaxed">
            {t('emptyFavoritesSubtitle')}
          </p>
          <button
            onClick={() => {
              setEditingFavorite(null);
              setFormData({ title: '', creator: '', year: '', type: 'Book', note: '', photo: '', creatorMode: false });
              setIsModalOpen(true);
            }}
            className="group flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            {t('addFirstFavorite')}
          </button>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((fav) => (
                <FavoriteCard
                  key={fav._id}
                  favorite={fav}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteFavorite}
                />
              ))}
            </div>
          ) : (
            <FavoriteTable
              favorites={favorites}
              onEdit={handleEditClick}
              onDelete={handleDeleteFavorite}
            />
          )}
          {totalCount > 12 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-indigo-900/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="px-8 py-6 border-b border-indigo-50 flex justify-between items-center bg-indigo-50/30">
              <h2 className="text-2xl font-bold text-indigo-900">
                {editingFavorite ? t('editFavorite' as any) || 'Edit Favorite' : t('addFavorite')}
              </h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingFavorite(null);
                }} 
                className="p-2 hover:bg-white rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-indigo-900/40" />
              </button>
            </div>

            <div className="px-8 pt-4 pb-2 border-b border-indigo-50">
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ 
                    ...prev, 
                    creatorMode: !prev.creatorMode,
                    title: '',
                    creator: '',
                    year: '',
                    photo: '',
                  }));
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-all ${
                  formData.creatorMode
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:border-indigo-300'
                }`}
              >
                {formData.creatorMode ? `📚 ${t('addTitleInstead' as any)}` : `👤 ${t('addCreatorInstead' as any)}`}
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto flex-1 pb-32 sm:pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Title/Creator Name Field */}
                <div className="space-y-1.5 sm:col-span-2 relative">
                  <label className="text-sm font-semibold text-indigo-900/70 ml-1">
                    {formData.creatorMode ? t('creatorName' as any) : t('title')}
                  </label>
                  <div className="relative">
                    <input
                      className="w-full px-4 py-3 rounded-2xl border border-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        if (isSelectionInProgress) setIsSelectionInProgress(false);
                      }}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true);
                      }}
                      autoComplete="off"
                      placeholder={formData.creatorMode ? t('creatorPlaceholder' as any) : undefined}
                    />
                    {searching && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      </div>
                    )}
                  </div>

                  {showSuggestions && (
                    <div className="absolute z-[60] left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-indigo-50 overflow-hidden max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                      {suggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            formData.creatorMode ? handleSelectCreatorSuggestion(item) : handleSelectSuggestion(item);
                          }}
                          className="w-full flex items-start gap-4 p-4 hover:bg-indigo-50 transition-colors border-b border-indigo-50 last:border-0 text-left"
                        >
                          <div className="w-12 h-12 flex-shrink-0 bg-indigo-50 rounded-lg overflow-hidden flex items-center justify-center">
                            {item.thumbnail ? (
                              <img src={item.thumbnail} alt={item.label} className="w-full h-full object-cover" />
                            ) : (
                              <Sparkles className="w-5 h-5 text-indigo-200" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-indigo-900 truncate">{item.label}</p>
                            <p className="text-xs text-indigo-900/40 line-clamp-2">{item.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Creator Field - Hidden in Creator Mode */}
                {!formData.creatorMode && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-indigo-900/70 ml-1">{t('creator')}</label>
                    <input
                      className="w-full px-4 py-3 rounded-2xl border border-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={formData.creator}
                      onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                    />
                  </div>
                )}
                
                {/* Year Field - Optional in both modes */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-indigo-900/70 ml-1">{t('year')}</label>
                  <input
                    className="w-full px-4 py-3 rounded-2xl border border-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder={formData.creatorMode ? t('optional' as any) : undefined}
                  />
                </div>

                {/* Content Type - Optional in both modes */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-semibold text-indigo-900/70 ml-1">
                    {t('contentType')}
                    {formData.creatorMode && <span className="text-indigo-900/40 font-normal"> ({t('optional' as any).toLowerCase()})</span>}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {contentTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: formData.type === type ? ('Book' as ContentType) : type })}
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

                {/* Personal Note - Same in both modes */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-semibold text-indigo-900/70 ml-1">{t('note')}</label>
                  <textarea
  rows={3}
  className="w-full px-4 py-3 rounded-2xl border border-indigo-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
  value={formData.note}
  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
  placeholder={formData.creatorMode ? t('whyDoYouFollowThis' as any) || 'Bu kişiyi neden takip ediyorsun?' : t('whyDoYouLoveThis' as any) || 'Neden seviyorsun?'}
/>
                  <p className="text-xs text-gray-500 mt-2">{t('noteHelper')}</p>
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
                  editingFavorite ? (t('saveChanges' as any) || 'Save Changes') : t('addFavorite')
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
