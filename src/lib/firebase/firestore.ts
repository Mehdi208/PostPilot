import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy,
  writeBatch,
  updateDoc
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { Post, ClientFeedback } from '@/types/post';
import { Workspace } from '@/types/workspace';

/**
 * Enregistre ou met à jour un post dans Firestore sous /workspaces/{workspaceId}/posts/{postId}
 */
export async function syncPostToFirestore(workspaceId: string, post: Post): Promise<void> {
  if (!isFirebaseConfigured()) return;

  const postRef = doc(db, 'workspaces', workspaceId, 'posts', post.id);
  await setDoc(postRef, {
    ...post,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

/**
 * Abonnement temps réel aux posts d'un workspace via Firestore onSnapshot
 */
export function subscribeToWorkspacePosts(
  workspaceId: string,
  onUpdate: (posts: Post[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!isFirebaseConfigured()) {
    // Si Firebase n'est pas configuré, retourne une fonction no-op
    return () => {};
  }

  const postsCollectionRef = collection(db, 'workspaces', workspaceId, 'posts');
  const postsQuery = query(postsCollectionRef, orderBy('orderIndex', 'asc'));

  const unsubscribe = onSnapshot(
    postsQuery,
    (snapshot) => {
      const posts: Post[] = [];
      snapshot.forEach((docSnap) => {
        posts.push(docSnap.data() as Post);
      });
      if (posts.length > 0) {
        onUpdate(posts);
      }
    },
    (error) => {
      console.warn('Firestore onSnapshot listener error:', error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

/**
 * Envoi par lot (batch write) pour synchroniser tout le calendrier d'Octobre d'un coup
 */
export async function batchSavePostsToFirestore(
  workspaceId: string,
  posts: Post[]
): Promise<{ success: boolean; count: number; error?: string }> {
  if (!isFirebaseConfigured()) {
    return { success: false, count: 0, error: 'Firebase n’est pas configuré avec des clés réelles.' };
  }

  try {
    const batch = writeBatch(db);

    const targetPosts = posts.filter(p => (p.workspaceId || workspaceId) === workspaceId);
    if (targetPosts.length === 0) return { success: true, count: 0 };

    targetPosts.forEach((post) => {
      const postRef = doc(db, 'workspaces', workspaceId, 'posts', post.id);
      batch.set(postRef, {
        ...post,
        workspaceId: post.workspaceId || workspaceId,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    });

    await batch.commit();
    return { success: true, count: targetPosts.length };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, count: 0, error: message };
  }
}

/**
 * Mise à jour spécifique du feedback client (depuis le portail /preview/:token)
 */
export async function updatePostClientFeedbackInFirestore(
  workspaceId: string,
  postId: string,
  feedback: ClientFeedback
): Promise<void> {
  if (!isFirebaseConfigured()) return;

  const postRef = doc(db, 'workspaces', workspaceId, 'posts', postId);
  await updateDoc(postRef, {
    clientFeedback: feedback,
    status: feedback.approved ? 'approved' : 'changes_requested',
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Sauvegarde des configurations du workspace (webhook, token, infos client)
 */
export async function saveWorkspaceConfigToFirestore(workspace: Workspace): Promise<void> {
  if (!isFirebaseConfigured()) return;

  const wsRef = doc(db, 'workspaces', workspace.id);
  await setDoc(wsRef, {
    ...workspace,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

/**
 * Récupère les posts d'un workspace en un seul appel (one-shot)
 */
export async function fetchWorkspacePostsFromFirestore(workspaceId: string): Promise<Post[]> {
  if (!isFirebaseConfigured()) return [];

  try {
    const postsCollectionRef = collection(db, 'workspaces', workspaceId, 'posts');
    const postsQuery = query(postsCollectionRef, orderBy('orderIndex', 'asc'));
    const snapshot = await getDocs(postsQuery);
    const posts: Post[] = [];
    snapshot.forEach((d) => posts.push(d.data() as Post));
    return posts;
  } catch {
    return [];
  }
}
