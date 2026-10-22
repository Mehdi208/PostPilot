'use client';

import React from 'react';
import { usePostPilot } from '@/context/PostPilotContext';
import { Post, PostStatus } from '@/types/post';
import { getStatusBadge, getPlatformBadge } from '@/lib/utils';
import { Edit3, RotateCcw } from 'lucide-react';

export default function ExcelTableView() {
  const { filteredPosts, setSelectedPost, updatePostStatus, activeWorkspace, resetToOfficialOctoberCalendar } = usePostPilot();

  const handleStatusCycle = (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    const cycle: Record<PostStatus, PostStatus> = {
      draft: 'pending_review',
      pending_review: 'approved',
      approved: 'scheduled',
      scheduled: 'published',
      published: 'draft',
      changes_requested: 'pending_review',
    };
    updatePostStatus(post.id, cycle[post.status] || 'scheduled');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-black p-3 sm:p-5 pb-20 md:pb-5 overflow-hidden">
      
      {/* Table Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-3 px-1 shrink-0">
        <div>
          <h2 className="text-xs sm:text-sm font-semibold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <span>Tableau Opérationnel — {activeWorkspace.name}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-500">
              12 Colonnes
            </span>
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Synchronisation directe avec la feuille Excel. Cliquez sur le statut pour changer d&apos;état ou sur une ligne pour ouvrir l&apos;éditeur.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto">
          <div className="text-xs font-mono text-zinc-500">
            {filteredPosts.length} publications
          </div>
          <button
            onClick={resetToOfficialOctoberCalendar}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-all active:scale-[0.98]"
            title="Recharger les 16 publications officielles d'Octobre 2026"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Recharger Octobre 2026</span>
            <span className="sm:hidden">Recharger</span>
          </button>
        </div>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="md:hidden px-3 py-1.5 mb-2 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[11px] font-mono text-zinc-500 flex items-center justify-between shrink-0">
        <span>👉 Glissez horizontalement (12 colonnes)</span>
        <span className="text-zinc-950 dark:text-zinc-100 font-semibold">{filteredPosts.length} lignes</span>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="flex-1 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-black flex flex-col shadow-xs">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs text-zinc-800 dark:text-zinc-200 border-collapse">
            
            {/* Table Header */}
            <thead className="bg-zinc-50 dark:bg-zinc-950 sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center border-r border-zinc-200 dark:border-zinc-800">Sem.</th>
                <th className="py-2.5 px-3 w-28 border-r border-zinc-200 dark:border-zinc-800">Date</th>
                <th className="py-2.5 px-3 w-36 border-r border-zinc-200 dark:border-zinc-800">Réseau</th>
                <th className="py-2.5 px-3 w-24 border-r border-zinc-200 dark:border-zinc-800">Format</th>
                <th className="py-2.5 px-3 w-52 border-r border-zinc-200 dark:border-zinc-800">Thème</th>
                <th className="py-2.5 px-3 min-w-[320px] border-r border-zinc-200 dark:border-zinc-800">Légende</th>
                <th className="py-2.5 px-3 w-40 border-r border-zinc-200 dark:border-zinc-800">Produit</th>
                <th className="py-2.5 px-3 w-36 border-r border-zinc-200 dark:border-zinc-800">CTA</th>
                <th className="py-2.5 px-3 w-32 border-r border-zinc-200 dark:border-zinc-800 text-center">Statut</th>
                <th className="py-2.5 px-3 w-48 border-r border-zinc-200 dark:border-zinc-800">Créative</th>
                <th className="py-2.5 px-3 w-14 text-center">Éditer</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80 font-sans">
              {filteredPosts.map((post) => {
                const statusBadge = getStatusBadge(post.status);

                return (
                  <tr
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 cursor-pointer transition-colors group"
                  >
                    {/* 1. Semaine */}
                    <td className="py-2.5 px-3 text-center font-mono font-semibold text-zinc-900 dark:text-zinc-100 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                      {post.week}
                    </td>

                    {/* 2. Date */}
                    <td className="py-2.5 px-3 border-r border-zinc-200 dark:border-zinc-800 whitespace-nowrap">
                      <div className="font-mono text-xs text-zinc-900 dark:text-zinc-100 font-medium">{post.scheduledDate}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{post.dayOfWeek} {post.time ? `• ${post.time}` : ''}</div>
                    </td>

                    {/* 3. Plateformes */}
                    <td className="py-2.5 px-3 border-r border-zinc-200 dark:border-zinc-800">
                      <div className="flex flex-wrap gap-1">
                        {post.platforms.map((plat) => {
                          const badge = getPlatformBadge(plat);
                          return (
                            <span
                              key={plat}
                              className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-medium"
                            >
                              {badge.name}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* 4. Format */}
                    <td className="py-2.5 px-3 border-r border-zinc-200 dark:border-zinc-800">
                      <span className="capitalize font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                        {post.format}
                      </span>
                    </td>

                    {/* 5. Thème */}
                    <td className="py-2.5 px-3 border-r border-zinc-200 dark:border-zinc-800">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:underline">
                        {post.theme}
                      </div>
                    </td>

                    {/* 6. Légende */}
                    <td className="py-2.5 px-3 border-r border-zinc-200 dark:border-zinc-800">
                      <div className="text-zinc-600 dark:text-zinc-400 line-clamp-2 text-xs leading-relaxed">
                        {post.caption}
                      </div>
                      {post.clientFeedback?.comment && (
                        <div className="mt-1 text-[10px] text-zinc-900 dark:text-zinc-100 font-mono underline">
                          Note : {post.clientFeedback.comment}
                        </div>
                      )}
                    </td>

                    {/* 7. Boisson */}
                    <td className="py-2.5 px-3 border-r border-zinc-200 dark:border-zinc-800 font-mono text-[11px]">
                      {post.featuredProduct || <span className="text-zinc-400">—</span>}
                    </td>

                    {/* 8. CTA */}
                    <td className="py-2.5 px-3 border-r border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs truncate max-w-[130px]">
                      {post.cta}
                    </td>

                    {/* 9. Statut (Cycle interactif 1-clic) */}
                    <td className="py-2.5 px-3 border-r border-zinc-200 dark:border-zinc-800 text-center">
                      <button
                        onClick={(e) => handleStatusCycle(e, post)}
                        title="Faire progresser le statut"
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono border transition-all cursor-pointer font-medium hover:scale-105 active:scale-95 ${statusBadge.color}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                        <span>{statusBadge.label}</span>
                      </button>
                    </td>

                    {/* 10. Créative Brief */}
                    <td className="py-2.5 px-3 border-r border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 truncate max-w-[160px]">
                      {post.creativeBrief}
                    </td>

                    {/* 11. Action */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white mx-auto transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
