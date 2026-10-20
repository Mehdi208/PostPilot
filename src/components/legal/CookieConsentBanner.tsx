'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, Check, X } from 'lucide-react';

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
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-zinc-950/95 border border-zinc-800 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
          <Cookie className="w-5 h-5" />
        </div>
        <div className="space-y-2 flex-1">
          <h4 className="font-bold text-xs text-zinc-100">
            Respect de votre vie privée (Loi 2013-450 ARTCI)
          </h4>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            PostPilot utilise uniquement des cookies strictement nécessaires à la persistance de votre session et de votre calendrier. Aucun traceur publicitaire intrusif n&apos;est utilisé.{' '}
            <Link href="/confidentialite" className="text-amber-400 hover:underline">
              En savoir plus
            </Link>
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAccept}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs transition-all shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accepter</span>
            </button>
            <button
              onClick={handleRefuse}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs transition-all"
            >
              Refuser
            </button>
          </div>
        </div>
        <button
          onClick={handleRefuse}
          className="text-zinc-500 hover:text-zinc-300 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
