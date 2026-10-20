'use client';

import React from 'react';
import { usePostPilot } from '@/context/PostPilotContext';
import { Post, PostStatus } from '@/types/post';
import { getStatusBadge, getPlatformBadge } from '@/lib/utils';
import { 
  Edit3, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

export default function ExcelTableView() {
  const { filteredPosts, setSelectedPost, updatePostStatus, activeWorkspace } = usePostPilot();

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
    <div className="flex-1 flex flex-col h-full bg-[#090a0f] p-5 overflow-hidden">
      
      {/* Table Header Bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <span>Tableau Haute Densité — {activeWorkspace.name}</span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              12 Colonnes XLSX
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Calqué à l&apos;identique sur votre classeur Excel. Cliquez sur le statut pour le basculer ou sur la ligne pour ouvrir l&apos;atelier de création.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="bg-zinc-900/90 px-3 py-1 rounded-lg border border-zinc-800">
            {filteredPosts.length} publications affichées
          </span>
        </div>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="flex-1 border border-zinc-800 rounded-2xl overflow-hidden bg-[#0c0d12] flex flex-col shadow-xl">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs text-zinc-300 border-collapse">
            
            {/* Table Header */}
            <thead className="bg-[#101118] sticky top-0 z-10 border-b border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 w-14 text-center border-r border-zinc-800/80">Sem.</th>
                <th className="py-3 px-3 w-32 border-r border-zinc-800/80">Date / Heure</th>
                <th className="py-3 px-3 w-36 border-r border-zinc-800/80">Réseau</th>
                <th className="py-3 px-3 w-28 border-r border-zinc-800/80">Format</th>
                <th className="py-3 px-3 w-52 border-r border-zinc-800/80">Thème du Post</th>
                <th className="py-3 px-3 min-w-[320px] border-r border-zinc-800/80">Légende & Copywriting</th>
                <th className="py-3 px-3 w-44 border-r border-zinc-800/80">Boisson Vedette</th>
                <th className="py-3 px-3 w-36 border-r border-zinc-800/80">CTA</th>
                <th className="py-3 px-3 w-36 border-r border-zinc-800/80 text-center">Statut (1-Clic)</th>
                <th className="py-3 px-3 w-52 border-r border-zinc-800/80">Créative Brief</th>
                <th className="py-3 px-3 w-16 text-center">Éditer</th>
              </tr>
            </thead>

            {/* Table Body */}
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
                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-400 border-r border-zinc-800/60 bg-zinc-950/40">
                      {post.week}
                    </td>

                    {/* 2. Date & Jour */}
                    <td className="py-3 px-3 border-r border-zinc-800/60 whitespace-nowrap">
                      <div className="font-mono font-semibold text-zinc-100">{post.scheduledDate}</div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                        <span className="font-medium">{post.dayOfWeek}</span>
                        {post.time && <span>• {post.time}</span>}
                      </div>
                    </td>

                    {/* 3. Plateformes */}
                    <td className="py-3 px-3 border-r border-zinc-800/60">
                      <div className="flex flex-wrap gap-1">
                        {post.platforms.map((plat) => {
                          const badge = getPlatformBadge(plat);
                          return (
                            <span
                              key={plat}
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${badge.bg}`}
                            >
                              {badge.name}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* 4. Format */}
                    <td className="py-3 px-3 border-r border-zinc-800/60">
                      <span className="capitalize font-medium text-zinc-300 bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-700/60 text-[11px]">
                        {post.format}
                      </span>
                    </td>

                    {/* 5. Thème */}
                    <td className="py-3 px-3 border-r border-zinc-800/60">
                      <div className="font-semibold text-zinc-100 line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
                        {post.theme}
                      </div>
                    </td>

                    {/* 6. Légende */}
                    <td className="py-3 px-3 border-r border-zinc-800/60">
                      <div className="text-zinc-300 line-clamp-2 text-xs leading-relaxed font-sans">
                        {post.caption}
                      </div>
                      {post.clientFeedback?.comment && (
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                          <MessageSquare className="w-3 h-3 shrink-0" />
                          <span className="truncate">Retouche : {post.clientFeedback.comment}</span>
                        </div>
                      )}
                    </td>

                    {/* 7. Boisson */}
                    <td className="py-3 px-3 border-r border-zinc-800/60">
                      {post.featuredProduct ? (
                        <span className="text-[11px] font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 truncate block">
                          🧋 {post.featuredProduct}
                        </span>
                      ) : (
                        <span className="text-zinc-600 italic text-[11px]">—</span>
                      )}
                    </td>

                    {/* 8. CTA */}
                    <td className="py-3 px-3 border-r border-zinc-800/60">
                      <div className="text-zinc-400 text-xs truncate max-w-[140px]">
                        {post.cta}
                      </div>
                    </td>

                    {/* 9. Statut (Cycle interactif 1-clic) */}
                    <td className="py-3 px-3 border-r border-zinc-800/60 text-center">
                      <button
                        onClick={(e) => handleStatusCycle(e, post)}
                        title="Cliquer pour faire progresser le statut"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs ${
                          post.status === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : post.status === 'pending_review'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : post.status === 'changes_requested'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {post.status === 'approved' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : post.status === 'pending_review' ? (
                          <Clock className="w-3 h-3" />
                        ) : post.status === 'changes_requested' ? (
                          <AlertCircle className="w-3 h-3" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                        )}
                        <span>{statusBadge.label}</span>
                      </button>
                    </td>

                    {/* 10. Créative Brief */}
                    <td className="py-3 px-3 border-r border-zinc-800/60">
                      <div className="text-xs text-zinc-400 truncate max-w-[180px]">
                        {post.creativeBrief}
                      </div>
                    </td>

                    {/* 11. Action */}
                    <td className="py-3 px-3 text-center">
                      <div className="w-7 h-7 rounded-lg bg-zinc-800/80 group-hover:bg-amber-500 group-hover:text-black flex items-center justify-center text-zinc-400 mx-auto transition-colors">
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
