'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { X, RotateCcw } from 'lucide-react';

interface ToastProps {
  message: string;
  onUndo?: () => void;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onUndo, onClose, duration = 5000 }) => {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(newProgress);
      if (newProgress === 0) {
        clearInterval(interval);
        onClose();
      }
    }, 10);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-300">
      <div className="bg-indigo-950 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-indigo-200 flex items-center gap-6 border border-white/10 overflow-hidden relative min-w-[320px]">
        {/* Progress bar */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
        
        <span className="text-sm font-bold flex-grow">{message}</span>
        
        {onUndo && (
          <button 
            onClick={onUndo}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-xs font-black uppercase tracking-widest text-indigo-100"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t('undo')}
          </button>
        )}
        
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
