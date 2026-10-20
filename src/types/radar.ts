export type RadarCategory = 
  | 'demonstration' 
  | 'situation' 
  | 'avis' 
  | 'coulisses';

export interface ViralOutlierVideo {
  id: string;
  workspaceId: string;
  competitorName: string;
  competitorHandle: string;
  competitorAvatar: string;
  category: RadarCategory;
  categoryLabel: string;
  platform: 'instagram' | 'tiktok';
  
  // URL de redirection directe vers la vidéo réelle
  videoUrl: string;
  
  // Visuel et durée
  videoThumbnail: string;
  duration: string;
  
  // Métriques d'audience
  viewsCount: number;
  viewsFormatted: string;
  accountMedianViews: number;
  outlierMultiplier: number;
  timeAgo: string;
  crawledAt: string;
  
  // Analyse de performance
  hookText: string;
  whyItPerformed: string;
  structureNote: string;
  audioTrack?: string;
  
  // Déclinaison éditoriale recommandée
  adaptationStrategy: string;
  suggestedProduct?: string;
}

export interface RadarFilterState {
  timeframe: 'all' | '24h' | '48h' | '7d';
  category: 'all' | RadarCategory;
  platform: 'all' | 'instagram' | 'tiktok';
  minMultiplier: 'all' | '5x' | '8x';
}
