'use client';

import React, { useState } from 'react';
import { usePostPilot } from '@/context/PostPilotContext';
import { COMPETITIVE_RADAR_VIDEOS } from '@/lib/data/competitive-radar-data';
import { ViralOutlierVideo, RadarCategory } from '@/types/radar';
import { 
  Play, 
  ArrowUpRight, 
  X 
} from 'lucide-react';

export default function InspirationRadar() {
  const { activeWorkspace, importPosts, setSelectedPost } = usePostPilot();

  // Filtres épurés
  const [timeframe, setTimeframe] = useState<'all' | '24h' | '48h' | '7d'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | RadarCategory>('all');
  const [minMultiplier, setMinMultiplier] = useState<'all' | '5x' | '8x'>('all');
  const [selectedVideoForAnalysis, setSelectedVideoForAnalysis] = useState<ViralOutlierVideo | null>(null);

  const workspaceVideos = COMPETITIVE_RADAR_VIDEOS.filter(v => v.workspaceId === activeWorkspace.id);

  const filteredVideos = workspaceVideos.filter(v => {
    if (timeframe === '24h' && !v.timeAgo.includes('14h') && !v.timeAgo.includes('16h') && !v.timeAgo.includes('18h') && !v.timeAgo.includes('22h')) {
      return false;
    }
    if (timeframe === '48h' && v.timeAgo.includes('3 jours')) {
      return false;
    }
    if (selectedCategory !== 'all' && v.category !== selectedCategory) {
      return false;
    }
    if (minMultiplier === '5x' && v.outlierMultiplier < 5) return false;
    if (minMultiplier === '8x' && v.outlierMultiplier < 8) return false;
    return true;
  });

  const handleConvertOutlierToPost = (video: ViralOutlierVideo) => {
    const newPost = {
      id: `post_${activeWorkspace.id}_radar_${Date.now()}`,
      workspaceId: activeWorkspace.id,
      week: 'S2',
      scheduledDate: '2026-10-16',
      dayOfWeek: 'Ven.',
      time: '12:00',
      platforms: [video.platform] as ('instagram' | 'tiktok')[],
      objective: 'Notoriété & Performance',
      format: 'video' as const,
      theme: video.hookText,
      caption: `${video.hookText}\n\n${video.adaptationStrategy}\n\nRiviera Bonoumin (Face Abidjan Mall)\nContact : +225 05 96 93 50 50`,
      featuredProduct: video.suggestedProduct || 'Bubble Tea Signature',
      cta: 'Commander au 05 96 93 50 50',
      status: 'draft' as const,
      creativeBrief: `Référence ${video.competitorHandle} (${video.viewsFormatted} vues, ${video.outlierMultiplier}x médiane) :\n- Structure : ${video.structureNote}\n- Piste audio : ${video.audioTrack || 'Audio de référence'}\n- Angle : ${video.adaptationStrategy}`,
      mediaUrls: [video.videoThumbnail],
      orderIndex: 99,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    importPosts([newPost]);
    setSelectedPost(newPost);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-y-auto">
      
      {/* Top Header Strip: Ultra-minimalist */}
      <div className="border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-black/80 backdrop-blur-md px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 uppercase">
                Radar de Veille & Outliers
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                Veille active
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Sélection des formats vidéo ayant dépassé leur médiane de diffusion récente sur Instagram et TikTok.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 dark:text-zinc-400">
            <div>
              <span className="text-zinc-950 dark:text-zinc-100 font-semibold">{workspaceVideos.length}</span> vidéos indexées
            </div>
            <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div>
              Médiane moyenne : <span className="text-zinc-950 dark:text-zinc-100 font-semibold">8.7x</span>
            </div>
          </div>

        </div>

        {/* Clean Filter Controls */}
        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Format / Category Selector */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {[
              { id: 'all', label: 'Tous les formats' },
              { id: 'demonstration', label: 'Démonstration produit' },
              { id: 'situation', label: 'Mise en situation' },
              { id: 'avis', label: 'Témoignage & Débat' },
              { id: 'coulisses', label: 'Coulisses de préparation' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as typeof selectedCategory)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Right Sub-filters: Timeframe & Outlier threshold */}
          <div className="flex items-center gap-2">
            
            {/* Timeframe selector */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-md border border-zinc-200 dark:border-zinc-800">
              {(['all', '24h', '48h', '7d'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                    timeframe === t
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {t === 'all' ? 'Toutes' : t === '24h' ? '24h' : t === '48h' ? '48h' : '7j'}
                </button>
              ))}
            </div>

            {/* Multiplier selector */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-md border border-zinc-200 dark:border-zinc-800">
              {(['all', '5x', '8x'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMinMultiplier(m)}
                  className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                    minMultiplier === m
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {m === 'all' ? 'Tous' : `≥ ${m}`}
                </button>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* Main Grid: Smartphone Video Mockups */}
      <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
        
        {/* Grid of Mockups */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-zinc-50/70 dark:bg-[#0c0d10] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between transition-all duration-150 hover:border-zinc-400 dark:hover:border-zinc-600"
            >
              <div>
                
                {/* Smartphone Mockup Frame */}
                <div className="relative w-full aspect-[9/13] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-800 shadow-md mb-3.5 group">
                  
                  {/* Dynamic Island Notch Minimal */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-black rounded-full z-20 flex items-center justify-end px-1.5">
                    <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
                  </div>

                  {/* Poster Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={video.videoThumbnail}
                    alt={video.hookText}
                    className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-300"
                  />

                  {/* Gradient for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 z-10" />

                  {/* Top Bar inside Screen */}
                  <div className="absolute top-5 inset-x-3 flex items-center justify-between z-15">
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={video.competitorAvatar}
                        alt={video.competitorHandle}
                        className="w-3.5 h-3.5 rounded-full object-cover"
                      />
                      <span className="text-[11px] font-medium text-white truncate max-w-[120px]">
                        {video.competitorHandle}
                      </span>
                    </div>

                    <div className="bg-white text-black font-mono font-bold text-[10px] px-2 py-0.5 rounded shadow-xs">
                      {video.outlierMultiplier}x
                    </div>
                  </div>

                  {/* Center Play Button Overlay */}
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center z-15 cursor-pointer group/btn"
                    title="Ouvrir sur Instagram"
                  >
                    <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white group-hover/btn:scale-105 group-hover/btn:bg-white group-hover/btn:text-black transition-all">
                      <Play className="w-5 h-5 ml-0.5 fill-current" />
                    </div>
                  </a>

                  {/* Bottom Captions inside Screen */}
                  <div className="absolute bottom-3 inset-x-3 z-15 space-y-1.5">
                    <div className="bg-black/75 backdrop-blur-sm border border-white/10 p-2.5 rounded-lg text-white">
                      <p className="text-xs font-medium leading-snug line-clamp-2">
                        {video.hookText}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-300 font-mono px-1">
                      <span>{video.viewsFormatted} vues</span>
                      <span>(médiane : {Math.round(video.accountMedianViews / 1000)}K)</span>
                      <span>{video.duration}</span>
                    </div>
                  </div>

                </div>

                {/* Analysis Notes */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] uppercase font-mono font-semibold text-zinc-500 dark:text-zinc-400">
                      {video.categoryLabel}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {video.timeAgo}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <strong className="text-zinc-950 dark:text-zinc-100 block mb-0.5">Raison du pic :</strong>
                    {video.whyItPerformed}
                  </p>
                </div>

              </div>

              {/* Action Buttons: Clean & Direct */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                
                {/* 1. Direct Instagram/TikTok Link */}
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold text-xs transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  <span>Consulter sur {video.platform === 'instagram' ? 'Instagram' : 'TikTok'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>

                {/* 2. Secondary actions */}
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleConvertOutlierToPost(video)}
                    className="py-1.5 px-2.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium text-xs transition-all active:scale-[0.98]"
                  >
                    Créer le post
                  </button>

                  <button
                    onClick={() => setSelectedVideoForAnalysis(video)}
                    className="py-1.5 px-2.5 rounded-lg border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium text-xs transition-all active:scale-[0.98]"
                  >
                    Fiche détaillée
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Detail Modal */}
      {selectedVideoForAnalysis && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111215] border border-zinc-300 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-4 animate-in fade-in duration-100">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-100 uppercase tracking-tight">
                  Fiche de Décomposition Vidéo
                </h3>
                <div className="text-xs text-zinc-500 font-mono mt-0.5">
                  {selectedVideoForAnalysis.competitorHandle} • {selectedVideoForAnalysis.viewsFormatted} vues ({selectedVideoForAnalysis.outlierMultiplier}x)
                </div>
              </div>

              <button
                onClick={() => setSelectedVideoForAnalysis(null)}
                className="w-7 h-7 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                  Accroche (Premières secondes)
                </span>
                <div className="p-3 bg-zinc-50 dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium">
                  {selectedVideoForAnalysis.hookText}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                  Analyse de la rétention
                </span>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-black p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  {selectedVideoForAnalysis.whyItPerformed}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block mb-1">
                  Déclinaison pour FruiThé (Riviera Bonoumin)
                </span>
                <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  {selectedVideoForAnalysis.adaptationStrategy}
                </div>
              </div>

              {selectedVideoForAnalysis.suggestedProduct && (
                <div className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 dark:text-zinc-400">Produit suggéré :</span>
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
                className="px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5"
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
