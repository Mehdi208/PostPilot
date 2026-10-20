'use client';

import React, { useState } from 'react';
import { usePostPilot } from '@/context/PostPilotContext';
import { 
  Calendar, 
  Table2, 
  Flame, 
  ExternalLink, 
  Copy, 
  Check, 
  Coffee, 
  Briefcase, 
  Settings,
  Globe
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

  // Compteurs pour le workspace actif
  const currentWorkspacePosts = posts.filter(p => p.workspaceId === activeWorkspace.id);
  const approvedCount = currentWorkspacePosts.filter(p => p.status === 'approved').length;
  const changesCount = currentWorkspacePosts.filter(p => p.status === 'changes_requested').length;
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
    <aside className="w-64 bg-[#090a0f] border-r border-zinc-800/80 flex flex-col h-screen shrink-0 text-zinc-300 select-none">
      
      {/* Brand Header */}
      <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
            P
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-tight text-sm">PostPilot</span>
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-zinc-800 text-amber-400 border border-zinc-700/60">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Cockpit CM Privé</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          title="Paramètres du workspace"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Workspace Switcher */}
      <div className="p-3 border-b border-zinc-800/60">
        <div className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase px-2 mb-2 flex items-center justify-between">
          <span>Client Actif</span>
          <span className="text-[9px] font-mono text-zinc-400">2 Espaces</span>
        </div>

        <div className="space-y-1.5">
          {workspaces.map((ws) => {
            const isActive = ws.id === activeWorkspace.id;
            const wsPosts = posts.filter(p => p.workspaceId === ws.id);
            const wsApproved = wsPosts.filter(p => p.status === 'approved').length;

            return (
              <button
                key={ws.id}
                onClick={() => setActiveWorkspace(ws)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white font-semibold border border-zinc-700/80 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div 
                    className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white text-xs shadow-xs"
                    style={{ backgroundColor: ws.accentColor }}
                  >
                    {ws.id === 'fruithe' ? (
                      <Coffee className="w-3.5 h-3.5" />
                    ) : (
                      <Briefcase className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="text-left truncate">
                    <div className="truncate text-xs font-medium leading-none mb-1 text-zinc-100">
                      {ws.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      {ws.id === 'fruithe' ? 'Abidjan Bonoumin' : 'B2B LinkedIn'}
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                  isActive ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-zinc-400'
                }`}>
                  {wsApproved}/{wsPosts.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        
        {/* Core Views */}
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase px-2 mb-1.5">
            Pilotage Éditorial
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveView('calendar')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeView === 'calendar'
                  ? 'bg-zinc-800 text-white font-semibold border border-zinc-700/80'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Calendrier Mensuel</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">7j</span>
            </button>

            <button
              onClick={() => setActiveView('table')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeView === 'table'
                  ? 'bg-zinc-800 text-white font-semibold border border-zinc-700/80'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Table2 className="w-4 h-4 text-cyan-400" />
                <span>Tableur 12 Colonnes</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">XLSX</span>
            </button>

            <button
              onClick={() => setActiveView('inspiration')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeView === 'inspiration'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Radar Veille & Outliers</span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400">
                24-48h
              </span>
            </button>
          </nav>
        </div>

        {/* Client External Preview Section */}
        <div className="p-3 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              <span>Portail Client</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
              Hermétique
            </span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-snug">
            Lien externe sécurisé sans mot de passe envoyé à la cliente FruiThé pour validation.
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Lien copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copier le lien</span>
                </>
              )}
            </button>

            <a
              href={clientPreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              title="Tester en direct"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Progress & Validation Meter */}
        <div className="p-3 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Validation Octobre</span>
            <span className="font-mono font-bold text-amber-400">{progressPercent}%</span>
          </div>
          
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
            <span>{approvedCount} faits</span>
            {changesCount > 0 && <span className="text-amber-400">{changesCount} retouches</span>}
            <span>{totalPosts} total</span>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-[11px] font-mono">Cloud Synced</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400">v1.2.0</span>
      </div>

      {/* Settings Modal */}
      <WorkspaceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

    </aside>
  );
}
