export interface ViralOutlierVideo {
  id: string;
  workspaceId: string;
  competitorName: string;
  competitorHandle: string;
  competitorAvatar: string;
  niche: 'bubble_tea' | 'food_resto' | 'personal_branding' | 'agency_cm';
  platform: 'instagram' | 'tiktok';
  
  // URL vers la vraie vidéo Instagram ou TikTok
  videoUrl: string;
  
  // Visuel du mockup vidéo (affiche / poster haute qualité)
  videoThumbnail: string;
  duration: string; // Ex: "0:24", "0:38"
  
  // Statistiques réelles observées
  viewsCount: number;          // Ex: 245000
  viewsFormatted: string;      // Ex: "245K"
  accountMedianViews: number;  // Ex: 32000 (médiane normale du compte)
  outlierMultiplier: number;   // Ex: 7.6 (views / median)
  timeAgo: string;             // Ex: "Il y a 18h", "Il y a 36h", "Hier à 14h"
  crawledAt: string;           // ISO date
  
  // Analyse décortiquée par le radar (Reverse-Engineering)
  hookText: string;            // Le hook visuel ou parlé verbatim
  whyItPerformed: string;      // Pourquoi l'algorithme et les gens ont réagi
  secretFormula: string;       // Formule psychologique (ex: "Contraste + Curiosité + Food-porn")
  audioTrendingTitle?: string; // Nom de l'audio tendance
  
  // Action tactique recommandée
  angleToAdapt: string;        // Comment Méhdi peut l'adapter directement pour FruiThé ou son profil
  suggestedProduct?: string;   // Ex: "Brown Sugar Boba", "Burger BBL Combo"
}

export interface RadarFilterState {
  timeframe: '24h' | '48h' | '7d' | 'all';
  category: 'all' | 'food_boba' | 'asmr' | 'humour_nouchi' | 'debat' | 'b2b';
  platform: 'all' | 'instagram' | 'tiktok';
  minMultiplier: number; // Ex: 3 for 3x
}
