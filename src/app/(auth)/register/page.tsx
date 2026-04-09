'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Compass, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      if (res.ok) {
        // Automatically sign in after registration
        const result = await signIn('credentials', {
          email: normalizedEmail,
          password,
          redirect: false,
        });

        if (result?.error) {
          console.error('Post-registration login failed:', result.error);
          setError('Registration successful! Please login with your credentials.');
        } else if (result?.ok) {
          router.push('/favorites');
          router.refresh();
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-50/50 p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-xl shadow-theme-100 border border-theme-50">
        <div className="flex flex-col items-center">
          <div className="bg-theme-600 p-3 rounded-2xl mb-4">
            <Compass className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-theme-900">ContentCompass</h2>
          <p className="mt-2 text-sm text-theme-900/60">{t('register')}</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-theme-900 mb-1">
                {t('email')}
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-theme-100 focus:ring-2 focus:ring-theme-500 focus:border-transparent outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-900 mb-1">
                {t('password')}
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-theme-100 focus:ring-2 focus:ring-theme-500 focus:border-transparent outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-theme-600 hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-500 disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('register')}
          </button>

          <p className="text-center text-sm text-theme-900/60">
            {t('haveAccount')}{' '}
            <Link href="/login" className="font-bold text-theme-600 hover:text-theme-500">
              {t('login')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
