'use client';

import React, { useState } from 'react';
import { usePostPilot } from '@/context/PostPilotContext';
import { 
  FileSpreadsheet, 
  Download, 
  Search, 
  Plus,
  Sun,
  Moon
} from 'lucide-react';
import ExcelImportModal from '@/components/excel/ExcelImportModal';
import * as XLSX from 'xlsx';

export default function AppTopbar() {
  const { 
    workspaces,
    activeWorkspace, 
    setActiveWorkspace,
    posts, 
    activeView,
    setActiveView,
    selectedPlatform, 
    setSelectedPlatform,
    selectedWeek, 
    setSelectedWeek,
    selectedStatus, 
    setSelectedStatus,
    searchQuery, 
    setSearchQuery,
    setSelectedPost,
    theme,
    toggleTheme
  } = usePostPilot();

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const currentWorkspacePosts = posts.filter(p => p.workspaceId === activeWorkspace.id);
  const approvedCount = currentWorkspacePosts.filter(p => p.status === 'approved').length;
  const changesCount = currentWorkspacePosts.filter(p => p.status === 'changes_requested').length;
  const totalCount = currentWorkspacePosts.length;
  const approvalRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  const handleExportExcel = () => {
    const exportRows = currentWorkspacePosts.map(p => ({
      'Semaine': p.week,
      'Date': p.scheduledDate,
      'Jour': p.dayOfWeek,
      'Plateforme': p.platforms.join(' / '),
      'Objectif': p.objective,
      'Format': p.format,
      'Thème de publication': p.theme,
      'Contenu détaillé du post': p.caption,
      'Boisson mise en avant': p.featuredProduct || '',
      'CTA': p.cta,
      'Statut': p.status === 'approved' ? 'Fait' : (p.status === 'pending_review' ? 'En attente' : 'À faire'),
      'Créative': p.creativeBrief,
      'Commentaire Client': p.clientFeedback?.comment || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Octobre 2026');
    XLSX.writeFile(workbook, `PostPilot_${activeWorkspace.id}_Octobre_2026.xlsx`);
  };

  const handleCreateNewPost = () => {
    const newPost = {
      id: `post_${activeWorkspace.id}_manual_${Date.now()}`,
      workspaceId: activeWorkspace.id,
      week: 'S1',
      scheduledDate: '2026-10-08',
      dayOfWeek: 'Jeu.',
      time: '11:30',
      platforms: ['instagram', 'tiktok'] as ('instagram' | 'tiktok')[],
      objective: 'Notoriété',
      format: 'video' as const,
      theme: 'Nouvelle publication',
      caption: 'Légende à rédiger...',
      featuredProduct: 'Bubble Tea Signature',
      cta: 'Commander au 05 96 93 50 50',
      status: 'draft' as const,
      creativeBrief: 'Vidéo courte 9:16',
      mediaUrls: [],
      orderIndex: currentWorkspacePosts.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSelectedPost(newPost);
  };

  return (
    <>
      <header className="bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-3 sm:px-6 py-2.5 sm:py-3.5 shrink-0 flex flex-col gap-2.5 sm:gap-3.5 z-20">
        
        {/* Top line */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          
          {/* Left: Workspace & Month info */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-0.5">
            {/* Direct Workspace Selector */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shrink-0">
              {workspaces.map((ws) => {
                const isWsActive = ws.id === activeWorkspace.id;
                const wsCount = posts.filter(p => p.workspaceId === ws.id).length;
                return (
                  <button
                    key={ws.id}
                    onClick={() => setActiveWorkspace(ws)}
                    className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      isWsActive
                        ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs font-semibold'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                    }`}
                  >
                    <span 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: ws.accentColor }} 
                    />
                    <span className="truncate max-w-[100px] sm:max-w-none">{ws.name}</span>
                    <span className="text-[10px] font-mono opacity-60">({wsCount})</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Octobre 2026
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                {totalCount} posts
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {approvedCount} validés ({approvalRate}%)
              </span>
              {changesCount > 0 && (
                <span className="text-[10px] font-mono text-amber-500">
                  • {changesCount} retouches
                </span>
              )}
            </div>
          </div>

          {/* Center: Clean Segmented View Switcher (Desktop only, Mobile uses Bottom Nav) */}
          <div className="hidden md:flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 self-center">
            <button
              onClick={() => setActiveView('calendar')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeView === 'calendar'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              Calendrier
            </button>

            <button
              onClick={() => setActiveView('table')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeView === 'table'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              Tableur 12 Colonnes
            </button>

            <button
              onClick={() => setActiveView('inspiration')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeView === 'inspiration'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              Radar Concurrentiel
            </button>
          </div>

          {/* Right: Actions & Theme Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 transition-colors"
              title={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* New Post Button */}
            <button
              onClick={handleCreateNewPost}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-black font-semibold text-xs transition-all hover:opacity-90 active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nouveau post</span>
              <span className="sm:hidden">Post</span>
            </button>

            {/* Import Excel */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium text-xs transition-all"
              title="Importer un fichier XLSX"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-500" />
              <span>Importer</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={handleExportExcel}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium text-xs transition-all"
              title="Exporter vers Excel"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>Exporter</span>
            </button>

          </div>

        </div>

        {/* Second Line: Search & Simple Filters (Mobile: horizontally scrollable) */}
        {activeView !== 'inspiration' && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-900 text-xs">
            
            {/* Search */}
            <div className="relative w-full md:max-w-sm">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher une publication..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all"
              />
            </div>

            {/* Horizontal Scrollable Filters on Mobile */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5 w-full md:w-auto">
              {/* Platform filter */}
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shrink-0">
                <span className="text-[10px] uppercase font-mono text-zinc-400 px-1.5 font-medium">Réseau :</span>
                {(['all', 'instagram', 'facebook', 'tiktok', 'linkedin'] as const).map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setSelectedPlatform(plat)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      selectedPlatform === plat
                        ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs font-semibold'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                    }`}
                  >
                    {plat === 'all' ? 'Tous' : plat === 'instagram' ? 'IG' : plat === 'facebook' ? 'FB' : plat === 'tiktok' ? 'TT' : 'LI'}
                  </button>
                ))}
              </div>

              {/* Week Filter */}
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shrink-0">
                <span className="text-[10px] uppercase font-mono text-zinc-400 px-1.5 font-medium">Sem. :</span>
                {(['all', 'S1', 'S2', 'S3', 'S4'] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => setSelectedWeek(w)}
                    className={`px-2 py-1 rounded text-xs font-mono font-medium transition-all ${
                      selectedWeek === w
                        ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs font-semibold'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                    }`}
                  >
                    {w === 'all' ? 'Toutes' : w}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shrink-0">
                <span className="text-[10px] uppercase font-mono text-zinc-400 px-1.5 font-medium">Statut :</span>
                {(['all', 'scheduled', 'approved', 'pending_review', 'changes_requested', 'draft'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      selectedStatus === st
                        ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs font-semibold'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                    }`}
                  >
                    {st === 'all' ? 'Tous' : st === 'scheduled' ? 'Programmé' : st === 'approved' ? 'Validé' : st === 'pending_review' ? 'En attente' : st === 'changes_requested' ? 'Retouche' : 'Brouillon'}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

      </header>

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </>
  );
}
