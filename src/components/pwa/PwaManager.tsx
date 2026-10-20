'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, WifiOff, CheckCircle2, Share2, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PwaManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showInstallSuccess, setShowInstallSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Register Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PostPilot PWA] Service Worker actif, scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PostPilot PWA] Erreur enregistrement SW:', err);
          });
      });
    }

    // 2. Check if already installed in standalone mode
    const checkStandalone = () => {
      const isWindowStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // @ts-expect-error navigator.standalone is iOS Safari specific
      const isIosStandalone = window.navigator.standalone === true;
      return isWindowStandalone || isIosStandalone;
    };

    setIsStandalone(checkStandalone());

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Check if dismissed in localStorage
    const dismissed = localStorage.getItem('postpilot_pwa_dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }

    // 4. Listen for BeforeInstallPrompt (Chrome, Edge, Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Detect App Installed
    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowInstallSuccess(true);
      setTimeout(() => setShowInstallSuccess(false), 4000);
    });

    // 6. Online / Offline listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } else if (isIos) {
      setShowIosPrompt(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('postpilot_pwa_dismissed', 'true');
    }
  };

  return (
    <>
      {/* Offline Status Pill */}
      {isOffline && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-black text-xs font-mono border border-zinc-700 dark:border-zinc-300 shadow-xl animate-in fade-in slide-in-from-top-2"
        >
          <WifiOff className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Mode Hors-Ligne • Cache Actif</span>
        </aside>
      )}

      {/* Install Success Toast */}
      {showInstallSuccess && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-black text-xs font-medium border border-zinc-700 dark:border-zinc-300 shadow-xl animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          <span>PostPilot a été installé sur votre appareil !</span>
        </div>
      )}

      {/* Minimalist PWA Install Banner (only if not already installed and not dismissed) */}
      {!isStandalone && !isDismissed && (isInstallable || (isIos && !showIosPrompt)) && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-40 p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs shrink-0 tracking-wider">
              PP
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                Installer PostPilot OS
              </h4>
              <p className="text-[11px] text-zinc-500 font-mono truncate">
                Accès direct & fonctionnement hors-ligne
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-semibold transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Installer</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              title="Ignorer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Install Guide Modal */}
      {showIosPrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs">
                  PP
                </div>
                <h3 className="font-semibold text-xs tracking-tight uppercase text-zinc-900 dark:text-zinc-100">
                  Installer sur iPhone / iPad
                </h3>
              </div>
              <button
                onClick={() => setShowIosPrompt(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>
                Pour installer PostPilot comme une application native sans passer par l&apos;App Store :
              </p>
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <Share2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
                  <span>1. Appuyez sur le bouton <strong>Partager</strong> en bas de Safari.</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <PlusSquare className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
                  <span>2. Faites défiler et choisissez <strong>Sur l&apos;écran d&apos;accueil</strong>.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => {
                  setShowIosPrompt(false);
                  handleDismiss();
                }}
                className="w-full py-2 bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-semibold rounded-lg text-xs transition-all"
              >
                C&apos;est compris
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
