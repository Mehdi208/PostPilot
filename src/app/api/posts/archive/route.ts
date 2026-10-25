import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Post } from '@/types/post';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9]+/g, '-')     // Remplace les caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, '')         // Supprime les tirets de début et fin
    .slice(0, 40);                   // Limite la longueur
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const post: Post = body.post;

    if (!post || !post.id) {
      return NextResponse.json({ success: false, error: 'Données de la publication manquantes' }, { status: 400 });
    }

    const safeTitle = slugify(post.theme || post.id);
    const folderName = `${post.scheduledDate || 'sans-date'}_${safeTitle}`;
    
    // Chemin du dossier d'archive sur la machine : PostPilot/archives/publications/<folderName>
    const archiveBaseDir = path.join(process.cwd(), 'archives', 'publications');
    const postArchiveDir = path.join(archiveBaseDir, folderName);

    if (!fs.existsSync(postArchiveDir)) {
      fs.mkdirSync(postArchiveDir, { recursive: true });
    }

    // 1. Fichier texte de la publication : publication.txt
    const publicationTextContent = `=======================================================
POSTPILOT - ARCHIVE DE PUBLICATION OFFICIELLE
=======================================================

Date de programmation : ${post.scheduledDate} (${post.dayOfWeek || ''})
Heure                 : ${post.time || 'Non spécifiée'}
Statut                : PUBLIÉ EN LIGNE
Espace de travail     : ${post.workspaceId}
Réseaux cibles        : ${(post.platforms || []).join(', ').toUpperCase()}
Format                : ${post.format.toUpperCase()}
Semaine               : ${post.week || 'S/O'}
Objectif              : ${post.objective || 'Non spécifié'}

-------------------------------------------------------
THÈME / TITRE :
-------------------------------------------------------
${post.theme}

-------------------------------------------------------
TEXTE DE LA PUBLICATION (LÉGENDE COMPLÈTE) :
-------------------------------------------------------
${post.caption}

${post.featuredProduct && post.featuredProduct !== '—' ? `-------------------------------------------------------
PRODUIT MIS EN AVANT :
-------------------------------------------------------
${post.featuredProduct}
` : ''}
${post.cta && post.cta !== '—' ? `-------------------------------------------------------
APPEL À L'ACTION (CTA) :
-------------------------------------------------------
${post.cta}
` : ''}
-------------------------------------------------------
BRIEF CRÉATIF D'ORIGINE :
-------------------------------------------------------
${post.creativeBrief || 'Aucun'}

Archivé automatiquement le : ${new Date().toLocaleString('fr-FR')}
`;

    fs.writeFileSync(path.join(postArchiveDir, 'publication.txt'), publicationTextContent, 'utf-8');

    // 2. Fichier JSON complet de métadonnées
    fs.writeFileSync(
      path.join(postArchiveDir, 'metadata.json'),
      JSON.stringify(post, null, 2),
      'utf-8'
    );

    // 3. Sauvegarde / Copie des visuels et médias dans le dossier d'archive
    const savedMediaNames: string[] = [];

    if (Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0) {
      for (let i = 0; i < post.mediaUrls.length; i++) {
        const mediaUrl = post.mediaUrls[i];
        const mediaIndex = i + 1;

        // Cas A : URL locale relative (ex: /visuels/2026-10-23/mon-image.jpg ou /posts/mehdi/...)
        if (mediaUrl.startsWith('/')) {
          const localSourcePath = path.join(process.cwd(), 'public', mediaUrl.replace(/^\//, ''));
          if (fs.existsSync(localSourcePath)) {
            const ext = path.extname(localSourcePath) || '.jpg';
            const destFileName = `visuel-${mediaIndex}${ext}`;
            const destPath = path.join(postArchiveDir, destFileName);
            fs.copyFileSync(localSourcePath, destPath);
            savedMediaNames.push(destFileName);
          }
        } 
        // Cas B : Data URL Base64 (téléversé en mémoire)
        else if (mediaUrl.startsWith('data:')) {
          const match = mediaUrl.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
          if (match) {
            const mimeType = match[1];
            const base64Data = match[2];
            const ext = mimeType.includes('png') ? '.png' : mimeType.includes('mp4') ? '.mp4' : '.jpg';
            const destFileName = `visuel-${mediaIndex}${ext}`;
            const destPath = path.join(postArchiveDir, destFileName);
            fs.writeFileSync(destPath, Buffer.from(base64Data, 'base64'));
            savedMediaNames.push(destFileName);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Publication archivée avec succès dans archives/publications/${folderName}`,
      folderName,
      folderPath: `archives/publications/${folderName}`,
      savedMedia: savedMediaNames,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur archivage';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
