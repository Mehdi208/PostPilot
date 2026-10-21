'use client';

import React, { useState } from 'react';
import { usePostPilot } from '@/context/PostPilotContext';
import { COMPETITIVE_RADAR_VIDEOS } from '@/lib/data/competitive-radar-data';
import { ViralOutlierVideo } from '@/types/radar';
import { 
  Play, 
  ArrowUpRight, 
  X,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';

export default function InspirationRadar() {
  const { activeWorkspace, importPosts, setSelectedPost, setActiveView } = usePostPilot();

  // Filtre épuré : Période temporelle (24h, 48h, 7 jours)
  const [timeframe, setTimeframe] = useState<'all' | '24h' | '48h' | '7d'>('all');
  const [selectedNiche, setSelectedNiche] = useState<'all' | 'bubble_tea' | 'cafe' | 'restaurant'>('all');
  const [selectedVideoForAnalysis, setSelectedVideoForAnalysis] = useState<ViralOutlierVideo | null>(null);

  const filteredVideos = COMPETITIVE_RADAR_VIDEOS.filter(v => {
    // Filtre période
    if (timeframe !== 'all' && v.timeframe !== timeframe) {
      if (timeframe === '48h' && v.timeframe === '24h') {
        // 48h inclut les dernières 24h
      } else if (timeframe === '7d') {
        // 7j inclut tout
      } else {
        return false;
      }
    }
    // Filtre niche
    if (selectedNiche !== 'all' && v.category !== selectedNiche) {
      return false;
    }
    return true;
  });

  const handleConvertOutlierToPost = (video: ViralOutlierVideo) => {
    const newPost = {
      id: `post_${activeWorkspace.id}_radar_${Date.now()}`,
      workspaceId: activeWorkspace.id,
      week: 'S3',
      scheduledDate: '2026-10-21',
      dayOfWeek: 'Mer.',
      time: '12:00',
      platforms: [video.platform] as ('instagram' | 'tiktok')[],
      objective: 'Inspiration Concurrentielle',
      format: (video.duration ? 'video' : 'image') as 'video' | 'image',
      theme: video.hookText,
      caption: `${video.hookText}\n\n${video.adaptationStrategy}\n\n📍 FruiThé Riviera Bonoumin (Face Abidjan Mall)\n📲 WhatsApp : 05 96 93 50 50`,
      featuredProduct: video.suggestedProduct || 'Bubble Tea Signature',
      cta: 'Commander au 05 96 93 50 50',
      status: 'draft' as const,
      creativeBrief: `Inspiré de ${video.competitorHandle} (${video.competitorName}) :\n- Publication : ${video.videoUrl}\n- Emplacement : ${video.location}\n- Angle : ${video.adaptationStrategy}`,
      mediaUrls: [video.videoThumbnail],
      orderIndex: 99,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    importPosts([newPost]);
    setSelectedPost(newPost);
    setActiveView('calendar');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-y-auto">
      
      {/* Top Header Strip: Ultra-épuré & Professionnel */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-black/90 backdrop-blur-md px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 uppercase">
                Veille Concurrentielle & Derniers Posts
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                Abidjan & Niche Food
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Recensement direct des dernières publications Instagram dans la niche des cafés, bubble teas et restaurants à Abidjan.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-xs font-mono text-zinc-500 dark:text-zinc-400">
            <div>
              <span className="text-zinc-950 dark:text-zinc-100 font-semibold">{filteredVideos.length}</span> publications vérifiées
            </div>
            <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Screenshots réels
            </div>
          </div>

        </div>

        {/* Minimalist Controls: Période & Niche */}
        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Périodes : 24h / 48h / 7j */}
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-400 px-2 font-medium">Période :</span>
            {[
              { id: 'all', label: 'Toutes les publications' },
              { id: '24h', label: 'Dernières 24 heures' },
              { id: '48h', label: 'Dernières 48 heures' },
              { id: '7d', label: '7 derniers jours' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setTimeframe(p.id as typeof timeframe)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  timeframe === p.id
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs font-semibold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Niches : Bubble Tea, Cafés, Restaurants */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
            {[
              { id: 'all', label: 'Toutes les niches' },
              { id: 'bubble_tea', label: '🧋 Bubble Tea' },
              { id: 'cafe', label: '☕ Cafés & Coffee' },
              { id: 'restaurant', label: '🍽️ Restaurants' },
            ].map((n) => (
              <button
                key={n.id}
                onClick={() => setSelectedNiche(n.id as typeof selectedNiche)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedNiche === n.id
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs font-semibold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Main Grid: Clean Cards with True Screenshots */}
      <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/90 rounded-2xl p-4 flex flex-col justify-between transition-all duration-150 hover:border-zinc-400 dark:hover:border-zinc-600 shadow-xs"
            >
              <div>
                
                {/* Header Card: Compte & Localisation */}
                <div className="flex items-center justify-between mb-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                      {video.competitorName}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                      <span>{video.competitorHandle}</span>
                      {video.location && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 truncate max-w-[140px]">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            {video.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Time Badge */}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium shrink-0 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {video.timeAgo}
                  </span>
                </div>

                {/* Smartphone Preview Mockup */}
                <div className="relative w-full aspect-[9/12] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner mb-3 group">
                  
                  {/* Real Post Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={video.videoThumbnail}
                    alt={video.hookText}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />

                  {/* Gentle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

                  {/* Overlay tag: Niche */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-white border border-white/10 font-medium">
                      {video.categoryLabel}
                    </span>
                  </div>

                  {/* Center Play Button with direct link */}
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center z-10 group/play"
                    title="Ouvrir la publication sur Instagram"
                  >
                    <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/40 flex items-center justify-center text-white group-hover/play:scale-110 group-hover/play:bg-white group-hover/play:text-black transition-all shadow-lg">
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </div>
                  </a>

                  {/* Bottom Text inside mockup */}
                  <div className="absolute bottom-3 inset-x-3 z-10">
                    <p className="text-[11px] font-medium text-white leading-snug line-clamp-2 bg-black/60 backdrop-blur-sm p-2 rounded-lg border border-white/10">
                      {video.hookText}
                    </p>
                  </div>
                </div>

                {/* Strategy Insight */}
                <div className="space-y-1.5 mb-3">
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 leading-relaxed">
                    <strong className="text-zinc-900 dark:text-zinc-100 block mb-0.5 text-[10px] uppercase font-mono tracking-wider">
                      Idée d&apos;adaptation FruiThé :
                    </strong>
                    {video.adaptationStrategy}
                  </div>
                </div>

              </div>

              {/* Action Buttons: Ultra-direct */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                
                {/* 1. Direct Instagram Button */}
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-black font-semibold text-xs transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  <span>Ouvrir sur Instagram</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>

                {/* 2. Secondary actions */}
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleConvertOutlierToPost(video)}
                    className="py-1.5 px-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-zinc-500" />
                    <span>Créer le post</span>
                  </button>

                  <button
                    onClick={() => setSelectedVideoForAnalysis(video)}
                    className="py-1.5 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium text-xs transition-all active:scale-[0.98]"
                  >
                    Détails
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Detail Modal */}
      {selectedVideoForAnalysis && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-4 animate-in fade-in duration-100">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-100 uppercase tracking-tight">
                  {selectedVideoForAnalysis.competitorName}
                </h3>
                <div className="text-xs text-zinc-500 font-mono mt-0.5">
                  {selectedVideoForAnalysis.competitorHandle} • {selectedVideoForAnalysis.location}
                </div>
              </div>

              <button
                onClick={() => setSelectedVideoForAnalysis(null)}
                className="w-7 h-7 rounded-md bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                  Accroche & Sujet
                </span>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium">
                  {selectedVideoForAnalysis.hookText}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                  Pourquoi ce contenu a fonctionné
                </span>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  {selectedVideoForAnalysis.whyItPerformed}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                  Déclinaison recommandée pour FruiThé Riviera Bonoumin
                </span>
                <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 leading-relaxed font-medium">
                  {selectedVideoForAnalysis.adaptationStrategy}
                </div>
              </div>

              {selectedVideoForAnalysis.suggestedProduct && (
                <div className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 dark:text-zinc-400">Boisson / Plat suggéré :</span>
                  <span className="font-semibold text-zinc-950 dark:text-zinc-100">
                    {selectedVideoForAnalysis.suggestedProduct}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
              <a
                href={selectedVideoForAnalysis.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5"
              >
                <span>Ouvrir sur Instagram</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  handleConvertOutlierToPost(selectedVideoForAnalysis);
                  setSelectedVideoForAnalysis(null);
                }}
                className="px-4 py-2 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 transition-all active:scale-[0.98]"
              >
                Insérer dans le calendrier
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
