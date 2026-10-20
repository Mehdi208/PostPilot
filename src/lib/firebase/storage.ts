import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';
import { storage, isFirebaseConfigured } from './config';

export interface UploadProgressResult {
  progress: number;
  downloadUrl?: string;
  error?: string;
}

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB max selon storage.rules

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
 * Téléverse un média vers Firebase Storage avec suivi de progression
 * ou bascule gracieusement en simulation locale si Firebase n'est pas configuré.
 */
export async function uploadPostMedia(
  workspaceId: string,
  postId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const validation = validateMediaFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Nettoyage du nom de fichier
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueFileName = `${Date.now()}_${sanitizedName}`;

  // Mode Simulation Locale / Démo
  if (!isFirebaseConfigured()) {
    return new Promise((resolve) => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 25;
        if (onProgress) onProgress(Math.min(100, currentProgress));
        if (currentProgress >= 100) {
          clearInterval(interval);
          // Création d'une URL d'objet locale persistante pour la session
          const localUrl = URL.createObjectURL(file);
          resolve(localUrl);
        }
      }, 100);
    });
  }

  // Mode Production Cloud Firebase Storage
  const storagePath = `workspaces/${workspaceId}/posts/${postId}/${uniqueFileName}`;
  const storageRef = ref(storage, storagePath);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        workspaceId,
        postId,
        originalName: file.name,
      },
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        if (onProgress) onProgress(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadUrl);
      }
    );
  });
}
