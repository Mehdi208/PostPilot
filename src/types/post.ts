export type Platform = 'facebook' | 'instagram' | 'tiktok' | 'linkedin';

export type PostStatus = 
  | 'draft'               // Brouillon / En écriture
  | 'pending_review'     // Envoyé pour validation client
  | 'changes_requested'  // Retouche demandée par le client
  | 'approved'           // Validé par le client
  | 'scheduled'          // Programmé pour diffusion
  | 'published';         // Publié sur le réseau

export type PostFormat = 
  | 'text'
  | 'image'
  | 'video'
  | 'story'
  | 'carousel';

export interface ClientFeedback {
  approved: boolean;
  comment?: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  workspaceId: string;
  
  // 12 Colonnes réelles du Calendrier FruiThé
  week: string;                   // Ex: "S1", "S2", "S3", "S4"
  scheduledDate: string;          // Format YYYY-MM-DD
  dayOfWeek: string;              // Ex: "Lun.", "Mer.", "Ven.", "Sam."
  time?: string;                  // Ex: "11:30" ou "17:00"
  platforms: Platform[];          // Ex: ['facebook', 'instagram']
  objective: string;              // Ex: "Notoriété & Sensibilisation"
  format: PostFormat;             // Ex: 'text' | 'image' | 'video' | 'story'
  theme: string;                  // Ex: "Octobre Rose & Douceur" (Titre)
  caption: string;                // Ex: "De la force, de l'amour et beaucoup..."
  featuredProduct?: string;       // Ex: "Strawberry Matcha (4 000 FCFA)"
  cta: string;                    // Ex: "Commander sur WhatsApp"
  status: PostStatus;             // Ex: 'approved', 'draft', etc.
  creativeBrief: string;          // Ex: "Affiche photo épurée bi-goût..."
  
  // Médias uploadés (Canva / Photoshop / Photos réelles)
  mediaUrls: string[];
  
  // Studio Affiches & Prompts IA (ChatGPT / DALL-E / Midjourney)
  aiVisualPrompt?: string;          // Prompt complet et optimisé pour ChatGPT/DALL-E
  aiPromptSources?: string[];       // Liste des sources et matières premières à uploader à l'IA
  inspirationUrls?: string[];       // URLs des affiches d'inspiration de référence
  
  // Feedbacks client & retouches
  clientFeedback?: ClientFeedback;
  notes?: string;                 // Notes internes de régie CM
  
  // Métadonnées
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExcelImportResult {
  totalRows: number;
  importedPosts: Post[];
  errors: string[];
}
