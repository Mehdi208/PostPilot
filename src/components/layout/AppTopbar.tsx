'use client';

import React, { useState } from 'react';
import { usePostPilot } from '@/context/PostPilotContext';
import { 
  FileSpreadsheet, 
  Download, 
  Search, 
  CalendarDays,
  Plus,
  Flame,
  Table2,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import ExcelImportModal from '@/components/excel/ExcelImportModal';
import * as XLSX from 'xlsx';

export default function AppTopbar() {
  const { 
    activeWorkspace, 
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
    setSelectedPost 
  } = usePostPilot();

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const currentWorkspacePosts = posts.filter(p => p.workspaceId === activeWorkspace.id);
  const approvedCount = currentWorkspacePosts.filter(p => p.status === 'approved').length;
  const pendingCount = currentWorkspacePosts.filter(p => p.status === 'pending_review').length;
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
      objective: 'Notoriété & Sensibilisation',
      format: 'video' as const,
      theme: 'Nouvelle publication virale',
      caption: 'Écrivez votre hook et votre légende ici...',
      featuredProduct: 'Bubble Tea Signature',
      cta: 'Commander au 05 96 93 50 50',
      status: 'draft' as const,
      creativeBrief: 'Affiche photo 4K / Vidéo Reel 9:16',
      mediaUrls: [],
      orderIndex: currentWorkspacePosts.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSelectedPost(newPost);
  };

  return (
    <>
      <header className="bg-[#0b0c10]/95 backdrop-blur-xl border-b border-zinc-800/80 px-6 py-3.5 shrink-0 flex flex-col gap-3.5 z-20">
        
        {/* Top line: Workspace context, View switcher & Action CTAs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Left: Sheet & Month Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-zinc-100 tracking-tight">
                  Octobre 2026
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
                  Feuille Réelle
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {totalCount} posts au planning
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                <span className="flex items-center gap-1 text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{approvedCount} validés ({approvalRate}%)</span>
                </span>
                {changesCount > 0 && (
                  <span className="flex items-center gap-1 text-amber-400 font-mono">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{changesCount} retouches</span>
                  </span>
                )}
                {pendingCount > 0 && (
                  <span className="text-zinc-500 font-mono">
                    • {pendingCount} en attente
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center: View Switcher (Calendar, Table, Radar) */}
          <div className="flex items-center bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl self-start lg:self-center shadow-xs">
            <button
              onClick={() => setActiveView('calendar')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'calendar'
                  ? 'bg-zinc-800 text-white shadow-xs border border-zinc-700/80'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Calendrier Mensuel</span>
            </button>

            <button
              onClick={() => setActiveView('table')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'table'
                  ? 'bg-zinc-800 text-white shadow-xs border border-zinc-700/80'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Table2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Grille Tableur 12 Colonnes</span>
            </button>

            <button
              onClick={() => setActiveView('inspiration')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'inspiration'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 shadow-xs border border-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Radar Veille & Outliers</span>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 self-start lg:self-center">
            
            {/* New Post Button */}
            <button
              onClick={handleCreateNewPost}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all active:scale-[0.96]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nouveau Post</span>
            </button>

            {/* Import Excel */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs border border-zinc-800 transition-all active:scale-[0.97]"
              title="Importer un fichier XLSX"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Importer XLSX</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs border border-zinc-800 transition-all active:scale-[0.97]"
              title="Exporter vers Excel"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Exporter</span>
            </button>

          </div>

        </div>

        {/* Second Line: Search & Granular Filters (Shown on Calendar & Table) */}
        {activeView !== 'inspiration' && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-zinc-800/60 text-xs">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par thème, boisson, mot-clé, date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
            </div>

            {/* Platform filter pills */}
            <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
              <span className="text-[11px] text-zinc-500 px-2 font-medium">Réseau :</span>
              {(['all', 'instagram', 'facebook', 'tiktok', 'linkedin'] as const).map((plat) => (
                <button
                  key={plat}
                  onClick={() => setSelectedPlatform(plat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedPlatform === plat
                      ? 'bg-zinc-800 text-white font-semibold border border-zinc-700/80 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {plat === 'all' ? 'Tous' : plat === 'instagram' ? 'Instagram' : plat === 'facebook' ? 'Facebook' : plat === 'tiktok' ? 'TikTok' : 'LinkedIn'}
                </button>
              ))}
            </div>

            {/* Week Filter Pills */}
            <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
              <span className="text-[11px] text-zinc-500 px-2 font-medium">Semaine :</span>
              {(['all', 'S1', 'S2', 'S3', 'S4'] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setSelectedWeek(w)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedWeek === w
                      ? 'bg-amber-500 text-black font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {w === 'all' ? 'Toutes' : w}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
              <span className="text-[11px] text-zinc-500 px-2 font-medium">Statut :</span>
              {(['all', 'approved', 'pending_review', 'changes_requested', 'draft'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedStatus === st
                      ? 'bg-zinc-800 text-white font-semibold border border-zinc-700/80 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {st === 'all' ? 'Tous' : st === 'approved' ? '✓ Validé' : st === 'pending_review' ? '⏳ En attente' : st === 'changes_requested' ? '⚠️ Retouche' : 'Brouillon'}
                </button>
              ))}
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
