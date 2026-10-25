import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.mov']);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetDate = searchParams.get('date');

    const baseDir = path.join(process.cwd(), 'public', 'visuels');
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    // Si une date spécifique est demandée
    if (targetDate) {
      const dateDir = path.join(baseDir, targetDate);
      if (!fs.existsSync(dateDir)) {
        fs.mkdirSync(dateDir, { recursive: true });
      }

      const files = fs.readdirSync(dateDir).filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ALLOWED_EXTENSIONS.has(ext);
      });

      const mediaUrls = files.map(file => `/visuels/${targetDate}/${file}`);
      return NextResponse.json({
        success: true,
        date: targetDate,
        files: mediaUrls,
      });
    }

    // Sinon, scan de tous les sous-dossiers par date
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    const folders: Record<string, string[]> = {};

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const dateDir = path.join(baseDir, entry.name);
        const files = fs.readdirSync(dateDir).filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ALLOWED_EXTENSIONS.has(ext);
        });

        if (files.length > 0) {
          folders[entry.name] = files.map(file => `/visuels/${entry.name}/${file}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      folders,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown scan error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
