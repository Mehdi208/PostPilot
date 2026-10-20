'use client';

import React, { useState } from 'react';
import { usePostPilot } from '@/context/PostPilotContext';
import { 
  FileSpreadsheet, 
  Download, 
  Search, 
  CheckCircle2, 
  Clock, 
  CalendarDays,
  Plus
} from 'lucide-react';
import ExcelImportModal from '@/components/excel/ExcelImportModal';
import * as XLSX from 'xlsx';

export default function AppTopbar() {
  const { 
    activeWorkspace, 
    filteredPosts,
    posts, 
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

  const handleExportExcel = () => {
    // Exporte les posts actuels du workspace au format Excel 12 colonnes
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
      scheduledDate: '2026-10-05',
      dayOfWeek: 'Lun.',
      time: '11:30',
      platforms: ['facebook', 'instagram'] as ('facebook' | 'instagram')[],
      objective: 'Notoriété & Sensibilisation',
      format: 'image' as const,
      theme: 'Nouvelle publication',
      caption: 'Rédigez votre légende ici...',
      cta: 'Commander au 05 96 93 50 50',
      status: 'draft' as const,
      creativeBrief: 'Affiche Canva / Photo produit',
      mediaUrls: [],
      orderIndex: currentWorkspacePosts.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSelectedPost(newPost);
  };

  return (
    <>
      <header className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-6 py-3 shrink-0 flex flex-col gap-3">
        {/* Top line: Context & Primary Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-amber-400" />
              <h1 className="text-base font-bold text-zinc-100 tracking-tight">
                Octobre 2026
              </h1>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                Feuille Active
              </span>
            </div>

            {/* Micro Stats */}
            <div className="hidden lg:flex items-center gap-2 text-xs pl-3 border-l border-zinc-800">
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                {approvedCount} validés
              </span>
              <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <Clock className="w-3 h-3" />
                {pendingCount} en attente
              </span>
              <span className="text-zinc-500">
                ({filteredPosts.length} affichés)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Box */}
            <div className="relative w-48 lg:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher un post, boisson..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 transition-all"
              />
            </div>

            {/* Excel Actions */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 rounded-lg text-xs font-medium transition-all shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Importer Excel</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 rounded-lg text-xs font-medium transition-all shadow-xs"
              title="Exporter le calendrier enrichi des retours"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Exporter .xlsx</span>
            </button>

            {/* Add New Post */}
            <button
              onClick={handleCreateNewPost}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg text-xs font-semibold transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Nouveau Post</span>
            </button>
          </div>
        </div>

        {/* Second line: Filters Bar */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-900">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Platform Filter */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-zinc-400 font-medium mr-1">Réseau :</span>
              {[
                { id: 'all', label: 'Tous' },
                { id: 'facebook', label: 'Facebook' },
                { id: 'instagram', label: 'Instagram' },
                { id: 'tiktok', label: 'TikTok' },
                { id: 'linkedin', label: 'LinkedIn' },
              ].map((plat) => (
                <button
                  key={plat.id}
                  onClick={() => setSelectedPlatform(plat.id)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                    selectedPlatform === plat.id
                      ? 'bg-zinc-800 text-zinc-100 font-medium border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  {plat.label}
                </button>
              ))}
            </div>

            {/* Week Filter */}
            <div className="flex items-center gap-1 pl-2 border-l border-zinc-800">
              <span className="text-[11px] text-zinc-400 font-medium mr-1">Semaine :</span>
              {['all', 'S1', 'S2', 'S3', 'S4'].map((w) => (
                <button
                  key={w}
                  onClick={() => setSelectedWeek(w)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                    selectedWeek === w
                      ? 'bg-amber-500/10 text-amber-400 font-medium border border-amber-500/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  {w === 'all' ? 'Toutes' : w}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 pl-2 border-l border-zinc-800">
              <span className="text-[11px] text-zinc-400 font-medium mr-1">Statut :</span>
              {[
                { id: 'all', label: 'Tous' },
                { id: 'approved', label: 'Validé' },
                { id: 'pending_review', label: 'En attente' },
                { id: 'draft', label: 'Brouillon' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatus(st.id)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                    selectedStatus === st.id
                      ? 'bg-zinc-800 text-zinc-100 font-medium border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Excel Import Dialog */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </>
  );
}
