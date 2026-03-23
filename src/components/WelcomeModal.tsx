'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { X, Heart, Search, Bookmark, ChevronRight } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language, changeLanguage } = useLanguage();
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      const hasSeen = localStorage.getItem('hasSeenWelcomeModal');
      if (!hasSeen) {
        setIsOpen(true);
      }
    }
  }, [session]);

  const handleClose = () => {
    localStorage.setItem('hasSeenWelcomeModal', 'true');
    setIsOpen(false);
    router.push('/favorites');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-theme-950/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl max-h-[85vh] md:max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        {/* Header - Fixed */}
        <div className="relative z-20 flex justify-end items-center px-6 pt-6 md:px-12 md:pt-8 bg-white/80 backdrop-blur-sm">
          <div className="flex bg-theme-50/50 p-1 rounded-xl border border-theme-100 mr-2">
            <button
              onClick={() => changeLanguage('EN')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-200 ${
                language === 'EN' 
                  ? 'bg-theme-600 text-white shadow-sm' 
                  : 'text-theme-400 hover:text-theme-600'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage('TR')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-200 ${
                language === 'TR' 
                  ? 'bg-theme-600 text-white shadow-sm' 
                  : 'text-theme-400 hover:text-theme-600'
              }`}
            >
              TR
            </button>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 h-10 w-10 flex items-center justify-center bg-theme-50 hover:bg-theme-100 rounded-full transition-colors text-theme-600 shadow-sm"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-2 md:p-12 md:pt-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-theme-50 rounded-3xl mb-6 text-theme-600">
              <Heart className="w-10 h-10 fill-theme-600/10" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-theme-950 mb-4">
              {t('welcomeTitle')}
            </h2>
            <p className="text-theme-900/60 max-w-md mx-auto text-sm md:text-base">
              {t('tagline')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative pb-4">
            {/* Visual connector lines for desktop */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-theme-50 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-white border-2 border-theme-50 rounded-2xl flex items-center justify-center text-theme-600 shadow-sm group-hover:border-theme-200 transition-colors">
                <Heart className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-theme-950 mb-1">{t('welcomeStep1Title')}</h3>
                <p className="text-xs text-theme-900/50 leading-relaxed max-w-[200px] md:max-w-none">
                  {t('welcomeStep1Desc')}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-theme-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-theme-100">
                <Search className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-theme-950 mb-1">{t('welcomeStep2Title')}</h3>
                <p className="text-xs text-theme-900/50 leading-relaxed max-w-[200px] md:max-w-none">
                  {t('welcomeStep2Desc')}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-white border-2 border-theme-50 rounded-2xl flex items-center justify-center text-theme-600 shadow-sm">
                <Bookmark className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-theme-950 mb-1">{t('welcomeStep3Title')}</h3>
                <p className="text-xs text-theme-900/50 leading-relaxed max-w-[200px] md:max-w-none">
                  {t('welcomeStep3Desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-6 md:p-8 pt-2 md:pt-4 bg-white/80 backdrop-blur-sm border-t border-theme-50 flex justify-center pb-8 md:pb-12 safe-bottom-padding">
          <button
            onClick={handleClose}
            className="group flex items-center gap-3 px-10 py-4 bg-theme-600 hover:bg-theme-700 text-white rounded-2xl font-bold shadow-xl shadow-theme-100 transition-all hover:-translate-y-1 active:scale-95 w-full md:w-auto justify-center"
          >
            {t('getStarted')}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
