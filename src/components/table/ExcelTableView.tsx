'use client';

import React from 'react';
import { usePostPilot } from '@/context/PostPilotContext';
import { Post, PostStatus } from '@/types/post';
import { getStatusBadge, getPlatformBadge } from '@/lib/utils';
import { Edit3 } from 'lucide-react';

export default function ExcelTableView() {
  const { filteredPosts, setSelectedPost, updatePostStatus } = usePostPilot();

  const handleStatusCycle = (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    const cycle: Record<PostStatus, PostStatus> = {
      draft: 'pending_review',
      pending_review: 'approved',
      approved: 'published',
      published: 'draft',
      changes_requested: 'pending_review',
      scheduled: 'published',
    };
    updatePostStatus(post.id, cycle[post.status] || 'pending_review');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            Tableau Opérationnel FruiThé
            <span className="text-xs font-normal text-zinc-500 font-mono">
              (12 Colonnes Synchronisées)
            </span>
          </h2>
          <p className="text-xs text-zinc-400">
            Cliquez sur un statut pour le faire progresser ou sur une ligne pour éditer le contenu et la créa.
          </p>
        </div>
        <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
          {filteredPosts.length} publications
        </span>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="flex-1 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs text-zinc-300 border-collapse">
            <thead className="bg-zinc-900/90 sticky top-0 z-10 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center border-r border-zinc-800/80">Sem.</th>
                <th className="py-2.5 px-3 w-28 border-r border-zinc-800/80">Date / Jour</th>
                <th className="py-2.5 px-3 w-36 border-r border-zinc-800/80">Plateforme</th>
                <th className="py-2.5 px-3 w-28 border-r border-zinc-800/80">Format</th>
                <th className="py-2.5 px-3 w-48 border-r border-zinc-800/80">Thème & Titre</th>
                <th className="py-2.5 px-3 min-w-[280px] border-r border-zinc-800/80">Contenu Détaillé (Légende)</th>
                <th className="py-2.5 px-3 w-44 border-r border-zinc-800/80">Boisson Mise en Avant</th>
                <th className="py-2.5 px-3 w-36 border-r border-zinc-800/80">CTA</th>
                <th className="py-2.5 px-3 w-32 border-r border-zinc-800/80 text-center">Statut</th>
                <th className="py-2.5 px-3 w-48 border-r border-zinc-800/80">Créative (Brief)</th>
                <th className="py-2.5 px-3 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filteredPosts.map((post) => {
                const statusBadge = getStatusBadge(post.status);

                return (
                  <tr
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="hover:bg-zinc-900/60 cursor-pointer transition-colors group"
                  >
                    {/* 1. Semaine */}
                    <td className="py-2.5 px-3 text-center font-mono font-medium text-amber-400 border-r border-zinc-800/60 bg-zinc-900/20">
                      {post.week}
                    </td>

                    {/* 2 & 3. Date & Jour */}
                    <td className="py-2.5 px-3 border-r border-zinc-800/60 whitespace-nowrap">
                      <div className="font-mono text-zinc-200">{post.scheduledDate}</div>
                      <div className="text-[10px] text-zinc-500 font-medium">{post.dayOfWeek}</div>
                    </td>

                    {/* 4. Plateformes */}
                    <td className="py-2.5 px-3 border-r border-zinc-800/60">
                      <div className="flex flex-wrap gap-1">
                        {post.platforms.map((plat) => {
                          const badge = getPlatformBadge(plat);
                          return (
                            <span
                              key={plat}
                              className={`text-[9px] px-1 py-0.2 rounded font-medium ${badge.bg}`}
                            >
                              {badge.name}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* 6. Format */}
                    <td className="py-2.5 px-3 border-r border-zinc-800/60 capitalize font-medium text-zinc-300">
                      {post.format}
                    </td>

                    {/* 7. Thème */}
                    <td className="py-2.5 px-3 border-r border-zinc-800/60 font-medium text-zinc-100 group-hover:text-amber-400 transition-colors">
                      {post.theme}
                    </td>

                    {/* 8. Contenu détaillé */}
                    <td className="py-2.5 px-3 border-r border-zinc-800/60 text-zinc-400">
                      <p className="line-clamp-2 text-[11px] leading-relaxed">
                        {post.caption}
                      </p>
                    </td>

                    {/* 9. Boisson mise en avant */}
                    <td className="py-2.5 px-3 border-r border-zinc-800/60 text-zinc-300 text-[11px]">
                      {post.featuredProduct ? (
                        <span className="text-amber-400 font-medium bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10 block truncate">
                          🧋 {post.featuredProduct}
                        </span>
                      ) : (
                        <span className="text-zinc-600 italic">—</span>
                      )}
                    </td>

                    {/* 10. CTA */}
                    <td className="py-2.5 px-3 border-r border-zinc-800/60 text-zinc-400 text-[11px] truncate">
                      {post.cta || <span className="text-zinc-600">—</span>}
                    </td>

                    {/* 11. Statut (Cycle interactif) */}
                    <td className="py-2.5 px-3 border-r border-zinc-800/60 text-center">
                      <button
                        onClick={(e) => handleStatusCycle(e, post)}
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium border transition-all ${statusBadge.color}`}
                        title="Cliquer pour changer de statut"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                        <span>{statusBadge.label}</span>
                      </button>
                    </td>

                    {/* 12. Créative */}
                    <td className="py-2.5 px-3 border-r border-zinc-800/60 text-zinc-400 text-[11px]">
                      <p className="line-clamp-1 truncate" title={post.creativeBrief}>
                        {post.creativeBrief}
                      </p>
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all"
                        title="Inspecter le post"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
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
