export interface Workspace {
  id: string;                    // 'fruithe' | 'mehdi-traore'
  name: string;                  // "FruiThé Abidjan"
  shortCode: string;             // "FRT"
  description: string;           // "Restaurant & Bar à Bubble Tea — Riviera Bonoumin"
  category: 'restaurant_b2c' | 'personal_branding_b2b';
  clientName: string;            // "Gérante FruiThé"
  clientPhone: string;           // "+225 0596935050"
  accentColor: string;           // Code hexa ou classe Tailwind (ambre / rose / indigo)
  previewToken: string;          // Token de validation client sécurisé
  webhookUrl?: string;           // Webhook Make.com spécifique
  currency: string;              // "FCFA"
  defaultPlatforms: string[];
}

export const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: 'fruithe',
    name: 'FruiThé Abidjan',
    shortCode: 'FRT',
    description: 'Restaurant & Bar à Bubble Tea — Riviera Bonoumin (Face Abidjan Mall)',
    category: 'restaurant_b2c',
    clientName: 'Responsable FruiThé',
    clientPhone: '+225 0596935050',
    accentColor: '#F59E0B', // Ambre doré gourmand
    previewToken: 'fruithe-octobre-2026-auth-token-secured',
    currency: 'FCFA',
    defaultPlatforms: ['facebook', 'instagram', 'tiktok']
  },
  {
    id: 'mehdi-traore',
    name: 'Méhdi Traoré',
    shortCode: 'MT',
    description: 'Personal Branding LinkedIn — Stratégie de communication & B2B',
    category: 'personal_branding_b2b',
    clientName: 'Méhdi Traoré',
    clientPhone: '+225 0000000000',
    accentColor: '#6366F1', // Indigo B2B
    previewToken: 'mehdi-branding-auth-token-secured',
    currency: 'FCFA',
    defaultPlatforms: ['linkedin']
  }
];
