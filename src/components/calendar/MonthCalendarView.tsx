'use client';

import React from 'react';
import { usePostPilot } from '@/context/PostPilotContext';
import { Post } from '@/types/post';
import { getPlatformBadge } from '@/lib/utils';
import { 
  Video, 
  Image as ImageIcon, 
  FileText, 
  Layers, 
  MessageSquare,
  CheckCircle2,
  Clock,
  Plus
} from 'lucide-react';

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function MonthCalendarView() {
  const { filteredPosts, setSelectedPost, activeWorkspace, posts } = usePostPilot();

  // Octobre 2026 : Le 1er est un Jeudi (indice 3)
  const totalDaysInMonth = 31;
  const startDayOffset = 3;

  const calendarCells: { dayNumber: number | null; dateStr: string | null }[] = [];

  for (let i = 0; i < startDayOffset; i++) {
    calendarCells.push({ dayNumber: null, dateStr: null });
  }

  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dayFormatted = String(day).padStart(2, '0');
    calendarCells.push({
      dayNumber: day,
      dateStr: `2026-10-${dayFormatted}`,
    });
  }

  while (calendarCells.length % 7 !== 0) {
    calendarCells.push({ dayNumber: null, dateStr: null });
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'video':
        return <Video className="w-3 h-3 text-cyan-400" />;
      case 'image':
        return <ImageIcon className="w-3 h-3 text-amber-400" />;
      case 'story':
        return <Layers className="w-3 h-3 text-pink-400" />;
      case 'carousel':
        return <Layers className="w-3 h-3 text-purple-400" />;
      default:
        return <FileText className="w-3 h-3 text-blue-400" />;
    }
  };

  const handleQuickAdd = (dateStr: string) => {
    const newPost: Post = {
      id: `post_${activeWorkspace.id}_manual_${Date.now()}`,
      workspaceId: activeWorkspace.id,
      week: 'S2',
      scheduledDate: dateStr,
      dayOfWeek: 'Jeu.',
      time: '11:30',
      platforms: ['instagram', 'facebook'],
      objective: 'Notoriété & Sensibilisation',
      format: 'image',
      theme: 'Nouveau post planifié',
      caption: 'Légende à rédiger...',
      featuredProduct: 'Bubble Tea FruiThé',
      cta: 'Commander au 05 96 93 50 50',
      status: 'draft',
      creativeBrief: 'Affiche Canva / Photo produit',
      mediaUrls: [],
      orderIndex: posts.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSelectedPost(newPost);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#090a0f] p-5">
      {/* Calendar Header: Days of Week */}
      <div className="grid grid-cols-7 gap-px bg-zinc-800/80 rounded-t-2xl overflow-hidden border-t border-x border-zinc-800">
        {DAYS_OF_WEEK.map((day, idx) => (
          <div
            key={day}
            className={`py-2.5 text-center text-[11px] font-bold uppercase tracking-wider ${
              idx >= 5 
                ? 'text-amber-400/90 bg-[#12131a]' 
                : 'text-zinc-400 bg-[#0f1015]'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 gap-px bg-zinc-800/60 border-b border-x border-zinc-800 rounded-b-2xl overflow-y-auto">
        {calendarCells.map((cell, index) => {
          if (!cell.dayNumber) {
            return (
              <div
                key={`empty-${index}`}
                className="bg-[#090a0f]/60 p-2 min-h-[120px] transition-colors"
              />
            );
          }

          const dayPosts = filteredPosts.filter(
            (p) => p.scheduledDate === cell.dateStr
          );

          const isWeekend = index % 7 >= 5;

          return (
            <div
              key={cell.dateStr}
              className={`p-2.5 min-h-[125px] flex flex-col transition-all duration-150 group relative ${
                isWeekend ? 'bg-[#0d0e14]' : 'bg-[#0a0b10]'
              } hover:bg-zinc-900/60`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    dayPosts.length > 0
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'text-zinc-400 group-hover:text-zinc-300'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                <div className="flex items-center gap-1">
                  {dayPosts.length > 0 ? (
                    <span className="text-[10px] font-mono text-zinc-400 font-semibold">
                      {dayPosts.length} post{dayPosts.length > 1 ? 's' : ''}
                    </span>
                  ) : (
                    cell.dateStr && (
                      <button
                        onClick={() => handleQuickAdd(cell.dateStr!)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                        title="Ajouter un post ce jour"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Day Posts List */}
              <div className="flex-1 space-y-2 overflow-y-auto pr-0.5">
                {dayPosts.map((post: Post) => {
                  return (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-zinc-800/90 hover:border-amber-500/40 cursor-pointer transition-all duration-150 shadow-sm hover:shadow-md group/card text-left active:scale-[0.98]"
                    >
                      {/* Format, Time & Status */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span title={post.format}>
                            {getFormatIcon(post.format)}
                          </span>
                          <span className="text-[10px] font-semibold text-zinc-400 capitalize">
                            {post.format}
                          </span>
                          {post.time && (
                            <span className="text-[9px] font-mono text-zinc-400">
                              • {post.time}
                            </span>
                          )}
                        </div>

                        {/* Status Icon */}
                        {post.status === 'approved' ? (
                          <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Validé</span>
                          </div>
                        ) : post.status === 'pending_review' ? (
                          <div className="flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded-full border border-amber-500/20">
                            <Clock className="w-2.5 h-2.5" />
                            <span>En attente</span>
                          </div>
                        ) : post.status === 'changes_requested' ? (
                          <div className="flex items-center gap-1 text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded-full border border-rose-500/20">
                            <span>Retouche</span>
                          </div>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-zinc-600" />
                        )}
                      </div>

                      {/* Theme / Title */}
                      <div className="text-xs font-semibold text-zinc-100 line-clamp-2 leading-snug group-hover/card:text-amber-300 transition-colors mb-1.5">
                        {post.theme}
                      </div>

                      {/* Featured product badge */}
                      {post.featuredProduct && (
                        <div className="text-[10px] text-amber-300/90 truncate font-medium bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20 mb-1.5">
                          🧋 {post.featuredProduct}
                        </div>
                      )}

                      {/* Platform Badges */}
                      <div className="flex items-center gap-1 flex-wrap">
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

                      {/* Client Feedback Flag if requested */}
                      {post.clientFeedback?.comment && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                          <MessageSquare className="w-3 h-3 shrink-0" />
                          <span className="truncate">{post.clientFeedback.comment}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
