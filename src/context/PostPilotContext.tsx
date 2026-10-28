'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Post, PostStatus, Platform } from '@/types/post';
import { Workspace, DEFAULT_WORKSPACES } from '@/types/workspace';
import initialPostsData from '@/lib/data/initial-posts.json';
import { syncPostToFirestore, subscribeToWorkspacePosts, batchSavePostsToFirestore } from '@/lib/firebase/firestore';

interface PostPilotContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  setActiveWorkspace: (workspace: Workspace) => void;
  posts: Post[];
  filteredPosts: Post[];
  activeView: 'calendar' | 'table' | 'inspiration';
  setActiveView: (view: 'calendar' | 'table' | 'inspiration') => void;
  selectedPlatform: string;
  setSelectedPlatform: (p: string) => void;
  selectedWeek: string;
  setSelectedWeek: (w: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedPost: Post | null;
  setSelectedPost: (p: Post | null) => void;
  updatePostStatus: (postId: string, status: PostStatus) => void;
  updatePost: (updatedPost: Post) => void;
  importPosts: (newPosts: Post[]) => void;
  addPostFeedback: (postId: string, comment: string, approved: boolean) => void;
  dispatchToMakeWebhook: (post: Post) => Promise<{ success: boolean; message: string }>;
  setWorkspaceWebhookUrl: (workspaceId: string, url: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  resetToOfficialOctoberCalendar: () => void;
  reschedulePost: (postId: string, newDate: string) => void;
}

const PostPilotContext = createContext<PostPilotContextType | undefined>(undefined);

const STORAGE_KEY_POSTS = 'postpilot_posts_v7';
const STORAGE_KEY_WORKSPACE = 'postpilot_active_workspace_v1';

// Renvoie les publications officielles de base (16 FruiThé + 4 Méhdi Traoré)
function getInitialOctoberPosts(): Post[] {
  return (initialPostsData as unknown as Post[]).map(p => ({
    ...p,
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
  }));
}

// Fusion auto-réparatrice : garantit que toutes les publications de base sont toujours présentes,
// tout en synchronisant les dates officielles selon le rythme 1 post / semaine du professeur.
function mergeWithInitialPosts(savedList: Post[]): Post[] {
  const basePosts = getInitialOctoberPosts();
  const map = new Map<string, Post>();

  // 1. Initialise avec les publications officielles de base (16 FruiThé + 4 Méhdi Traoré)
  basePosts.forEach(p => map.set(p.id, p));

  // 2. Superpose les modifications sauvegardées sans écraser le workspaceId d'origine,
  // et en assurant la synchronisation des dates officielles de Méhdi Traoré
  if (Array.isArray(savedList)) {
    savedList.forEach(sp => {
      if (sp && sp.id) {
        if (map.has(sp.id)) {
          const base = map.get(sp.id)!;
          const mergedMedia = (sp.mediaUrls && sp.mediaUrls.length > 0) ? sp.mediaUrls : base.mediaUrls;
          
          // Pour les posts de Méhdi Traoré, on synchronise directement avec le planning hebdomadaire officiel du professeur
          const isMehdi = base.workspaceId === 'mehdi-traore';
          const scheduledDate = isMehdi ? base.scheduledDate : (sp.scheduledDate || base.scheduledDate);
          const dayOfWeek = isMehdi ? base.dayOfWeek : (sp.dayOfWeek || base.dayOfWeek);
          const week = isMehdi ? base.week : (sp.week || base.week);
          const time = isMehdi ? (base.time || '08:30') : (sp.time || base.time);
          const status = (isMehdi && base.id === 'mehdi-post-1-presentation') ? 'published' : (sp.status || base.status);

          map.set(sp.id, {
            ...base,
            ...sp,
            workspaceId: base.workspaceId, // Préserve le workspaceId légitime du post de base
            mediaUrls: mergedMedia,
            scheduledDate,
            dayOfWeek,
            week,
            time,
            status,
            aiVisualPrompt: sp.aiVisualPrompt || base.aiVisualPrompt,
            aiPromptSources: (sp.aiPromptSources && sp.aiPromptSources.length > 0) ? sp.aiPromptSources : base.aiPromptSources,
            inspirationUrls: (sp.inspirationUrls && sp.inspirationUrls.length > 0) ? sp.inspirationUrls : base.inspirationUrls,
          });
        } else if (sp && sp.workspaceId) {
          // Nouveaux posts créés manuellement par l'utilisateur avec valeurs saines
          map.set(sp.id, {
            ...sp,
            platforms: Array.isArray(sp.platforms) ? sp.platforms : ['instagram'],
            mediaUrls: Array.isArray(sp.mediaUrls) ? sp.mediaUrls : [],
            scheduledDate: sp.scheduledDate || '2026-10-01',
            dayOfWeek: sp.dayOfWeek || 'Jeu.',
            week: sp.week || 'S1',
            status: sp.status || 'draft',
          });
        }
      }
    });
  }

  return Array.from(map.values()).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
}

export function PostPilotProvider({ children }: { children: React.ReactNode }) {
  const [workspaces] = useState<Workspace[]>(DEFAULT_WORKSPACES);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace>(DEFAULT_WORKSPACES[0]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeView, setActiveView] = useState<'calendar' | 'table' | 'inspiration'>('calendar');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Synchronisation du thème sombre / clair
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('postpilot_theme') as 'dark' | 'light' | null;
      if (savedTheme === 'light') {
        setTheme('light');
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      } else {
        setTheme('dark');
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('postpilot_theme', next);
      if (next === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      }
    }
  };

  // Initialisation auto-réparatrice des posts (récupère v5 ou migre v4/v3/v2/v1 sans perte)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Détection prioritaire par paramètre d'URL (?workspace=mehdi-traore ou ?ws=mehdi-traore)
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const wsParam = urlParams.get('workspace') || urlParams.get('ws');
        if (wsParam) {
          const found = DEFAULT_WORKSPACES.find(w => w.id === wsParam);
          if (found) {
            const savedWebhook = localStorage.getItem(`postpilot_webhook_${found.id}`) || localStorage.getItem('postpilot_linkedin_webhook_url');
            setActiveWorkspaceState(savedWebhook ? { ...found, webhookUrl: savedWebhook } : found);
            localStorage.setItem(STORAGE_KEY_WORKSPACE, found.id);
          }
        } else {
          const savedWorkspaceId = localStorage.getItem(STORAGE_KEY_WORKSPACE);
          if (savedWorkspaceId) {
            const found = DEFAULT_WORKSPACES.find(w => w.id === savedWorkspaceId);
            if (found) {
              const savedWebhook = localStorage.getItem(`postpilot_webhook_${found.id}`) || localStorage.getItem('postpilot_linkedin_webhook_url');
              setActiveWorkspaceState(savedWebhook ? { ...found, webhookUrl: savedWebhook } : found);
            }
          }
        }
      } catch {
        // ignore
      }

      // Lecture v7 ou versions antérieures
      const rawStored = 
        localStorage.getItem(STORAGE_KEY_POSTS) || 
        localStorage.getItem('postpilot_posts_v6') || 
        localStorage.getItem('postpilot_posts_v5') || 
        localStorage.getItem('postpilot_posts_v4') || 
        localStorage.getItem('postpilot_posts_v3') || 
        localStorage.getItem('postpilot_posts_v2') || 
        localStorage.getItem('postpilot_posts_v1');

      let parsed: Post[] = [];
      if (rawStored) {
        try {
          const json = JSON.parse(rawStored);
          if (Array.isArray(json)) parsed = json;
        } catch {
          // ignore
        }
      }

      // Auto-réparation immédiate : garantit l'intégralité des 20 posts (16 FruiThé + 4 Méhdi Traoré)
      const healed = mergeWithInitialPosts(parsed);
      setPosts(healed);
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(healed));

      // Nettoie les anciennes clés de localStorage pour libérer le quota
      localStorage.removeItem('postpilot_posts_v6');
      localStorage.removeItem('postpilot_posts_v5');
      localStorage.removeItem('postpilot_posts_v4');
      localStorage.removeItem('postpilot_posts_v3');

      // Batch save vers Firestore pour chaque workspace séparément
      DEFAULT_WORKSPACES.forEach(ws => {
        const wsPosts = healed.filter(p => p.workspaceId === ws.id);
        if (wsPosts.length > 0) {
          batchSavePostsToFirestore(ws.id, wsPosts).catch(() => {});
        }
      });

      // Scan automatique des dossiers public/visuels/ pour lier les images locales par date
      fetch('/api/visuels/scan')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.folders) {
            setPosts(currentList => {
              let changed = false;
              const updated = currentList.map(p => {
                const folderImages = data.folders[p.scheduledDate];
                if (folderImages && folderImages.length > 0 && (!p.mediaUrls || p.mediaUrls.length === 0)) {
                  changed = true;
                  return { ...p, mediaUrls: folderImages };
                }
                return p;
              });
              if (changed && typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updated));
              }
              return changed ? updated : currentList;
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  // Écouteur temps réel Firestore NON-DESTRUCTIF
  useEffect(() => {
    const unsubscribe = subscribeToWorkspacePosts(activeWorkspace.id, (firestorePosts) => {
      if (firestorePosts && firestorePosts.length > 0) {
        setPosts(currentPosts => {
          // Base : les posts actuels ou les 20 posts de référence
          const base = currentPosts.length >= 20 ? currentPosts : mergeWithInitialPosts(currentPosts);
          const map = new Map<string, Post>();
          base.forEach(p => map.set(p.id, p));

          // Fusionne les documents Firestore par ID sans effacer les autres posts
          firestorePosts.forEach(fp => {
            if (fp && fp.id) {
              const prev = map.get(fp.id);
              map.set(fp.id, {
                ...(prev || fp),
                ...fp,
                workspaceId: fp.workspaceId || activeWorkspace.id,
                mediaUrls: (fp.mediaUrls && fp.mediaUrls.length > 0) ? fp.mediaUrls : (prev?.mediaUrls || []),
              });
            }
          });

          const merged = Array.from(map.values()).sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(merged));
          }
          return merged;
        });
      }
    });

    return () => unsubscribe();
  }, [activeWorkspace.id]);

  const resetToOfficialOctoberCalendar = () => {
    const official = getInitialOctoberPosts();
    setPosts(official);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(official));
    }
    const wsPosts = official.filter(p => p.workspaceId === activeWorkspace.id);
    batchSavePostsToFirestore(activeWorkspace.id, wsPosts).catch(() => {});
  };

  const setActiveWorkspace = (workspace: Workspace) => {
    setActiveWorkspaceState(workspace);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_WORKSPACE, workspace.id);
      if (workspace.webhookUrl) {
        localStorage.setItem(`postpilot_webhook_${workspace.id}`, workspace.webhookUrl);
        localStorage.setItem('postpilot_linkedin_webhook_url', workspace.webhookUrl);
      }
    }
  };

  const setWorkspaceWebhookUrl = (workspaceId: string, url: string) => {
    const trimmed = url.trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem(`postpilot_webhook_${workspaceId}`, trimmed);
      localStorage.setItem('postpilot_linkedin_webhook_url', trimmed);
    }
    setActiveWorkspaceState(prev => {
      if (prev.id === workspaceId) {
        return { ...prev, webhookUrl: trimmed };
      }
      return prev;
    });
  };

  const updatePostStatus = (postId: string, status: PostStatus) => {
    let targetPost: Post | null = null;
    setPosts(prevPosts => {
      const base = prevPosts.length >= 16 ? prevPosts : mergeWithInitialPosts(prevPosts);
      const updated = base.map(p => {
        if (p.id === postId) {
          const updatedItem = {
            ...p,
            status,
            updatedAt: new Date().toISOString(),
          };
          targetPost = updatedItem;
          return updatedItem;
        }
        return p;
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updated));
      }
      return updated;
    });

    setTimeout(() => {
      if (targetPost) {
        syncPostToFirestore(activeWorkspace.id, targetPost).catch(() => {});
        
        // Archivage automatique sur la machine dès que le post passe en 'published'
        if ((targetPost as Post).status === 'published') {
          fetch('/api/posts/archive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post: targetPost }),
          }).catch(() => {});
        }
      }
    }, 0);

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(prev => prev ? {
        ...prev,
        status,
        updatedAt: new Date().toISOString(),
      } : null);
    }
  };

  const updatePost = (updatedPost: Post) => {
    setPosts(prevPosts => {
      const base = prevPosts.length >= 16 ? prevPosts : mergeWithInitialPosts(prevPosts);
      const exists = base.some(p => p.id === updatedPost.id);
      const updated = exists
        ? base.map(p => (p.id === updatedPost.id ? updatedPost : p))
        : [...base, updatedPost];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updated));
      }
      return updated;
    });

    setTimeout(() => {
      syncPostToFirestore(activeWorkspace.id, updatedPost).catch(() => {});
    }, 0);
  };

  const reschedulePost = (postId: string, newDateStr: string) => {
    let targetPost: Post | null = null;
    const [year, month, day] = newDateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const daysShort = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
    const dayOfWeek = daysShort[dateObj.getDay()];

    const dayNum = day;
    let week = 'S1';
    if (dayNum <= 11) week = 'S1';
    else if (dayNum <= 18) week = 'S2';
    else if (dayNum <= 25) week = 'S3';
    else week = 'S4';

    setPosts(prevPosts => {
      const base = prevPosts.length >= 16 ? prevPosts : mergeWithInitialPosts(prevPosts);
      const updated = base.map(p => {
        if (p.id === postId) {
          const item: Post = {
            ...p,
            scheduledDate: newDateStr,
            dayOfWeek,
            week,
            updatedAt: new Date().toISOString(),
          };
          targetPost = item;
          return item;
        }
        return p;
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updated));
      }
      return updated;
    });

    setTimeout(() => {
      if (targetPost) {
        syncPostToFirestore(activeWorkspace.id, targetPost).catch(() => {});
        
        // Archivage automatique sur la machine dès que le post passe en 'published'
        if ((targetPost as Post).status === 'published') {
          fetch('/api/posts/archive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post: targetPost }),
          }).catch(() => {});
        }
      }
    }, 0);

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(prev => prev ? {
        ...prev,
        scheduledDate: newDateStr,
        dayOfWeek,
        week,
        updatedAt: new Date().toISOString(),
      } : null);
    }
  };

  const importPosts = (newPosts: Post[]) => {
    setPosts(prevPosts => {
      const base = prevPosts.length >= 16 ? prevPosts : mergeWithInitialPosts(prevPosts);
      const existingIds = new Set(base.map(p => p.id));
      const merged = [...base];
      for (const np of newPosts) {
        if (existingIds.has(np.id)) {
          const index = merged.findIndex(p => p.id === np.id);
          merged[index] = np;
        } else {
          merged.push(np);
        }
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(merged));
      }
      return merged;
    });
  };

  const addPostFeedback = (postId: string, comment: string, approved: boolean) => {
    let targetPost: Post | null = null;
    setPosts(prevPosts => {
      const base = prevPosts.length >= 16 ? prevPosts : mergeWithInitialPosts(prevPosts);
      const updated = base.map(p => {
        if (p.id === postId) {
          const item = {
            ...p,
            status: (approved ? 'approved' : 'changes_requested') as PostStatus,
            clientFeedback: {
              approved,
              comment,
              updatedAt: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
          };
          targetPost = item;
          return item;
        }
        return p;
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updated));
      }
      return updated;
    });

    setTimeout(() => {
      if (targetPost) {
        syncPostToFirestore(activeWorkspace.id, targetPost).catch(() => {});
        
        // Archivage automatique sur la machine dès que le post passe en 'published'
        if ((targetPost as Post).status === 'published') {
          fetch('/api/posts/archive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post: targetPost }),
          }).catch(() => {});
        }
      }
    }, 0);
  };

  const dispatchToMakeWebhook = async (post: Post): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/webhook/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'post.approved',
          workspace: activeWorkspace.id,
          post,
        }),
      });
      const data = await response.json();
      return {
        success: response.ok,
        message: data.message || (response.ok ? 'Envoyé avec succès vers Make.com !' : 'Erreur webhook'),
      };
    } catch {
      return {
        success: false,
        message: 'Impossible de joindre le service webhook local.',
      };
    }
  };

  // Filtrage des posts selon le workspace, la plateforme, la semaine, le statut et la recherche
  const filteredPosts = posts.filter(post => {
    if (!post || typeof post !== 'object') return false;
    if (post.workspaceId !== activeWorkspace.id) return false;
    
    if (selectedPlatform !== 'all') {
      const platforms = Array.isArray(post.platforms) ? post.platforms : [];
      const hasPlatform = platforms.some(
        (plat: Platform) => (plat || '').toLowerCase() === selectedPlatform.toLowerCase()
      );
      if (!hasPlatform) return false;
    }

    if (selectedWeek !== 'all' && (post.week || '').toUpperCase() !== selectedWeek.toUpperCase()) {
      return false;
    }

    if (selectedStatus !== 'all' && post.status !== selectedStatus) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTheme = (post.theme || '').toLowerCase().includes(q);
      const matchCaption = (post.caption || '').toLowerCase().includes(q);
      const matchProduct = (post.featuredProduct || '').toLowerCase().includes(q);
      const matchCTA = (post.cta || '').toLowerCase().includes(q);
      if (!matchTheme && !matchCaption && !matchProduct && !matchCTA) return false;
    }

    return true;
  });

  return (
    <PostPilotContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        posts,
        filteredPosts,
        activeView,
        setActiveView,
        selectedPlatform,
        setSelectedPlatform,
        selectedWeek,
        setSelectedWeek,
        selectedStatus,
        setSelectedStatus,
        searchQuery,
        setSearchQuery,
        selectedPost,
        setSelectedPost,
        updatePostStatus,
        updatePost,
        importPosts,
        addPostFeedback,
        dispatchToMakeWebhook,
        setWorkspaceWebhookUrl,
        theme,
        toggleTheme,
        resetToOfficialOctoberCalendar,
        reschedulePost,
      }}
    >
      {children}
    </PostPilotContext.Provider>
  );
}

export function usePostPilot() {
  const context = useContext(PostPilotContext);
  if (!context) {
    throw new Error('usePostPilot doit être utilisé dans un PostPilotProvider');
  }
  return context;
}
