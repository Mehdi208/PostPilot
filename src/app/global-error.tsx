'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[PostPilot GlobalError]:', error);
  }, [error]);

  const handleCleanReload = () => {
    try {
      if (typeof window !== 'undefined') {
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
    <html lang="fr" className="dark">
      <body className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-amber-950/60 text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
            ⚠️
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-zinc-100">
              Mise à jour de PostPilot disponible
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Une nouvelle version de l&apos;application a été déployée. Cliquez pour recharger l&apos;interface immédiatement.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleCleanReload}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-all cursor-pointer"
            >
              Recharger la nouvelle version
            </button>
            <button
              onClick={() => reset()}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
