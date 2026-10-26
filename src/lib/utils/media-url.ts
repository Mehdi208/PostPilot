/**
 * Convertit toute URL de média (relative, Base64 ou CDN) en une URL HTTPS publique directe,
 * téléchargeable immédiatement par Make.com, LinkedIn, Zapier, etc.
 */
export async function resolvePublicMediaUrl(url: string, baseUrl: string): Promise<string> {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // 1. Déjà une URL HTTP/HTTPS publique (hors localhost)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    if (!trimmed.includes('localhost:') && !trimmed.includes('127.0.0.1:')) {
      return trimmed;
    }
  }

  // 2. URL relative servie par Next.js (ex: /visuels/2026-10-23/img.jpg)
  if (trimmed.startsWith('/')) {
    const cleanBase = baseUrl.replace(/\/$/, '');
    return `${cleanBase}${trimmed}`;
  }

  // 3. Data URL Base64 (image importée en mémoire ou via FileReader)
  if (trimmed.startsWith('data:image/')) {
    try {
      const matches = trimmed.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const ext = mimeType.split('/')[1] || 'jpg';
        const fileName = `postpilot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

        const blob = new Blob([buffer], { type: mimeType });
        const fd = new FormData();
        fd.append('files[]', blob, fileName);

        const uploadRes = await fetch('https://uguu.se/upload', {
          method: 'POST',
          body: fd,
          signal: AbortSignal.timeout(10000),
        });

        if (uploadRes.ok) {
          const resData = await uploadRes.json();
          if (resData?.success && resData?.files?.[0]?.url) {
            return resData.files[0].url;
          }
        }
      }
    } catch (err) {
      console.warn('Erreur lors de l\'hébergement public de l\'image Base64:', err);
    }
  }

  return trimmed;
}

export async function resolvePublicMediaUrls(urls: string[], baseUrl: string): Promise<string[]> {
  if (!Array.isArray(urls)) return [];
  const results: string[] = [];
  for (const u of urls) {
    if (u) {
      const resolved = await resolvePublicMediaUrl(u, baseUrl);
      if (resolved && !resolved.startsWith('data:')) {
        results.push(resolved);
      }
    }
  }
  return results;
}
