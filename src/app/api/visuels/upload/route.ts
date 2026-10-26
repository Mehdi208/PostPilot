import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 Mo

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const date = (formData.get('date') as string) || new Date().toISOString().split('T')[0];

    if (!file) {
      return NextResponse.json({ success: false, error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `Le fichier dépasse la taille maximale de 25 Mo.` },
        { status: 400 }
      );
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { success: false, error: 'Format non supporté. Fournissez une image (JPG, PNG, WebP) ou vidéo (MP4).' },
        { status: 400 }
      );
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${Date.now()}_${sanitizedName}`;

    // 1. Tentative d'écriture locale dans public/visuels/<date>/ (environnements Node/Local)
    try {
      const baseDir = path.join(process.cwd(), 'public', 'visuels');
      const targetDir = path.join(baseDir, date);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const filePath = path.join(targetDir, fileName);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/visuels/${date}/${fileName}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName,
        date,
      });
    } catch {
      // 2. Environnement Serverless / Vercel (système de fichiers en lecture seule)
      // Hébergement public instantané via CDN haute vitesse pour Make.com & LinkedIn
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const blob = new Blob([buffer], { type: file.type });
        const cdnFormData = new FormData();
        cdnFormData.append('files[]', blob, fileName);

        const uploadRes = await fetch('https://uguu.se/upload', {
          method: 'POST',
          body: cdnFormData,
          signal: AbortSignal.timeout(8000),
        });

        if (uploadRes.ok) {
          const resData = await uploadRes.json();
          if (resData?.success && resData?.files?.[0]?.url) {
            return NextResponse.json({
              success: true,
              url: resData.files[0].url,
              fileName,
              date,
              isCdn: true,
            });
          }
        }
      } catch (cdnErr) {
        console.warn('Hébergement CDN indisponible, bascule vers stockage mémoire Base64:', cdnErr);
      }

      // 3. Fallback ultime : Data URL Base64 persistée côté client
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;

      return NextResponse.json({
        success: true,
        url: dataUrl,
        fileName,
        date,
        isBase64: true,
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
