'use client';

import React, { useState } from 'react';
import { usePostPilot } from '@/context/PostPilotContext';
import { Post, PostStatus } from '@/types/post';
import { getPlatformBadge, getStatusConfig } from '@/lib/utils';
import { 
  Plus, 
  GripVertical, 
  ArrowDown, 
  Check,
  RotateCcw,
  List,
  Grid
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { short: 'Lun', full: 'Lundi' },
  { short: 'Mar', full: 'Mardi' },
  { short: 'Mer', full: 'Mercredi' },
  { short: 'Jeu', full: 'Jeudi' },
  { short: 'Ven', full: 'Vendredi' },
  { short: 'Sam', full: 'Samedi' },
  { short: 'Dim', full: 'Dimanche' }
];

export default function MonthCalendarView() {
  const { filteredPosts, setSelectedPost, activeWorkspace, posts, reschedulePost, updatePostStatus, resetToOfficialOctoberCalendar } = usePostPilot();

  // Cycle rapide de statut en 1 clic directement sur la carte
  const handleQuickStatusCycle = (e: React.MouseEvent, post: Post) => {
    e.stopPropagation();
    const cycle: Record<PostStatus, PostStatus> = {
      draft: 'pending_review',
      pending_review: 'approved',
      approved: 'scheduled',
      scheduled: 'published',
      published: 'draft',
      changes_requested: 'pending_review',
    };
    const nextStatus = cycle[post.status] || 'scheduled';
    updatePostStatus(post.id, nextStatus);
    const nextConf = getStatusConfig(nextStatus);
    setToastMessage(`Statut : « ${post.theme.slice(0, 24)} » passé en ${nextConf.label}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // États pour le Drag & Drop
  const [draggingPostId, setDraggingPostId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [justMovedPostId, setJustMovedPostId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Détection dynamique de la date du jour (ex: 2026-10-21)
  const today = new Date();
  const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Mode d'affichage mobile : 'agenda' (liste chronologique lisible) ou 'grid' (grille condensée)
  const [mobileCalendarMode, setMobileCalendarMode] = useState<'agenda' | 'grid'>('agenda');
  const [selectedMobileDate, setSelectedMobileDate] = useState<string | null>(null);

  const totalDaysInMonth = 31;
  const startDayOffset = 3; // Jeudi 1er octobre 2026 (Lun=0, Mar=1, Mer=2, Jeu=3)

  // Bandeau swipeable mobile de tous les jours d'Octobre
  const daysShort = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
  const allDaysOfOctober = Array.from({ length: totalDaysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateObj = new Date(2026, 9, dayNum);
    const shortDay = daysShort[dateObj.getDay()];
    const dateStr = `2026-10-${String(dayNum).padStart(2, '0')}`;
    const dayPosts = filteredPosts.filter(p => p.scheduledDate === dateStr);
    return { dayNum, shortDay, dateStr, dayPosts };
  });

  const displayedMobilePosts = selectedMobileDate
    ? filteredPosts.filter(p => p.scheduledDate === selectedMobileDate)
    : [...filteredPosts].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

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
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const daysShort = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
    const dayOfWeek = daysShort[dateObj.getDay()];

    let week = 'S1';
    if (day <= 11) week = 'S1';
    else if (day <= 18) week = 'S2';
    else if (day <= 25) week = 'S3';
    else week = 'S4';

    const newPost: Post = {
      id: `post_${activeWorkspace.id}_manual_${Date.now()}`,
      workspaceId: activeWorkspace.id,
      week,
      scheduledDate: dateStr,
      dayOfWeek,
      time: '12:00',
      platforms: ['instagram', 'facebook'],
      objective: 'Notoriété',
      format: 'image',
      theme: 'Nouvelle publication',
      caption: 'Légende à rédiger...',
      featuredProduct: 'Bubble Tea Signature',
      cta: 'Commander au 05 96 93 50 50',
      status: 'draft',
      creativeBrief: 'Affiche carrée ou vidéo courte',
      mediaUrls: [],
      orderIndex: posts.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSelectedPost(newPost);
  };

  const handleDropOnDate = (dateStr: string, postIdToMove?: string) => {
    const targetPostId = postIdToMove || draggingPostId;
    if (!targetPostId || !dateStr) return;

    const post = posts.find((p) => p.id === targetPostId);
    if (!post) return;

    if (post.scheduledDate === dateStr) {
      setDraggingPostId(null);
      setDragOverDate(null);
      return;
    }

    reschedulePost(targetPostId, dateStr);
    setJustMovedPostId(targetPostId);

    const [,, dayNum] = dateStr.split('-');
    setToastMessage(`Publication « ${post.theme} » déplacée au ${parseInt(dayNum, 10)} octobre`);

    setTimeout(() => setJustMovedPostId(null), 2500);
    setTimeout(() => setToastMessage(null), 3500);

    setDraggingPostId(null);
    setDragOverDate(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-black p-2 sm:p-5 pb-20 md:pb-5 relative">
      
      {/* Toast de reprogrammation Drag & Drop */}
      {toastMessage && (
        <div className="absolute top-4 sm:top-7 left-1/2 -translate-x-1/2 z-50 bg-zinc-950 dark:bg-white text-white dark:text-black px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-3 duration-200">
          <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 📱 SECTION MOBILE (md:hidden) : Vue Agenda & Bandeau Swipeable */}
      {/* ============================================================ */}
      <div className="md:hidden flex-1 flex flex-col overflow-hidden space-y-2.5">
        
        {/* Barre supérieure mobile : Aujourd'hui + Mode toggle + Reset */}
        <div className="flex items-center justify-between gap-2 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-950 dark:bg-white text-white dark:text-black text-[11px] font-semibold shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Mer. 21 Octobre</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Toggle Liste / Grille */}
            <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-md">
              <button
                onClick={() => setMobileCalendarMode('agenda')}
                className={`p-1 rounded text-xs transition-all ${
                  mobileCalendarMode === 'agenda'
                    ? 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white shadow-xs font-bold'
                    : 'text-zinc-500'
                }`}
                title="Vue Liste Agenda"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMobileCalendarMode('grid')}
                className={`p-1 rounded text-xs transition-all ${
                  mobileCalendarMode === 'grid'
                    ? 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white shadow-xs font-bold'
                    : 'text-zinc-500'
                }`}
                title="Vue Grille"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={resetToOfficialOctoberCalendar}
              className="p-1 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Réinitialiser Octobre 2026"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
            </button>
          </div>
        </div>

        {mobileCalendarMode === 'agenda' ? (
          <>
            {/* Bandeau des jours du mois horizontal (Touch-friendly & Swipeable) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 shrink-0">
              <button
                onClick={() => setSelectedMobileDate(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                  selectedMobileDate === null
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                Tous les posts ({filteredPosts.length})
              </button>

              {allDaysOfOctober.map((dayItem) => {
                const isSelected = selectedMobileDate === dayItem.dateStr;
                const isDayToday = dayItem.dateStr === todayDateStr;
                const count = dayItem.dayPosts.length;
                return (
                  <button
                    key={dayItem.dateStr}
                    onClick={() => setSelectedMobileDate(isSelected ? null : dayItem.dateStr)}
                    className={`flex flex-col items-center justify-center min-w-[50px] py-1 px-1.5 rounded-lg border text-center transition-all shrink-0 ${
                      isSelected
                        ? 'border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-black shadow-xs font-semibold'
                        : isDayToday
                        ? 'border-zinc-950 dark:border-white bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <span className="text-[10px] font-mono uppercase">{dayItem.shortDay}</span>
                    <span className="text-xs font-bold font-mono">
                      {dayItem.dayNum < 10 ? `0${dayItem.dayNum}` : dayItem.dayNum}
                    </span>
                    <div className="flex items-center gap-0.5 mt-0.5 h-1.5">
                      {count > 0 && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-300 dark:bg-emerald-600' : 'bg-emerald-500'}`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feed chronologique des publications (Mobile Cards, touch target >= 48px) */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 pb-20">
              {displayedMobilePosts.length === 0 ? (
                <div className="p-8 text-center text-zinc-400 dark:text-zinc-600 space-y-2">
                  <p className="text-xs">Aucune publication pour cette date.</p>
                  {selectedMobileDate && (
                    <button
                      onClick={() => handleQuickAdd(selectedMobileDate)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter un post ce jour</span>
                    </button>
                  )}
                </div>
              ) : (
                displayedMobilePosts.map((post) => {
                  const statusConf = getStatusConfig(post.status);
                  return (
                    <div
                      key={`mobile-${post.id}`}
                      onClick={() => setSelectedPost(post)}
                      className={`p-3.5 rounded-xl border ${statusConf.borderAccent} bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2 active:scale-[0.99] transition-all cursor-pointer`}
                    >
                      {/* Top row: Date, time and status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400">
                          <span>{post.dayOfWeek} {post.scheduledDate.split('-')[2]} oct.</span>
                          {post.time && <span>• {post.time}</span>}
                          <span className="px-1.5 py-0.2 rounded border border-zinc-200 dark:border-zinc-800 text-[10px]">
                            {post.week}
                          </span>
                        </div>

                        {/* 1-Tap Status Badge Cycle */}
                        <button
                          type="button"
                          onClick={(e) => handleQuickStatusCycle(e, post)}
                          title={`Statut : ${statusConf.label}. Cliquer pour changer.`}
                          className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border transition-all ${statusConf.badgeClass} active:scale-95`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dotClass}`} />
                          <span>{statusConf.shortLabel}</span>
                        </button>
                      </div>

                      {/* Theme / Title */}
                      <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 leading-snug">
                        {post.theme}
                      </div>

                      {/* Product note */}
                      {post.featuredProduct && (
                        <div className="text-xs text-zinc-600 dark:text-zinc-300 font-mono truncate">
                          🧋 {post.featuredProduct}
                        </div>
                      )}

                      {/* Caption excerpt */}
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {post.caption}
                      </p>

                      {/* Bottom row: Formats, platforms & action */}
                      <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                            {post.format}
                          </span>
                          {post.platforms.map((plat) => {
                            const badge = getPlatformBadge(plat);
                            return (
                              <span
                                key={plat}
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                              >
                                {badge.name}
                              </span>
                            );
                          })}
                        </div>

                        <span className="text-xs text-zinc-500 font-medium">
                          Modifier →
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          /* Mobile Grid Mode (7 jours condensés avec sélection des cartes dessous) */
          <div className="flex-1 flex flex-col overflow-hidden space-y-2 pb-20">
            {/* Days Header */}
            <div className="grid grid-cols-7 gap-px bg-zinc-300 dark:bg-zinc-800 rounded-t-lg overflow-hidden border border-zinc-300 dark:border-zinc-800 text-center shrink-0">
              {DAYS_OF_WEEK.map((d) => (
                <div key={d.short} className="py-1 text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900">
                  {d.short}
                </div>
              ))}
            </div>

            {/* Grid Cells */}
            <div className="grid grid-cols-7 gap-px bg-zinc-300 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-800 rounded-b-lg shrink-0">
              {calendarCells.map((cell, idx) => {
                if (!cell.dayNumber || !cell.dateStr) {
                  return <div key={`empty-m-${idx}`} className="bg-zinc-100/50 dark:bg-zinc-950/50 h-10" />;
                }
                const dayPosts = filteredPosts.filter((p) => p.scheduledDate === cell.dateStr);
                const isSelected = selectedMobileDate === cell.dateStr;
                const isDayToday = cell.dateStr === todayDateStr;

                return (
                  <button
                    key={`m-cell-${cell.dateStr}`}
                    onClick={() => setSelectedMobileDate(isSelected ? null : cell.dateStr)}
                    className={`h-11 p-1 flex flex-col items-center justify-between text-center transition-colors ${
                      isSelected
                        ? 'bg-zinc-950 text-white dark:bg-white dark:text-black font-bold'
                        : isDayToday
                        ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950 dark:ring-white'
                        : 'bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <span className="text-[11px] font-mono">{cell.dayNumber}</span>
                    <div className="flex items-center gap-0.5">
                      {dayPosts.slice(0, 2).map((p) => {
                        const conf = getStatusConfig(p.status);
                        return <span key={p.id} className={`w-1.5 h-1.5 rounded-full ${conf.dotClass}`} />;
                      })}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Posts list under grid */}
            <div className="flex-1 overflow-y-auto space-y-2 pt-1">
              <div className="text-[11px] font-mono text-zinc-500 font-semibold px-1">
                {selectedMobileDate ? `Publications du ${selectedMobileDate.split('-')[2]} octobre :` : 'Toutes les publications :'}
              </div>
              {displayedMobilePosts.map((post) => {
                const conf = getStatusConfig(post.status);
                return (
                  <div
                    key={`mg-${post.id}`}
                    onClick={() => setSelectedPost(post)}
                    className={`p-2.5 rounded-lg border ${conf.borderAccent} bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs flex items-center justify-between cursor-pointer active:scale-[0.99]`}
                  >
                    <div>
                      <div className="font-semibold text-zinc-950 dark:text-zinc-100 line-clamp-1">{post.theme}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{post.dayOfWeek} • {post.format}</div>
                    </div>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${conf.badgeClass}`}>
                      {conf.shortLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 💻 SECTION DESKTOP (hidden md:flex) : Calendrier Grille Complet */}
      {/* ============================================================ */}
      <div className="hidden md:flex flex-col flex-1 overflow-hidden">
        
        {/* Calendar Context Bar */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
          
          {/* Left: Repère Aujourd'hui officiel */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950 dark:bg-white text-white dark:text-black font-semibold text-xs shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Aujourd&apos;hui : Mercredi 21 Octobre 2026</span>
            </div>
            <span className="text-zinc-500 font-mono text-[11px] hidden sm:inline">
              • Mois d&apos;Octobre (31 jours)
            </span>
          </div>

          {/* Center/Right: Sprints & Hint Drag and Drop & Reset */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
              <span className="px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">S1 : 5-11</span>
              <span className="px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">S2 : 12-18</span>
              <span className="px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold">S3 : 19-25 (En cours)</span>
              <span className="px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">S4 : 26-31</span>
            </div>

            <button
              onClick={resetToOfficialOctoberCalendar}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-[11px] transition-all cursor-pointer"
              title="Réinitialiser l'ensemble du calendrier d'Octobre (16 publications)"
            >
              <RotateCcw className="w-3 h-3 text-zinc-500" />
              <span className="hidden sm:inline">Réinitialiser Octobre</span>
            </button>

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 bg-white dark:bg-zinc-900 px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-800">
              <GripVertical className="w-3 h-3 text-zinc-400" />
              <span>Glisser-déposer pour reprogrammer</span>
            </div>
          </div>

        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-px bg-zinc-300 dark:bg-zinc-800 rounded-t-lg overflow-hidden border border-zinc-300 dark:border-zinc-800">
          {DAYS_OF_WEEK.map((d, idx) => (
            <div
              key={d.short}
              className={`py-2 px-3 text-center text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                idx >= 5 
                  ? 'text-zinc-500 bg-zinc-100 dark:bg-zinc-950' 
                  : 'text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900'
              }`}
            >
              <span>{d.full}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="flex-1 grid grid-cols-7 gap-px bg-zinc-300 dark:bg-zinc-800 border-b border-x border-zinc-300 dark:border-zinc-800 rounded-b-lg overflow-y-auto">
        {calendarCells.map((cell, index) => {
          if (!cell.dayNumber || !cell.dateStr) {
            return (
              <div
                key={`empty-${index}`}
                className="bg-zinc-100/50 dark:bg-[#070709]/50 p-2 min-h-[125px]"
              />
            );
          }

          const dayPosts = filteredPosts.filter(
            (p) => p.scheduledDate === cell.dateStr
          );

          const isWeekend = index % 7 >= 5;
          const isToday = cell.dateStr === todayDateStr;
          const isDragOver = dragOverDate === cell.dateStr;

          // Repère passé / futur
          const isPast = cell.dateStr < todayDateStr;

          return (
            <div
              key={cell.dateStr}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dragOverDate !== cell.dateStr) {
                  setDragOverDate(cell.dateStr);
                }
              }}
              onDragLeave={(e) => {
                if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                if (dragOverDate === cell.dateStr) {
                  setDragOverDate(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                const postId = e.dataTransfer.getData('text/plain') || draggingPostId;
                if (postId && cell.dateStr) {
                  handleDropOnDate(cell.dateStr, postId);
                }
              }}
              className={`p-2.5 min-h-[125px] flex flex-col transition-all duration-150 group relative select-none ${
                isDragOver
                  ? 'ring-2 ring-inset ring-zinc-950 dark:ring-white bg-zinc-100 dark:bg-zinc-800 z-10 scale-[1.01]'
                  : isToday
                  ? 'ring-2 ring-inset ring-zinc-950 dark:ring-white bg-zinc-100/80 dark:bg-zinc-900/90 z-5 shadow-xs'
                  : isWeekend
                  ? 'bg-zinc-50/70 dark:bg-[#060709]'
                  : isPast
                  ? 'bg-zinc-50/30 dark:bg-[#09090c]'
                  : 'bg-white dark:bg-[#0c0d10]'
              } hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-2">
                
                {/* Carré Jour / Indicateur Aujourd'hui */}
                {isToday ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-zinc-950 text-white dark:bg-white dark:text-black shadow-xs">
                      {cell.dayNumber < 10 ? `0${cell.dayNumber}` : cell.dayNumber}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-950 text-white dark:bg-white dark:text-black flex items-center gap-1 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Aujourd&apos;hui</span>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-xs font-mono font-bold px-1.5 py-0.2 rounded transition-colors ${
                        dayPosts.length > 0
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold'
                          : isPast
                          ? 'text-zinc-400 dark:text-zinc-600'
                          : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {cell.dayNumber < 10 ? `0${cell.dayNumber}` : cell.dayNumber}
                    </span>
                  </div>
                )}

                {/* Day Action: Post Count or Quick Add */}
                <div className="flex items-center gap-1">
                  {dayPosts.length > 0 ? (
                    <span className="text-[10px] font-mono text-zinc-400">
                      {dayPosts.length} post{dayPosts.length > 1 ? 's' : ''}
                    </span>
                  ) : (
                    cell.dateStr && (
                      <button
                        onClick={() => handleQuickAdd(cell.dateStr!)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer"
                        title="Ajouter une publication à cette date"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Drag-over drop cue inside cell */}
              {isDragOver && (
                <div className="mb-2 p-1 rounded border border-dashed border-zinc-950 dark:border-white bg-zinc-950/5 dark:bg-white/10 text-center text-[10px] font-mono font-bold text-zinc-950 dark:text-white flex items-center justify-center gap-1 animate-pulse">
                  <ArrowDown className="w-3 h-3" />
                  <span>Déposer le post ici ({cell.dayNumber} oct.)</span>
                </div>
              )}

              {/* Day Posts List (Draggable Cards) */}
              <div className="flex-1 space-y-1.5 overflow-y-auto pr-0.5">
                {dayPosts.map((post: Post) => {
                  const isBeingDragged = draggingPostId === post.id;
                  const isJustMoved = justMovedPostId === post.id;
                  const statusConf = getStatusConfig(post.status);

                  return (
                    <div
                      key={post.id}
                      draggable={true}
                      onDragStart={(e) => {
                        e.stopPropagation();
                        e.dataTransfer.setData('text/plain', post.id);
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggingPostId(post.id);
                      }}
                      onDragEnd={() => {
                        setDraggingPostId(null);
                        setDragOverDate(null);
                      }}
                      onClick={() => setSelectedPost(post)}
                      className={`p-2 rounded-md border cursor-grab active:cursor-grabbing transition-all shadow-xs group/card text-left ${statusConf.borderAccent} ${
                        isBeingDragged
                          ? 'opacity-30 scale-95 ring-2 ring-zinc-500 bg-zinc-200 dark:bg-zinc-800'
                          : isJustMoved
                          ? 'ring-2 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : `bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ${statusConf.cardBg}`
                      }`}
                    >
                      {/* Format, Time, Status & Drag Handle */}
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1">
                          <GripVertical className="w-3 h-3 text-zinc-400 opacity-40 group-hover/card:opacity-100 transition-opacity shrink-0" />
                          <span className="text-[10px] font-mono uppercase text-zinc-500 font-medium capitalize truncate max-w-[65px]">
                            {post.format}
                          </span>
                          {post.time && (
                            <span className="text-[9px] font-mono text-zinc-400">
                              • {post.time}
                            </span>
                          )}
                        </div>

                        {/* Status Label (Coloré & Interactif) */}
                        <button
                          type="button"
                          onClick={(e) => handleQuickStatusCycle(e, post)}
                          title={`Statut : ${statusConf.label}. Cliquer pour passer au statut suivant.`}
                          className={`inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded border transition-all cursor-pointer hover:opacity-85 active:scale-95 ${statusConf.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dotClass}`} />
                          <span>{statusConf.shortLabel}</span>
                        </button>
                      </div>

                      {/* Title */}
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover/card:underline mb-1">
                        {post.theme}
                      </div>

                      {/* Visual Media Thumbnail Preview */}
                      {post.mediaUrls && post.mediaUrls.length > 0 && (
                        <div className="w-full h-24 rounded-md overflow-hidden my-1.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 relative group-hover/card:scale-[1.01] transition-transform">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={post.mediaUrls[0]} alt={post.theme} className="w-full h-full object-cover" />
                          <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/75 text-white text-[8px] font-mono backdrop-blur-xs">
                            Visuel joint
                          </div>
                        </div>
                      )}

                      {/* Product note if available */}
                      {post.featuredProduct && (
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate font-mono">
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
  </div>
  );
}
