'use client';

import React, { useState } from 'react';
import { usePostPilot } from '@/context/PostPilotContext';
import { COMPETITIVE_RADAR_VIDEOS } from '@/lib/data/competitive-radar-data';
import { ViralOutlierVideo } from '@/types/radar';
import { 
  Flame, 
  ExternalLink, 
  Sparkles, 
  Play, 
  Clock, 
  Eye, 
  Plus, 
  Volume2, 
  ChevronRight, 
  ShieldCheck, 
  X 
} from 'lucide-react';

export default function InspirationRadar() {
  const { activeWorkspace, importPosts, setSelectedPost } = usePostPilot();

  // Filtres
  const [timeframe, setTimeframe] = useState<'24h' | '48h' | '7d' | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [crawlFrequency, setCrawlFrequency] = useState<'24h' | '48h' | 'weekly'>('24h');
  const [selectedVideoForAnalysis, setSelectedVideoForAnalysis] = useState<ViralOutlierVideo | null>(null);

  // Vidéos filtrées par workspace et critères
  const workspaceVideos = COMPETITIVE_RADAR_VIDEOS.filter(v => v.workspaceId === activeWorkspace.id);

  const filteredVideos = workspaceVideos.filter(v => {
    if (timeframe === '24h' && !v.timeAgo.includes('14h') && !v.timeAgo.includes('16h') && !v.timeAgo.includes('18h') && !v.timeAgo.includes('22h')) {
      return false;
    }
    if (timeframe === '48h' && v.timeAgo.includes('3 jours')) {
      return false;
    }
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'bubble_tea' && v.niche !== 'bubble_tea') return false;
      if (selectedCategory === 'food_resto' && v.niche !== 'food_resto') return false;
      if (selectedCategory === 'asmr' && !v.secretFormula.toLowerCase().includes('asmr')) return false;
      if (selectedCategory === 'humour' && !v.secretFormula.toLowerCase().includes('humour') && !v.secretFormula.toLowerCase().includes('autodérision')) return false;
    }
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
      objective: 'Viralité & Notoriété Outlier',
      format: 'video' as const,
      theme: video.hookText.replace(/[«»]/g, ''),
      caption: `${video.hookText}\n\n👉 ${video.angleToAdapt}\n\n📍 Rendez-vous à Riviera Bonoumin (Face Abidjan Mall)\n📲 Commande & livraison WhatsApp : 05 96 93 50 50`,
      featuredProduct: video.suggestedProduct || 'Bubble Tea Signature',
      cta: 'Commander au 05 96 93 50 50',
      status: 'draft' as const,
      creativeBrief: `Inspiré de l'outlier ${video.competitorHandle} (${video.viewsFormatted} vues, ${video.outlierMultiplier}x) :\n- Formule : ${video.secretFormula}\n- Audio : ${video.audioTrendingTitle || 'Audio tendance'}\n- Angle vidéo : ${video.angleToAdapt}`,
      mediaUrls: [video.videoThumbnail],
      orderIndex: 99,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    importPosts([newPost]);
    setSelectedPost(newPost);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090a0f] text-zinc-100 overflow-y-auto">
      {/* Top Banner: Status & Stats Bar */}
      <div className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <h2 className="text-sm font-bold tracking-tight text-zinc-100 uppercase flex items-center gap-2">
                <span>Radar de Veille & Outliers Viraux</span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Veille {crawlFrequency} Active
                </span>
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Surveillance continue des vidéos qui ont sur-performé leur moyenne chez vos concurrents directs à Abidjan & dans le monde.
            </p>
          </div>

          {/* Quick Frequency & Token Optim Bar */}
          <div className="flex items-center gap-2.5 bg-zinc-900/90 border border-zinc-800 p-1.5 rounded-xl shrink-0">
            <span className="text-[11px] font-medium text-zinc-400 px-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Fréquence du crawl :</span>
            </span>
            <div className="flex items-center gap-1">
              {(['24h', '48h', 'weekly'] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setCrawlFrequency(freq)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    crawlFrequency === freq
                      ? 'bg-amber-500 text-black font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  {freq === '24h' ? '24h (Max réactivité)' : freq === '48h' ? '48h (Éco-tokens)' : '7j'}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Filter Pills */}
        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Timeframe selector */}
          <div className="flex items-center gap-1.5 bg-zinc-900/60 p-1 rounded-lg border border-zinc-800">
            <span className="text-zinc-500 text-[11px] px-2 font-medium">Période :</span>
            {(['all', '24h', '48h', '7d'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  timeframe === t
                    ? 'bg-zinc-800 text-white font-semibold border border-zinc-700/80 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t === 'all' ? 'Toutes' : t === '24h' ? '⚡ Dernières 24h' : t === '48h' ? 'Dernières 48h' : '7 jours'}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                selectedCategory === 'all'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Tous ({workspaceVideos.length})
            </button>
            <button
              onClick={() => setSelectedCategory('bubble_tea')}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                selectedCategory === 'bubble_tea'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🧋 Bubble Tea
            </button>
            <button
              onClick={() => setSelectedCategory('asmr')}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                selectedCategory === 'asmr'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🔊 ASMR & Texture
            </button>
            <button
              onClick={() => setSelectedCategory('food_resto')}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                selectedCategory === 'food_resto'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🍗 Food & Combos
            </button>
            <button
              onClick={() => setSelectedCategory('humour')}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                selectedCategory === 'humour'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🇨🇮 Humour & Nouchi
            </button>
          </div>

        </div>
      </div>

      {/* Main Grid: Smartphone Video Mockups */}
      <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
        
        {/* Intro KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-zinc-400 font-medium">Sur-performance moy.</div>
              <div className="text-lg font-bold text-zinc-100 font-mono tracking-tight">+8.7x Médiane</div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-zinc-400 font-medium">Vues captées (24-48h)</div>
              <div className="text-lg font-bold text-zinc-100 font-mono tracking-tight">2.64M Vues</div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-zinc-400 font-medium">Comptes analysés</div>
              <div className="text-lg font-bold text-zinc-100 font-mono tracking-tight">8 Spots Niche</div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-zinc-400 font-medium">Angles prêts à tourner</div>
              <div className="text-lg font-bold text-zinc-100 font-mono tracking-tight">100% Adaptables</div>
            </div>
          </div>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700/80 rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 group shadow-lg hover:shadow-2xl"
            >
              {/* Smartphone Mockup Body */}
              <div>
                
                {/* Smartphone Container */}
                <div className="relative w-full aspect-[9/14] bg-black rounded-2xl overflow-hidden border-2 border-zinc-800 shadow-2xl mb-4 group-hover:border-amber-500/30 transition-colors">
                  
                  {/* Smartphone Dynamic Island Notch */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-black/90 border border-white/10 rounded-full z-20 flex items-center justify-end px-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/70"></div>
                  </div>

                  {/* Video Thumbnail Background */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={video.videoThumbnail}
                    alt={video.hookText}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradient Overlay for Readable Text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/60 z-10"></div>

                  {/* Top Bar: Competitor Info & Outlier Badge */}
                  <div className="absolute top-7 inset-x-3.5 flex items-center justify-between z-15">
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={video.competitorAvatar}
                        alt={video.competitorHandle}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span className="text-[11px] font-semibold text-white tracking-tight truncate max-w-[110px]">
                        {video.competitorHandle}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-amber-500/90 text-black px-2.5 py-1 rounded-full font-bold text-[11px] shadow-sm">
                      <Flame className="w-3 h-3 fill-black" />
                      <span>{video.outlierMultiplier}x Outlier</span>
                    </div>
                  </div>

                  {/* Center Play Button Overlay */}
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center z-15 group/play cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl group-hover/play:scale-110 group-hover/play:bg-amber-500 group-hover/play:text-black group-hover/play:border-amber-400 transition-all duration-200">
                      <Play className="w-6 h-6 ml-0.5 fill-current" />
                    </div>
                  </a>

                  {/* Bottom Stats & Duration inside phone screen */}
                  <div className="absolute bottom-3 inset-x-3.5 z-15 space-y-2">
                    
                    {/* Hook Text Card */}
                    <div className="bg-zinc-950/80 backdrop-blur-md border border-white/10 p-2.5 rounded-xl">
                      <div className="text-[10px] font-semibold tracking-wider uppercase text-amber-400 mb-0.5">
                        Hook vérifié ({video.timeAgo})
                      </div>
                      <p className="text-xs font-medium text-white line-clamp-2 leading-snug">
                        {video.hookText}
                      </p>
                    </div>

                    {/* Stats strip */}
                    <div className="flex items-center justify-between text-[11px] text-zinc-300 px-1">
                      <div className="flex items-center gap-1.5 font-mono font-semibold text-emerald-400">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{video.viewsFormatted} vues</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        (médiane: {Math.round(video.accountMedianViews / 1000)}K)
                      </div>
                      <div className="text-[10px] bg-black/60 px-2 py-0.5 rounded border border-white/10 font-mono">
                        {video.duration}
                      </div>
                    </div>

                  </div>

                </div>

                {/* Performance Analysis & Why it Worked */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      Formule décortiquée
                    </span>
                    <span className="text-[11px] text-zinc-300 font-medium bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/60">
                      {video.competitorName}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/70">
                    <span className="text-amber-400 font-semibold block mb-1">
                      ⚡ Pourquoi l&apos;algorithme l&apos;a propulsé :
                    </span>
                    {video.whyItPerformed}
                  </p>

                  {video.audioTrendingTitle && (
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-zinc-800/80">
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{video.audioTrendingTitle}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-3 border-t border-zinc-800/80">
                
                {/* 1. Direct Instagram/TikTok Link */}
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600/20 via-purple-600/20 to-amber-600/20 hover:from-pink-600/30 hover:via-purple-600/30 hover:to-amber-600/30 border border-pink-500/30 hover:border-pink-500/60 text-white font-semibold text-xs transition-all active:scale-[0.97]"
                >
                  <span>Voir la vidéo sur {video.platform === 'instagram' ? 'Instagram' : 'TikTok'}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-pink-400" />
                </a>

                <div className="grid grid-cols-2 gap-2">
                  {/* 2. Convert to Calendar Post */}
                  <button
                    onClick={() => handleConvertOutlierToPost(video)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all active:scale-[0.96] shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adapter au post</span>
                  </button>

                  {/* 3. Deep Analysis Modal */}
                  <button
                    onClick={() => setSelectedVideoForAnalysis(video)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs transition-all active:scale-[0.96] border border-zinc-700/60"
                  >
                    <span>Script détaillé</span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Reverse-Engineering Detail Modal */}
      {selectedVideoForAnalysis && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Formule de Tournage & Reverse-Engineering
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span>{selectedVideoForAnalysis.competitorHandle}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-mono font-semibold">
                      {selectedVideoForAnalysis.viewsFormatted} vues ({selectedVideoForAnalysis.outlierMultiplier}x)
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedVideoForAnalysis(null)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 text-xs">
              
              <div>
                <span className="text-[11px] font-semibold uppercase text-zinc-400 block mb-1">
                  1. Le Hook des 3 Premières Secondes (Ce qui stoppe le doigt)
                </span>
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-200 font-medium">
                  {selectedVideoForAnalysis.hookText}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase text-zinc-400 block mb-1">
                  2. Pourquoi ça a explosé sur l&apos;algorithme
                </span>
                <p className="text-zinc-300 leading-relaxed bg-zinc-950/80 p-3 rounded-xl border border-zinc-800">
                  {selectedVideoForAnalysis.whyItPerformed}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase text-amber-400 block mb-1">
                  3. Plan d&apos;adaptation pour FruiThé (Riviera Bonoumin)
                </span>
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-200 leading-relaxed">
                  {selectedVideoForAnalysis.angleToAdapt}
                </div>
              </div>

              {selectedVideoForAnalysis.suggestedProduct && (
                <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                  <span className="text-zinc-400">Boisson / Produit vedette suggéré :</span>
                  <span className="font-bold text-amber-400 font-mono">
                    {selectedVideoForAnalysis.suggestedProduct}
                  </span>
                </div>
              )}

            </div>

            {/* Modal Footer Actions */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
              <a
                href={selectedVideoForAnalysis.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs flex items-center gap-2 transition-all"
              >
                <span>Ouvrir sur Instagram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  handleConvertOutlierToPost(selectedVideoForAnalysis);
                  setSelectedVideoForAnalysis(null);
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 transition-all active:scale-[0.96]"
              >
                <Plus className="w-4 h-4" />
                <span>Créer le post dans le calendrier</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
