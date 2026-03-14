'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useLanguage } from '@/context/LanguageContext';
import { Compass, LogOut } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { language, toggleLanguage, t } = useLanguage();

  if (!session) return null;

  const NavItem = ({ href, label }: { href: string; label: string }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={cn(
          'px-4 py-2 rounded-lg transition-colors duration-200',
          isActive 
            ? 'bg-indigo-600 text-white' 
            : 'text-indigo-900/60 hover:text-indigo-600 hover:bg-indigo-50'
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/favorites" className="flex items-center gap-2 group">
              <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-900 to-indigo-600 bg-clip-text text-transparent">
                ContentCompass
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <NavItem href="/favorites" label={t('favorites')} />
              <NavItem href="/discover" label={t('discover')} />
              <NavItem href="/saved" label={t('saved')} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-900 text-sm font-medium hover:bg-indigo-50 transition-colors"
            >
              {language === 'EN' ? 'TR' : 'EN'}
            </button>

            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm text-indigo-900/60">{t('email')}</span>
              <span className="text-sm font-medium text-indigo-900">{session.user?.email}</span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title={t('signOut')}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
