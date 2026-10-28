'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[PostPilot ErrorBoundary Catch]:', error);
  }, [error]);

  const handleHardReset = () => {
    try {
      if (typeof window !== 'undefined') {
        // Nettoie les anciens caches de stockage pouvant être désynchronisés
        localStorage.removeItem('postpilot_posts_v6');
        localStorage.removeItem('postpilot_posts_v5');
        localStorage.removeItem('postpilot_posts_v4');
        if ('caches' in window) {
          caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
          });
        }
      }
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100">
      <div className="max-w-md w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
            Actualisation de l&apos;application requise
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Une mise à jour récente du système a été déployée. Cliquez sur le bouton ci-dessous pour recharger votre calendrier en toute fluidité.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
          
          <button
            onClick={handleHardReset}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-medium transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Actualiser le cache</span>
          </button>
        </div>
      </div>
    </div>
  );
}
