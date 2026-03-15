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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-indigo-950/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        <div className="relative p-8 md:p-12">
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <div className="flex bg-indigo-50 p-1 rounded-xl mr-2">
              <button
                onClick={() => changeLanguage('EN')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  language === 'EN' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-indigo-300 hover:text-indigo-600'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('TR')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  language === 'TR' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-indigo-300 hover:text-indigo-600'
                }`}
              >
                TR
              </button>
            </div>
            <button 
              onClick={handleClose}
              className="p-2 h-10 w-10 flex items-center justify-center hover:bg-indigo-50 rounded-full transition-colors text-indigo-300 hover:text-indigo-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 rounded-3xl mb-6 text-indigo-600">
              <Heart className="w-10 h-10 fill-indigo-600/10" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-950 mb-4">
              {t('welcomeTitle')}
            </h2>
            <p className="text-indigo-900/60 max-w-md mx-auto">
              {t('tagline')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Visual connector lines for desktop */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-indigo-50 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-white border-2 border-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:border-indigo-200 transition-colors">
                <Heart className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-indigo-950 mb-1">{t('welcomeStep1Title')}</h3>
                <p className="text-xs text-indigo-900/50 leading-relaxed">
                  {t('welcomeStep1Desc')}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <Search className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-indigo-950 mb-1">{t('welcomeStep2Title')}</h3>
                <p className="text-xs text-indigo-900/50 leading-relaxed">
                  {t('welcomeStep2Desc')}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-white border-2 border-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                <Bookmark className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-indigo-950 mb-1">{t('welcomeStep3Title')}</h3>
                <p className="text-xs text-indigo-900/50 leading-relaxed">
                  {t('welcomeStep3Desc')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <button
              onClick={handleClose}
              className="group flex items-center gap-3 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1 active:scale-95"
            >
              {t('getStarted')}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
