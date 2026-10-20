import * as XLSX from 'xlsx';
import { Post, PostFormat, PostStatus, Platform, ExcelImportResult } from '@/types/post';

/**
 * Normalise les chaînes de plateformes (ex: "Facebook / Instagram") en tableau de plateformes reconnues
 */
export function parsePlatforms(rawPlatform: string | undefined): Platform[] {
  if (!rawPlatform) return ['facebook'];
  const lower = rawPlatform.toLowerCase();
  const platforms: Platform[] = [];

  if (lower.includes('facebook') || lower.includes('fb')) platforms.push('facebook');
  if (lower.includes('instagram') || lower.includes('insta') || lower.includes('ig')) platforms.push('instagram');
  if (lower.includes('tiktok') || lower.includes('tt')) platforms.push('tiktok');
  if (lower.includes('linkedin') || lower.includes('in')) platforms.push('linkedin');

  return platforms.length > 0 ? platforms : ['facebook'];
}

/**
 * Mappe le libellé de format du fichier Excel vers un PostFormat typé
 */
export function mapFormat(rawFormat: string | undefined): PostFormat {
  if (!rawFormat) return 'text';
  const lower = rawFormat.toLowerCase();
  if (lower.includes('vidéo') || lower.includes('video') || lower.includes('reel') || lower.includes('tiktok')) return 'video';
  if (lower.includes('story')) return 'story';
  if (lower.includes('carrousel') || lower.includes('carousel')) return 'carousel';
  if (lower.includes('affiche') || lower.includes('photo') || lower.includes('image')) return 'image';
  return 'text';
}

/**
 * Mappe le statut du tableur (ex: "Fait", "Non fait", "À faire") vers le PostStatus de PostPilot
 */
export function mapStatus(rawStatus: string | undefined): PostStatus {
  if (!rawStatus) return 'draft';
  const clean = rawStatus.trim().toLowerCase();
  if (clean === 'fait' || clean === 'validé' || clean === 'valide' || clean === 'ok') return 'approved';
  if (clean.includes('attente') || clean.includes('en cours')) return 'pending_review';
  if (clean.includes('retouche') || clean.includes('modifier')) return 'changes_requested';
  if (clean.includes('publié') || clean.includes('publie')) return 'published';
  return 'draft';
}

/**
 * Formate la date Excel (nombre sériel ou chaîne ISO) en YYYY-MM-DD
 */
export function formatExcelDate(rawDate: unknown): string {
  if (!rawDate) return new Date().toISOString().split('T')[0];
  
  if (typeof rawDate === 'number') {
    // Conversion date sérielle Excel (base 1900)
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(excelEpoch.getTime() + rawDate * 86400000);
    return date.toISOString().split('T')[0];
  }

  if (rawDate instanceof Date) {
    return rawDate.toISOString().split('T')[0];
  }

  if (typeof rawDate === 'string') {
    // Nettoie si format "2026-10-05 00:00:00"
    const trimmed = rawDate.trim();
    if (trimmed.includes(' ')) {
      return trimmed.split(' ')[0];
    }
    if (trimmed.includes('T')) {
      return trimmed.split('T')[0];
    }
    return trimmed;
  }

  return new Date().toISOString().split('T')[0];
}

/**
 * Parse un buffer Excel (ArrayBuffer ou Buffer) et extrait les posts d'une feuille cible
 */
export function parseExcelWorkbook(
  data: ArrayBuffer | Uint8Array,
  targetSheetName?: string,
  workspaceId: string = 'fruithe'
): ExcelImportResult {
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });
  
  // Choix de la feuille : soit la cible demandée, soit "Octobre 2026", soit la première
  let sheetName = targetSheetName;
  if (!sheetName || !workbook.SheetNames.includes(sheetName)) {
    sheetName = workbook.SheetNames.includes('Octobre 2026') 
      ? 'Octobre 2026' 
      : workbook.SheetNames[workbook.SheetNames.length - 1]; // La plus récente
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    return {
      totalRows: 0,
      importedPosts: [],
      errors: [`La feuille "${sheetName}" n'a pas été trouvée dans le classeur.`],
    };
  }

  // Conversion en tableau de tableaux (lignes brutes)
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  if (rows.length < 2) {
    return {
      totalRows: 0,
      importedPosts: [],
      errors: ['Le fichier ne contient pas assez de données.'],
    };
  }

  // Détection des en-têtes (Ligne 0)
  const headers = (rows[0] as unknown[]).map(h => String(h || '').trim());
  
  // Indexation dynamique des 12 colonnes
  const colIndex = {
    week: headers.findIndex(h => /semaine/i.test(h)),
    date: headers.findIndex(h => /date/i.test(h)),
    day: headers.findIndex(h => /jour/i.test(h)),
    platform: headers.findIndex(h => /plateforme|r[ée]seau/i.test(h)),
    objective: headers.findIndex(h => /objectif/i.test(h)),
    format: headers.findIndex(h => /format/i.test(h)),
    theme: headers.findIndex(h => /th[èe]me|titre/i.test(h)),
    caption: headers.findIndex(h => /contenu|d[ée]tail|texte/i.test(h)),
    product: headers.findIndex(h => /boisson|produit|plat/i.test(h)),
    cta: headers.findIndex(h => /cta|action/i.test(h)),
    status: headers.findIndex(h => /statut/i.test(h)),
    creative: headers.findIndex(h => /cr[ée]ative|visuel/i.test(h)),
  };

  const importedPosts: Post[] = [];
  const errors: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    // Récupération sécurisée des cellules
    const getCell = (idx: number): string => {
      if (idx === -1 || row[idx] === undefined || row[idx] === null) return '';
      return String(row[idx]).trim();
    };

    const rawDate = colIndex.date !== -1 ? row[colIndex.date] : '';
    const scheduledDate = formatExcelDate(rawDate);
    const theme = getCell(colIndex.theme) || `Publication #${i}`;
    const caption = getCell(colIndex.caption);

    // Si la ligne n'a ni date ni texte ni thème, on l'ignore (ligne vide)
    if (!scheduledDate && !caption && !theme) continue;

    const rawStatus = getCell(colIndex.status);
    const rawPlatform = getCell(colIndex.platform);
    const rawFormat = getCell(colIndex.format);
    const rawWeek = getCell(colIndex.week) || `S${Math.min(5, Math.ceil(i / 4))}`;
    const rawDay = getCell(colIndex.day) || 'Lun.';
    const rawProduct = getCell(colIndex.product);
    const rawCTA = getCell(colIndex.cta);
    const rawCreative = getCell(colIndex.creative);
    const rawNotes = row[12] ? String(row[12]).trim() : undefined;

    const post: Post = {
      id: `post_${workspaceId}_${scheduledDate}_${i}`,
      workspaceId,
      week: rawWeek,
      scheduledDate,
      dayOfWeek: rawDay,
      time: '11:30', // Heure idéale par défaut pour FruiThé
      platforms: parsePlatforms(rawPlatform),
      objective: getCell(colIndex.objective) || 'Engagement & Visibilité',
      format: mapFormat(rawFormat),
      theme,
      caption: caption || 'Légende en cours de rédaction...',
      featuredProduct: rawProduct || undefined,
      cta: rawCTA || 'Commander au 05 96 93 50 50',
      status: mapStatus(rawStatus),
      creativeBrief: rawCreative || 'Visuel Canva / Photo produit',
      mediaUrls: [],
      notes: rawNotes,
      orderIndex: i,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    importedPosts.push(post);
  }

  return {
    totalRows: rows.length - 1,
    importedPosts,
    errors,
  };
}
