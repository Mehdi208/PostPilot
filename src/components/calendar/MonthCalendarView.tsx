'use client';

import React from 'react';
import { usePostPilot } from '@/context/PostPilotContext';
import { Post } from '@/types/post';
import { getPlatformBadge } from '@/lib/utils';
import { Plus } from 'lucide-react';

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function MonthCalendarView() {
  const { filteredPosts, setSelectedPost, activeWorkspace, posts } = usePostPilot();

  const totalDaysInMonth = 31;
  const startDayOffset = 3; // Jeudi 1er octobre 2026

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

  const handleQuickAdd = (dateStr: string) => {
    const newPost: Post = {
      id: `post_${activeWorkspace.id}_manual_${Date.now()}`,
      workspaceId: activeWorkspace.id,
      week: 'S2',
      scheduledDate: dateStr,
      dayOfWeek: 'Jeu.',
      time: '11:30',
      platforms: ['instagram', 'facebook'],
      objective: 'Notoriété',
      format: 'image',
      theme: 'Nouvelle publication',
      caption: 'Légende à rédiger...',
      featuredProduct: 'Bubble Tea FruiThé',
      cta: 'Commander au 05 96 93 50 50',
      status: 'draft',
      creativeBrief: 'Affiche carrée ou verticale',
      mediaUrls: [],
      orderIndex: posts.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSelectedPost(newPost);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-black p-5">
      
      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-px bg-zinc-200 dark:bg-zinc-800 rounded-t-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
        {DAYS_OF_WEEK.map((day, idx) => (
          <div
            key={day}
            className={`py-2 text-center text-[10px] font-mono font-semibold uppercase tracking-wider ${
              idx >= 5 
                ? 'text-zinc-500 bg-zinc-100 dark:bg-zinc-950' 
                : 'text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 gap-px bg-zinc-200 dark:bg-zinc-800 border-b border-x border-zinc-200 dark:border-zinc-800 rounded-b-lg overflow-y-auto">
        {calendarCells.map((cell, index) => {
          if (!cell.dayNumber) {
            return (
              <div
                key={`empty-${index}`}
                className="bg-zinc-50/50 dark:bg-zinc-950/50 p-2 min-h-[120px]"
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
              className={`p-2 min-h-[120px] flex flex-col transition-all duration-100 group ${
                isWeekend 
                  ? 'bg-zinc-50/70 dark:bg-[#070709]' 
                  : 'bg-white dark:bg-[#09090b]'
              } hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-mono font-bold px-1.5 py-0.2 rounded ${
                    dayPosts.length > 0
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold'
                      : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  {cell.dayNumber < 10 ? `0${cell.dayNumber}` : cell.dayNumber}
                </span>

                <div className="flex items-center gap-1">
                  {dayPosts.length > 0 ? (
                    <span className="text-[10px] font-mono text-zinc-400">
                      {dayPosts.length}
                    </span>
                  ) : (
                    cell.dateStr && (
                      <button
                        onClick={() => handleQuickAdd(cell.dateStr!)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
                        title="Ajouter un post"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Day Posts List */}
              <div className="flex-1 space-y-1.5 overflow-y-auto pr-0.5">
                {dayPosts.map((post: Post) => {
                  return (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="p-2 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 cursor-pointer transition-all shadow-xs group/card text-left active:scale-[0.98]"
                    >
                      {/* Format, Time & Status */}
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono uppercase text-zinc-500 capitalize">
                            {post.format}
                          </span>
                          {post.time && (
                            <span className="text-[9px] font-mono text-zinc-400">
                              • {post.time}
                            </span>
                          )}
                        </div>

                        {/* Status Label Minimalist */}
                        {post.status === 'approved' ? (
                          <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
                            Validé
                          </span>
                        ) : post.status === 'pending_review' ? (
                          <span className="text-[9px] font-mono text-zinc-500">
                            Attente
                          </span>
                        ) : post.status === 'changes_requested' ? (
                          <span className="text-[9px] font-mono text-zinc-900 dark:text-zinc-100 font-bold underline">
                            Retouche
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-zinc-400">
                            Brouillon
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover/card:underline mb-1">
                        {post.theme}
                      </div>

                      {/* Product note if available */}
                      {post.featuredProduct && (
                        <div className="text-[10px] text-zinc-600 dark:text-zinc-400 truncate font-mono">
                          {post.featuredProduct}
                        </div>
                      )}

                      {/* Platform Badges */}
                      <div className="flex items-center gap-1 flex-wrap mt-1">
                        {post.platforms.map((plat) => {
                          const badge = getPlatformBadge(plat);
                          return (
                            <span
                              key={plat}
                              className="text-[9px] font-mono px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                            >
                              {badge.name}
                            </span>
                          );
                        })}
                      </div>
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
