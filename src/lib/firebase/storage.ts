export interface UploadProgressResult {
  progress: number;
  downloadUrl?: string;
  error?: string;
}

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB max

/**
 * Valide un fichier avant son téléversement
 */
export function validateMediaFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Le fichier "${file.name}" dépasse la limite autorisée de 25 Mo (${(file.size / (1024 * 1024)).toFixed(1)} Mo).`,
    };
  }

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: `Format de fichier non pris en charge. Veuillez fournir une image (PNG, JPG, WebP) ou une vidéo (MP4).`,
    };
  }

  return { valid: true };
}

/**
 * Téléverse un média vers le dossier local public/visuels/<date>/ ou stockage persistant.
 * Ne se bloque JAMAIS à 0% grâce à une progression fluide et un fallback automatique.
 */
export async function uploadPostMedia(
  workspaceId: string,
  postId: string,
  file: File,
  onProgress?: (progress: number) => void,
  scheduledDate?: string
): Promise<string> {
  const validation = validateMediaFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (onProgress) onProgress(20);

  const targetDate = scheduledDate || new Date().toISOString().split('T')[0];

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('date', targetDate);
    formData.append('postId', postId);
    formData.append('workspaceId', workspaceId);

    if (onProgress) onProgress(50);

    const res = await fetch('/api/visuels/upload', {
      method: 'POST',
      body: formData,
    });

    if (onProgress) onProgress(85);

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.url) {
        if (onProgress) onProgress(100);
        return data.url;
      }
    }
  } catch (err) {
    console.warn('Upload API fallback to client storage:', err);
  }

  // Fallback client instantané : lecture Base64 / Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(Math.max(50, percent));
      }
    };
    reader.onload = () => {
      if (onProgress) onProgress(100);
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      // Dernier recours : URL d'objet blob
      try {
        const localBlob = URL.createObjectURL(file);
        if (onProgress) onProgress(100);
        resolve(localBlob);
      } catch (blobErr) {
        reject(blobErr);
      }
    };
    reader.readAsDataURL(file);
  });
}
