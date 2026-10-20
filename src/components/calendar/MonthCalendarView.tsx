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
  Clock
} from 'lucide-react';

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function MonthCalendarView() {
  const { filteredPosts, setSelectedPost } = usePostPilot();

  // Année et mois cibles : Octobre 2026
  // Le 1er octobre 2026 est un Jeudi (indice 3 pour Lun=0, Mar=1, Mer=2, Jeu=3)
  const totalDaysInMonth = 31;
  const startDayOffset = 3; // Jeudi

  // Tableau des 35 ou 42 cellules du calendrier
  const calendarCells: { dayNumber: number | null; dateStr: string | null }[] = [];

  // Jours vides avant le 1er du mois
  for (let i = 0; i < startDayOffset; i++) {
    calendarCells.push({ dayNumber: null, dateStr: null });
  }

  // Jours du mois d'octobre 2026
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dayFormatted = String(day).padStart(2, '0');
    calendarCells.push({
      dayNumber: day,
      dateStr: `2026-10-${dayFormatted}`,
    });
  }

  // Complète la dernière semaine pour avoir un multiple de 7
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950 p-6">
      {/* Calendar Header: Days of Week */}
      <div className="grid grid-cols-7 gap-px bg-zinc-800/80 rounded-t-xl overflow-hidden border-t border-x border-zinc-800">
        {DAYS_OF_WEEK.map((day, idx) => (
          <div
            key={day}
            className={`py-2 text-center text-xs font-semibold uppercase tracking-wider ${
              idx >= 5 ? 'text-amber-500/80 bg-zinc-900/60' : 'text-zinc-400 bg-zinc-900'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 gap-px bg-zinc-800/60 border-b border-x border-zinc-800 rounded-b-xl overflow-y-auto">
        {calendarCells.map((cell, index) => {
          if (!cell.dayNumber) {
            return (
              <div
                key={`empty-${index}`}
                className="bg-zinc-950/40 p-2 min-h-[120px] transition-colors"
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
              className={`p-2 min-h-[120px] flex flex-col transition-colors group ${
                isWeekend ? 'bg-zinc-950/70' : 'bg-zinc-950'
              } hover:bg-zinc-900/40`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                    dayPosts.length > 0
                      ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20'
                      : 'text-zinc-500'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                {dayPosts.length > 0 && (
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {dayPosts.length} post{dayPosts.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Day Posts List */}
              <div className="flex-1 space-y-1.5 overflow-y-auto pr-0.5">
                {dayPosts.map((post: Post) => {
                  return (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="p-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700/80 cursor-pointer transition-all shadow-xs group/card text-left"
                    >
                      {/* Format & Platforms Row */}
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1">
                          <span title={post.format}>
                            {getFormatIcon(post.format)}
                          </span>
                          <span className="text-[10px] font-medium text-zinc-400 capitalize truncate max-w-[60px]">
                            {post.format}
                          </span>
                        </div>

                        {/* Status Icon Indicator */}
                        {post.status === 'approved' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        ) : post.status === 'pending_review' ? (
                          <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-zinc-600 shrink-0" />
                        )}
                      </div>

                      {/* Theme / Title */}
                      <div className="text-[11px] font-semibold text-zinc-200 line-clamp-2 leading-tight group-hover/card:text-amber-400 transition-colors mb-1">
                        {post.theme}
                      </div>

                      {/* Featured product badge if available */}
                      {post.featuredProduct && (
                        <div className="text-[10px] text-amber-400/90 truncate font-medium bg-amber-500/5 px-1 py-0.5 rounded border border-amber-500/10 mb-1">
                          🧋 {post.featuredProduct}
                        </div>
                      )}

                      {/* Platform Badges */}
                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
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

                      {/* Client Feedback Flag if requested */}
                      {post.clientFeedback?.comment && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded">
                          <MessageSquare className="w-2.5 h-2.5" />
                          <span className="truncate">Retouche demandée</span>
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
