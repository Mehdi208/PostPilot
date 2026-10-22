'use client';

import React, { useState } from 'react';
import { usePostPilot } from '@/context/PostPilotContext';
import { 
  Calendar, 
  Table2, 
  Radio, 
  Layers, 
  Plus, 
  Check, 
  Copy, 
  Settings, 
  Sun, 
  Moon, 
  X
} from 'lucide-react';
import WorkspaceSettingsModal from '@/components/settings/WorkspaceSettingsModal';

export default function MobileBottomNav() {
  const { 
    activeView, 
    setActiveView, 
    workspaces, 
    activeWorkspace, 
    setActiveWorkspace, 
    posts, 
    theme, 
    toggleTheme,
    setSelectedPost
  } = usePostPilot();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentWorkspacePosts = posts.filter(p => p.workspaceId === activeWorkspace.id);
  const approvedCount = currentWorkspacePosts.filter(p => p.status === 'approved' || p.status === 'scheduled').length;
  const totalPosts = currentWorkspacePosts.length;
  const progressPercent = totalPosts > 0 ? Math.round((approvedCount / totalPosts) * 100) : 0;

  const clientPreviewUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/preview/${activeWorkspace.previewToken}`
    : `/preview/${activeWorkspace.previewToken}`;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(clientPreviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateNewPost = () => {
    const newPost = {
      id: `post_${activeWorkspace.id}_manual_${Date.now()}`,
      workspaceId: activeWorkspace.id,
      week: 'S3',
      scheduledDate: '2026-10-21',
      dayOfWeek: 'Mer.',
      time: '12:00',
      platforms: ['instagram', 'facebook'] as ('instagram' | 'facebook')[],
      objective: 'Notoriété & Vente',
      format: 'image' as const,
      theme: 'Nouvelle publication mobile',
      caption: 'Légende à rédiger...',
      featuredProduct: 'Bubble Tea Signature',
      cta: 'Commander au 05 96 93 50 50',
      status: 'draft' as const,
      creativeBrief: 'Création rapide depuis mobile',
      mediaUrls: [],
      orderIndex: currentWorkspacePosts.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSelectedPost(newPost);
  };

  return (
    <>
      {/* Barre de navigation basse pour mobile (Thumb Zone, min 48px touch targets) */}
      <nav 
        aria-label="Navigation mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 pb-[env(safe-area-inset-bottom)] shadow-lg"
      >
        <div className="flex items-center justify-around h-14 px-2">
          
          {/* 1. Calendrier */}
          <button
            onClick={() => setActiveView('calendar')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-w-[56px] py-1 transition-colors ${
              activeView === 'calendar'
                ? 'text-zinc-950 dark:text-white font-semibold'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Calendrier</span>
          </button>

          {/* 2. Tableur */}
          <button
            onClick={() => setActiveView('table')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-w-[56px] py-1 transition-colors ${
              activeView === 'table'
                ? 'text-zinc-950 dark:text-white font-semibold'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Table2 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Tableur</span>
          </button>

          {/* Bouton central: Nouveau Post rapide */}
          <div className="flex items-center justify-center px-1">
            <button
              onClick={handleCreateNewPost}
              className="w-10 h-10 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-md active:scale-95 transition-transform"
              title="Créer une publication"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* 3. Radar Concurrentiel */}
          <button
            onClick={() => setActiveView('inspiration')}
            className={`flex flex-col items-center justify-center flex-1 h-full min-w-[56px] py-1 transition-colors ${
              activeView === 'inspiration'
                ? 'text-zinc-950 dark:text-white font-semibold'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Radio className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Radar</span>
          </button>

          {/* 4. Espaces / Menu Drawer */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 h-full min-w-[56px] py-1 transition-colors ${
              isDrawerOpen
                ? 'text-zinc-950 dark:text-white font-semibold'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Layers className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Espaces</span>
          </button>

        </div>
      </nav>

      {/* Drawer / Bottom Sheet mobile pour le choix d'espace et les options */}
      {isDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 dark:bg-black/80 flex flex-col justify-end">
          <div 
            onClick={() => setIsDrawerOpen(false)} 
            className="flex-1" 
          />
          <div className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 rounded-t-2xl p-5 pb-[calc(env(safe-area-inset-bottom)+20px)] space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            
            {/* Header du drawer */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-zinc-950 dark:bg-white text-white dark:text-black font-mono font-bold text-xs flex items-center justify-center">
                  P
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-zinc-950 dark:text-white">PostPilot Espaces</h3>
                  <p className="text-[10px] font-mono text-zinc-500">Gestion multi-comptes</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400"
                  title="Changer de thème"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sélecteur de Workspace */}
            <div>
              <div className="text-[10px] font-mono uppercase text-zinc-400 mb-2 font-medium">
                Changer d&apos;espace de travail
              </div>
              <div className="space-y-1.5">
                {workspaces.map((ws) => {
                  const isActive = ws.id === activeWorkspace.id;
                  const wsPosts = posts.filter(p => p.workspaceId === ws.id);
                  const wsApproved = wsPosts.filter(p => p.status === 'approved' || p.status === 'scheduled').length;

                  return (
                    <button
                      key={ws.id}
                      onClick={() => {
                        setActiveWorkspace(ws);
                        setIsDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border text-xs transition-all ${
                        isActive
                          ? 'border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-black font-semibold shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-semibold">{ws.name}</div>
                        <div className={`text-[10px] font-mono ${isActive ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-500'}`}>
                          {ws.description}
                        </div>
                      </div>
                      <span className={`text-[11px] font-mono ${isActive ? 'text-zinc-200 dark:text-zinc-800' : 'text-zinc-400'}`}>
                        {wsApproved}/{wsPosts.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Progression du mois */}
            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">Progression Octobre</span>
                <span className="font-mono text-[11px] text-zinc-500">{progressPercent}%</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-zinc-950 dark:bg-white h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[10px] font-mono text-zinc-500">
                {approvedCount} sur {totalPosts} publications prêtes
              </div>
            </div>

            {/* Actions : Validation client & Paramètres */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Lien client copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-zinc-500" />
                    <span>Copier le lien de validation client</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
              >
                <Settings className="w-4 h-4 text-zinc-500" />
                <span>Paramètres de l&apos;espace</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modale Paramètres Workspace */}
      <WorkspaceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
