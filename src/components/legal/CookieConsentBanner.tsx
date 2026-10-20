'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Check, X } from 'lucide-react';

const COOKIE_STORAGE_KEY = 'postpilot_cookie_consent_v1';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!consent) {
        setIsVisible(true);
      }
    }
  }, []);

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(COOKIE_STORAGE_KEY, 'accepted');
    }
    setIsVisible(false);
  };

  const handleRefuse = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(COOKIE_STORAGE_KEY, 'refused');
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white/95 dark:bg-zinc-950/95 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shrink-0">
          <Shield className="w-4 h-4" />
        </div>
        <div className="space-y-2 flex-1">
          <h4 className="font-semibold text-xs tracking-tight uppercase text-zinc-900 dark:text-zinc-100">
            Protection des données (Loi 2013-450 ARTCI)
          </h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            PostPilot utilise uniquement des traceurs strictement techniques nécessaires au maintien de votre session et de votre calendrier.{' '}
            <Link href="/confidentialite" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">
              En savoir plus
            </Link>
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAccept}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-semibold text-xs transition-all shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accepter</span>
            </button>
            <button
              onClick={handleRefuse}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-xs transition-all"
            >
              Refuser
            </button>
          </div>
        </div>
        <button
          onClick={handleRefuse}
          className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
