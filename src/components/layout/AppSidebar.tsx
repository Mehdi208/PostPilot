'use client';

import React, { useState } from 'react';
import { usePostPilot } from '@/context/PostPilotContext';
import { 
  Calendar, 
  Table2, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  Coffee, 
  Briefcase, 
  Radio, 
  Lock,
  ChevronRight,
  Settings
} from 'lucide-react';
import WorkspaceSettingsModal from '@/components/settings/WorkspaceSettingsModal';

export default function AppSidebar() {
  const { 
    workspaces, 
    activeWorkspace, 
    setActiveWorkspace, 
    activeView, 
    setActiveView,
    posts 
  } = usePostPilot();

  const [copied, setCopied] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Compteurs pour le badge du workspace actif
  const currentWorkspacePosts = posts.filter(p => p.workspaceId === activeWorkspace.id);
  const pendingCount = currentWorkspacePosts.filter(p => p.status === 'pending_review').length;
  const approvedCount = currentWorkspacePosts.filter(p => p.status === 'approved').length;

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
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col h-screen shrink-0 text-zinc-300">
      {/* Brand Header */}
      <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            🚀
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-zinc-100 tracking-tight text-sm">PostPilot</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-medium">OS CM</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-zinc-500">
              <Lock className="w-2.5 h-2.5 text-emerald-500" />
              <span>Cockpit Privé</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Switcher */}
      <div className="p-3 border-b border-zinc-800/60">
        <label className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase px-2 mb-1.5 block">
          Client & Espace Actif
        </label>
        <div className="space-y-1">
          {workspaces.map((ws) => {
            const isActive = ws.id === activeWorkspace.id;
            return (
              <button
                key={ws.id}
                onClick={() => setActiveWorkspace(ws)}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-all ${
                  isActive
                    ? 'bg-zinc-800/90 text-white font-medium border border-zinc-700/60 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div 
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-white text-xs"
                    style={{ backgroundColor: ws.accentColor }}
                  >
                    {ws.id === 'fruithe' ? (
                      <Coffee className="w-3.5 h-3.5" />
                    ) : (
                      <Briefcase className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="text-left truncate">
                    <div className="truncate font-semibold">{ws.name}</div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      {ws.id === 'fruithe' ? 'Riviera Bonoumin' : 'B2B LinkedIn'}
                    </div>
                  </div>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Navigation Views */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        <label className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase px-2 mb-1.5 block">
          Vues Opérationnelles
        </label>

        <button
          onClick={() => setActiveView('calendar')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            activeView === 'calendar'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Calendrier Mensuel</span>
          <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
            {currentWorkspacePosts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveView('table')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            activeView === 'table'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <Table2 className="w-4 h-4 text-sky-400" />
          <span>Tableur Excel (12 Col.)</span>
        </button>

        <button
          onClick={() => setActiveView('inspiration')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            activeView === 'inspiration'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Radar & Inspiration</span>
          <span className="ml-auto text-[9px] bg-purple-500/20 text-purple-300 px-1 rounded">Veille</span>
        </button>

        {/* Status Breakdown Mini */}
        <div className="pt-4 px-2">
          <label className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase mb-2 block">
            Progression Mensuelle
          </label>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Validés client
              </span>
              <span className="font-mono text-zinc-200">{approvedCount}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                En attente validation
              </span>
              <span className="font-mono text-amber-400 font-semibold">{pendingCount}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                Total du mois
              </span>
              <span className="font-mono text-zinc-300">{currentWorkspacePosts.length}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Client Preview Portal Card */}
      <div className="p-3 border-t border-zinc-800/70 bg-zinc-950/80">
        <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-200">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Portail Client Sécurisé</span>
            </div>
            <span className="text-[9px] px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
              /preview
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mb-2.5 leading-snug">
            Lien sans mot de passe envoyé à la cliente (FruiThé) pour valider ou commenter.
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/20 rounded text-[11px] font-medium transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Lien Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copier le lien</span>
                </>
              )}
            </button>
            <a
              href={`/preview/${activeWorkspace.previewToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-all"
              title="Tester la vue client dans un nouvel onglet"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Settings & Automation Button */}
      <div className="px-3 py-2 border-t border-zinc-800/60">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Paramètres & Webhooks</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Make</span>
        </button>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-200 text-xs">
            MT
          </div>
          <div className="truncate">
            <div className="font-semibold text-zinc-200 truncate">Méhdi Traoré</div>
            <div className="text-[10px] text-zinc-400">Directeur CM & Stratège</div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-600" />
      </div>

      {/* Workspace Settings Modal */}
      <WorkspaceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </aside>
  );
}
