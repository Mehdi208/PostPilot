'use client';

import React from 'react';
import { usePostPilot } from '@/context/PostPilotContext';
import { 
  Sparkles, 
  TrendingUp, 
  Plus
} from 'lucide-react';

export default function InspirationRadar() {
  const { activeWorkspace, importPosts, setSelectedPost } = usePostPilot();

  // Exemples réels de benchmarks et idées inspirantes pour FruiThé (Abidjan) et Méhdi Traoré (LinkedIn)
  const fruitheBenchmarks = [
    {
      id: 'insp-1',
      source: 'Instagram Food Abidjan',
      handle: '@le_spot_boba_ci',
      format: 'Vidéo ASMR',
      hook: 'Ce bruit quand la paille perce l’opercule d’un Brown Sugar bien glacé... 🧋❄️',
      angle: 'Gros plan macro sur les glaçons, la paille et les perles qui montent. Zéro parole, juste le son brut.',
      potential: 'Fort taux de partage & envie immédiate',
      product: 'Brown Sugar (5 000 FCFA)',
    },
    {
      id: 'insp-2',
      source: 'TikTok Trend Abidjan',
      handle: '@yango_food_lovers',
      format: 'Reel Micro-Trottoir / Dégustation',
      hook: '« Donne-moi une boisson qui soigne le goumin du lundi » 😭',
      angle: 'Comédie complice avec le serveur FruiThé qui prépare le Nuage de Ube en mode remède magique.',
      potential: 'Viralité TikTok 100% ivoirienne',
      product: 'Nuage de Ube (4 000 FCFA)',
    },
    {
      id: 'insp-3',
      source: 'Facebook Débat Local',
      handle: 'Communauté Abidjan',
      format: 'Post Texte Engagé',
      hook: 'Il fait 34°C à Abidjan actuellement. C’est thé chaud ou boisson glacée avec perles ? Soyez honnêtes.',
      angle: 'Débat communautaire léger pour générer 150+ commentaires et orienter vers la commande WhatsApp.',
      potential: 'Algorithme Facebook favorisant les commentaires',
      product: 'Strawberry Fizz / Aurore d’Abidjan',
    },
  ];

  const handleConvertInspirationToPost = (item: typeof fruitheBenchmarks[0]) => {
    const newPost = {
      id: `post_${activeWorkspace.id}_insp_${Date.now()}`,
      workspaceId: activeWorkspace.id,
      week: 'S2',
      scheduledDate: '2026-10-15',
      dayOfWeek: 'Jeu.',
      time: '12:00',
      platforms: ['instagram', 'tiktok'] as ('instagram' | 'tiktok')[],
      objective: 'Viralité & Notoriété',
      format: 'video' as const,
      theme: item.hook,
      caption: `${item.hook}\n\n${item.angle}\n\n📍 Dispo à Riviera Bonoumin (Face Abidjan Mall)\n📲 Commande au 05 96 93 50 50`,
      featuredProduct: item.product,
      cta: 'Commander au 05 96 93 50 50',
      status: 'draft' as const,
      creativeBrief: `Inspiré de ${item.handle} : ${item.angle}`,
      mediaUrls: [],
      orderIndex: 99,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    importPosts([newPost]);
    setSelectedPost(newPost);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-zinc-100">
                Radar d&apos;Inspiration & Veille Concurrentielle
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Détectez les formats et hooks qui cartonnent à Abidjan et transformez-les en brouillons en 1 clic.
            </p>
          </div>
        </div>

        {/* Benchmarks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fruitheBenchmarks.map((b) => (
            <div
              key={b.id}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                    {b.format}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {b.source}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-zinc-200 text-xs leading-snug group-hover:text-amber-400 transition-colors">
                    {b.hook}
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">
                    {b.angle}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
                    <span>🧋 {b.product}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>{b.potential}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-zinc-800/80">
                <button
                  onClick={() => handleConvertInspirationToPost(b)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 rounded-lg text-xs font-semibold transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Convertir en Brouillon PostPilot</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Brand Voice Guideline Card */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
          <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
            <span>✨</span>
            <span>Rappel de l&apos;ADN de Marque FruiThé (Voice & Culture)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-zinc-400">
            <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/60">
              <span className="font-semibold text-amber-400 block mb-1">Expressions signature :</span>
              <p className="italic leading-relaxed">
                « C&apos;est doux deh ! », « Le remède contre le blues du lundi », « Deux types de personnes : ceux qui savent déjà et ceux qui regardent le menu 15 min 😭 »
              </p>
            </div>
            <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/60">
              <span className="font-semibold text-emerald-400 block mb-1">Canaux & CTA obligatoires :</span>
              <p className="leading-relaxed">
                Riviera Bonoumin (Face Abidjan Mall) • Commande WhatsApp au <strong>05 96 93 50 50</strong> • Livraison Yango Deli
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
