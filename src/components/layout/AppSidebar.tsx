'use client';

import React, { useState } from 'react';
import { usePostPilot } from '@/context/PostPilotContext';
import { 
  Calendar, 
  Table2, 
  Radio, 
  ExternalLink, 
  Copy, 
  Check, 
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import WorkspaceSettingsModal from '@/components/settings/WorkspaceSettingsModal';

export default function AppSidebar() {
  const { 
    workspaces, 
    activeWorkspace, 
    setActiveWorkspace, 
    activeView, 
    setActiveView,
    posts,
    theme,
    toggleTheme
  } = usePostPilot();

  const [copied, setCopied] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const currentWorkspacePosts = posts.filter(p => p.workspaceId === activeWorkspace.id);
  const approvedCount = currentWorkspacePosts.filter(p => p.status === 'approved').length;
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

  return (
    <aside className="w-60 bg-zinc-50 dark:bg-black border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-screen shrink-0 text-zinc-800 dark:text-zinc-200 select-none">
      
      {/* Brand Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-black font-mono font-bold text-xs">
            P
          </div>
          <div>
            <div className="font-semibold text-xs text-zinc-950 dark:text-zinc-50 tracking-tight">
              PostPilot
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              Système CM Pro
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-7 h-7 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center text-zinc-500 transition-colors"
          title="Paramètres"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Workspace Switcher */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500 px-2 mb-1.5 font-medium">
          Workspace
        </div>

        <div className="space-y-1">
          {workspaces.map((ws) => {
            const isActive = ws.id === activeWorkspace.id;
            const wsPosts = posts.filter(p => p.workspaceId === ws.id);
            const wsApproved = wsPosts.filter(p => p.status === 'approved').length;

            return (
              <button
                key={ws.id}
                onClick={() => setActiveWorkspace(ws)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <span className="truncate">{ws.name}</span>
                <span className={`text-[10px] font-mono ${isActive ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-400'}`}>
                  {wsApproved}/{wsPosts.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        
        <div>
          <div className="text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500 px-2 mb-1.5 font-medium">
            Navigation
          </div>
          <nav className="space-y-0.5">
            <button
              onClick={() => setActiveView('calendar')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeView === 'calendar'
                  ? 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Calendrier</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">7j</span>
            </button>

            <button
              onClick={() => setActiveView('table')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeView === 'table'
                  ? 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Table2 className="w-3.5 h-3.5" />
                <span>Tableur 12 Col.</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">XLSX</span>
            </button>

            <button
              onClick={() => setActiveView('inspiration')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeView === 'inspiration'
                  ? 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5" />
                <span>Radar Outliers</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Veille</span>
            </button>
          </nav>
        </div>

        {/* Client External Preview Box */}
        <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-semibold">
              Portail Client
            </span>
            <span className="text-[9px] font-mono text-zinc-400">
              Lien direct
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-zinc-900 dark:text-white" />
                  <span>Copié</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-zinc-500" />
                  <span>Copier lien</span>
                </>
              )}
            </button>

            <a
              href={clientPreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              title="Tester le lien"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Validation Progress */}
        <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Validation</span>
            <span className="font-mono font-semibold text-zinc-950 dark:text-zinc-100">{progressPercent}%</span>
          </div>
          
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-zinc-950 dark:bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* Footer with Theme Toggle */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black flex items-center justify-between text-xs text-zinc-400">
        <span className="text-[10px] font-mono">v2.0 • Monochrome</span>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors font-medium"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3 h-3" />
              <span>Clair</span>
            </>
          ) : (
            <>
              <Moon className="w-3 h-3" />
              <span>Sombre</span>
            </>
          )}
        </button>
      </div>

      {/* Settings Modal */}
      <WorkspaceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

    </aside>
  );
}
