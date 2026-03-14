'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { turkishToUpper, turkishToLower } from '@/utils/turkish-case';

type Language = 'EN' | 'TR';

interface Translations {
  [key: string]: Record<Language, string>;
}

const translations: Translations = {
  favorites: { EN: 'Favorites', TR: 'Favoriler' },
  discover: { EN: 'Discover', TR: 'Keşfet' },
  saved: { EN: 'Saved', TR: 'Kaydedilenler' },
  myCollection: { EN: 'My Collection', TR: 'Koleksiyonum' },
  tagline: { EN: 'The things you love, all in one place.', TR: 'Sevdileriniz, tek bir yerde.' },
  addFavorite: { EN: 'Add Favorite', TR: 'Favori Ekle' },
  findMatches: { EN: 'Find Matches', TR: 'Eşleşmeleri Bul' },
  refreshRecommendations: { EN: 'Refresh Recommendations', TR: 'Önerileri Yenile' },
  yourCustomCompassReading: { EN: 'Your Custom Compass Reading', TR: 'Kişisel Pusula Okumanız' },
  whyWeRecommend: { EN: 'Why we recommend this', TR: 'Neden öneriyoruz' },
  explorationLimit: { EN: "You've reached the exploration limit for this session.", TR: "Bu oturum için keşif sınırına ulaştınız." },
  book: { EN: 'Book', TR: 'Kitap' },
  movie: { EN: 'Movie', TR: 'Film' },
  'tv show': { EN: 'Tv Show', TR: 'Dizi' },
  podcast: { EN: 'Podcast', TR: 'Podcast' },
  music: { EN: 'Music', TR: 'Müzik' },
  game: { EN: 'Game', TR: 'Oyun' },
  article: { EN: 'Article', TR: 'Makale' },
  youtube: { EN: 'Youtube', TR: 'Youtube' },
  other: { EN: 'Other', TR: 'Diğer' },
  newsletter: { EN: 'Newsletter', TR: 'Bülten' },
  'graphic novel': { EN: 'Graphic Novel', TR: 'Grafik Roman' },
  'stand-up special': { EN: 'Stand-up Special', TR: 'Stand-up Gösterisi' },
  audiobook: { EN: 'Audiobook', TR: 'Sesli Kitap' },
  'tabletop rpg': { EN: 'Tabletop RPG', TR: 'Masaüstü RPG' },
  'stage play': { EN: 'Stage Play', TR: 'Tiyatro Oyunu' },
  'short film': { EN: 'Short Film', TR: 'Kısa Film' },
  'interactive fiction': { EN: 'Interactive Fiction', TR: 'İnteraktif Kurgu' },
  opera: { EN: 'Opera', TR: 'Opera' },
  'comic book': { EN: 'Comic Book', TR: 'Çizgi Roman' },
  'web series': { EN: 'Web Series', TR: 'İnternet Dizisi' },
  signOut: { EN: 'Sign Out', TR: 'Çıkış Yap' },
  email: { EN: 'Email', TR: 'E-posta' },
  password: { EN: 'Password', TR: 'Şifre' },
  login: { EN: 'Login', TR: 'Giriş Yap' },
  register: { EN: 'Register', TR: 'Kayıt Ol' },
  noAccount: { EN: "Don't have an account?", TR: 'Hesabınız yok mu?' },
  haveAccount: { EN: 'Already have an account?', TR: 'Zaten hesabınız var mı?' },
  title: { EN: 'Title', TR: 'Başlık' },
  creator: { EN: 'Author/Creator', TR: 'Yazar/Yapımcı' },
  year: { EN: 'Year', TR: 'Yıl' },
  note: { EN: 'Personal Note', TR: 'Kişisel Not' },
  contentType: { EN: 'Content Type', TR: 'İçerik Türü' },
  allFavorites: { EN: '★ All my favorites (Best results)', TR: '★ Tüm favorilerim (En iyi sonuçlar)' },
  selected: { EN: 'selected', TR: 'seçildi' },
  noneSelected: { EN: 'none selected', TR: 'hiçbiri seçilmedi' },
  allFavoritesSelected: { EN: 'all favorites', TR: 'tüm favoriler' },
  selectHint: { EN: 'Please select at least one favorite to find matches.', TR: 'Eşleşmeleri bulmak için lütfen en az bir favori seçin.' },
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
  formatText: (text: string, caseType: 'upper' | 'lower') => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('EN');

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'EN' || savedLang === 'TR') {
      setLanguage(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang: Language = language === 'EN' ? 'TR' : 'EN';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language];
  };

  const formatText = (text: string, caseType: 'upper' | 'lower'): string => {
    if (language === 'TR') {
      return caseType === 'upper' ? turkishToUpper(text) : turkishToLower(text);
    }
    return caseType === 'upper' ? text.toUpperCase() : text.toLowerCase();
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, formatText }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
