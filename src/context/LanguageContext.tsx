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
  yourCustomCompassReading: { EN: 'Your Compass Points To', TR: 'Pusulanın Gösterdiği Yer' },
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
  delete: { EN: 'Delete', TR: 'Sil' },
  undo: { EN: 'Undo', TR: 'Geri Al' },
  removedFromSaved: { EN: 'Removed from saved items', TR: 'Kaydedilenlerden kaldırıldı' },
  edit: { EN: 'Edit', TR: 'Düzenle' },
  editFavorite: { EN: 'Edit Favorite', TR: 'Favoriyi Düzenle' },
  saveChanges: { EN: 'Save Changes', TR: 'Değişiklikleri Kaydet' },
  confirmDelete: { EN: 'Are you sure you want to delete this favorite?', TR: 'Bu favoriyi silmek istediğinizden emin misiniz?' },
  welcomeTitle: { EN: 'Welcome to ContentCompass', TR: 'ContentCompass\'a Hoş Geldiniz' },
  welcomeStep1Title: { EN: 'Add your favorites', TR: 'Favorilerini Ekle' },
  welcomeStep1Desc: { EN: 'Add the books, films, series, podcasts and anything you love.', TR: 'sevdiğin kitapları, filmleri, dizileri, podcastleri ve daha fazlasını ekle' },
  welcomeStep2Title: { EN: 'Discover', TR: 'Keşfet' },
  welcomeStep2Desc: { EN: 'Select your favorites and let the compass find content that matches your taste.', TR: 'favorilerini seç ve pusula sana zevkine uygun içerikler bulsun' },
  welcomeStep3Title: { EN: 'Save & Explore', TR: 'Kaydet ve Keşfetmeye Devam Et' },
  welcomeStep3Desc: { EN: 'Save recommendations you like and keep exploring.', TR: 'beğendiğin önerileri kaydet ve keşfetmeye devam et' },
  getStarted: { EN: 'Get Started', TR: 'Başlayalım' },
  emptyFavoritesTitle: { EN: 'Your collection is empty', TR: 'Koleksiyonun boş' },
  emptyFavoritesSubtitle: { EN: 'Start by adding the content you love — books, films, podcasts, anything.', TR: 'Sevdiğin içerikleri eklemeye başla — kitaplar, filmler, podcastler ve daha fazlası.' },
  addFirstFavorite: { EN: 'Add Your First Favorite', TR: 'İlk Favorini Ekle' },
  discoverHint: { EN: 'Select one or more favorites below, choose your preferred formats, and hit Find Matches to discover new content.', TR: 'Aşağıdan bir veya daha fazla favori seç, format filtrele ve eşleşmelerini bulmak için Eşleşmeleri Bul\'a bas.' },
  turkishContent: { EN: 'Turkish Content Only', TR: 'Türkçe İçerik' },
  turkishContentDesc: { EN: 'Recommend only Turkish content from Turkish creators', TR: 'Yalnızca Türk yapımcılardan Türkçe içerik öner' },
  noteHelper: { EN: 'Adding a note helps us give you more specific recommendations.', TR: 'Not eklerseniz size daha kişiselleştirilmiş öneriler sunabiliriz.' },
  addCreatorInstead: { EN: 'Add a Creator instead', TR: 'Bunun yerine bir yaratıcı ekle' },
  addTitleInstead: { EN: 'Add a specific title instead', TR: 'Bunun yerine belirli bir içerik ekle' },
  creatorName: { EN: 'Creator Name', TR: 'Yaratıcının Adı' },
  creatorPlaceholder: { EN: 'e.g., Stephen King, Jane Austen...', TR: 'örn: Stephen King, Jane Austen...' },
  optional: { EN: 'Optional', TR: 'İsteğe Bağlı' },
  creatorBadge: { EN: 'Creator', TR: 'Yaratıcı' },
  whyDoYouLoveThis: { EN: 'Why do you love this?', TR: 'Neden seviyorsun?' },
  whyDoYouFollowThis: { EN: 'Why do you follow this creator?', TR: 'Bu sanatçıyı neden takip ediyorsun?' },
  alreadySeen: { EN: 'Already seen', TR: 'Zaten gördüm' },
  hiddenCount: { EN: 'hidden — show', TR: 'gizlendi — göster' },
  showHidden: { EN: 'Show hidden', TR: 'Gizlenenleri göster' },
  seenContent: { EN: 'Seen Content', TR: 'Görülmüş İçerikler' },
  savedContent: { EN: 'Saved', TR: 'Kaydedilenler' },
  removeFromSeen: { EN: 'Remove', TR: 'Listeden çıkar' },
  noSeenContent: { EN: "You haven't marked any content as seen yet.", TR: 'Henüz görülmüş olarak işaretlediğin içerik yok.' },
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  changeLanguage: (lang: Language) => void;
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

  const changeLanguage = (newLang: Language) => {
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
    <LanguageContext.Provider value={{ language, toggleLanguage, changeLanguage, t, formatText }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
