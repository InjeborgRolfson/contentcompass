'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/context/LanguageContext';
import { Heart, Compass, Bookmark, Library } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BottomNav = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { t, formatText, language } = useLanguage();

  if (!session) return null;

  const navItems = [
    {
      href: '/favorites',
      label: t('favorites'),
      icon: Heart,
    },
    {
      href: '/discover',
      label: t('discover'),
      icon: Compass,
    },
    {
      href: '/saved',
      label: t('saved'),
      icon: Bookmark,
    },
    {
      href: '/library',
      label: t('library'),
      icon: Library,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-low border-t border-outline-variant z-50 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200',
                isActive ? 'text-primary' : 'text-on-surface/60'
              )}
            >
              <Icon className={cn('w-6 h-6', isActive && 'fill-primary/10')} />
              <span className="text-[10px] font-medium tracking-wider font-label">
                {formatText(item.label, 'upper')}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
