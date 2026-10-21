export type RadarNiche = 'bubble_tea' | 'cafe' | 'restaurant';

export interface ViralOutlierVideo {
  id: string;
  workspaceId: string;
  competitorName: string;
  competitorHandle: string;
  competitorAvatar?: string;
  location?: string;
  category: RadarNiche | string;
  categoryLabel: string;
  platform: 'instagram' | 'tiktok';
  
  // URL de redirection directe vers la publication réelle
  videoUrl: string;
  
  // Visuel et durée
  videoThumbnail: string;
  duration?: string;
  
  // Période temporelle
  timeframe: '24h' | '48h' | '7d';
  timeAgo: string;
  crawledAt: string;
  
  // Contenu & Analyse
  hookText: string;
  postCaption?: string;
  whyItPerformed?: string;
  structureNote?: string;
  audioTrack?: string;
  
  // Déclinaison éditoriale recommandée
  adaptationStrategy: string;
  suggestedProduct?: string;
}

export interface RadarFilterState {
  timeframe: 'all' | '24h' | '48h' | '7d';
  category: 'all' | RadarNiche | string;
}
