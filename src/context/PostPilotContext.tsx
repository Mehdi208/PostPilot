'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Post, PostStatus, Platform } from '@/types/post';
import { Workspace, DEFAULT_WORKSPACES } from '@/types/workspace';
import initialPostsData from '@/lib/data/initial-posts.json';
import { syncPostToFirestore, subscribeToWorkspacePosts } from '@/lib/firebase/firestore';

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
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  resetToOfficialOctoberCalendar: () => void;
}

const PostPilotContext = createContext<PostPilotContextType | undefined>(undefined);

const STORAGE_KEY_POSTS = 'postpilot_posts_v2';
const STORAGE_KEY_WORKSPACE = 'postpilot_active_workspace_v1';

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

  // Initialisation des posts depuis le localStorage ou le JSON initial
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWorkspaceId = localStorage.getItem(STORAGE_KEY_WORKSPACE);
      if (savedWorkspaceId) {
        const found = DEFAULT_WORKSPACES.find(w => w.id === savedWorkspaceId);
        if (found) setActiveWorkspaceState(found);
      }

      const savedPosts = localStorage.getItem(STORAGE_KEY_POSTS);
      if (savedPosts) {
        try {
          const parsed = JSON.parse(savedPosts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPosts(parsed);
            return;
          }
        } catch {
          // Fallback sur initialPostsData
        }
      }

      // Charge les 16 posts réels d'Octobre 2026 de FruiThé
      const mappedInitial = (initialPostsData as unknown as Post[]).map(p => ({
        ...p,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setPosts(mappedInitial);
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(mappedInitial));
    }
  }, []);

  // Écouteur temps réel Firestore (si clés réelles configurées)
  useEffect(() => {
    const unsubscribe = subscribeToWorkspacePosts(activeWorkspace.id, (firestorePosts) => {
      if (firestorePosts && firestorePosts.length > 0) {
        setPosts(firestorePosts);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(firestorePosts));
        }
      }
    });

    return () => unsubscribe();
  }, [activeWorkspace.id]);

  // Sauvegarde automatique des posts dans le localStorage et sync Firestore
  const savePosts = (newPosts: Post[]) => {
    setPosts(newPosts);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(newPosts));
    }
  };

  const resetToOfficialOctoberCalendar = () => {
    const mappedInitial = (initialPostsData as unknown as Post[]).map(p => ({
      ...p,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    setPosts(mappedInitial);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(mappedInitial));
    }
  };

  const setActiveWorkspace = (workspace: Workspace) => {
    setActiveWorkspaceState(workspace);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_WORKSPACE, workspace.id);
    }
  };

  const updatePostStatus = (postId: string, status: PostStatus) => {
    let targetPost: Post | null = null;
    const updated = posts.map(p => {
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

    savePosts(updated);

    if (targetPost) {
      syncPostToFirestore(activeWorkspace.id, targetPost).catch(() => {});
    }

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({
        ...selectedPost,
        status,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const updatePost = (updatedPost: Post) => {
    const updated = posts.map(p => (p.id === updatedPost.id ? updatedPost : p));
    savePosts(updated);
    syncPostToFirestore(activeWorkspace.id, updatedPost).catch(() => {});
    if (selectedPost && selectedPost.id === updatedPost.id) {
      setSelectedPost(updatedPost);
    }
  };

  const importPosts = (newPosts: Post[]) => {
    const existingIds = new Set(posts.map(p => p.id));
    const merged = [...posts];
    for (const np of newPosts) {
      if (existingIds.has(np.id)) {
        const index = merged.findIndex(p => p.id === np.id);
        merged[index] = np;
      } else {
        merged.push(np);
      }
    }
    savePosts(merged);
  };

  const addPostFeedback = (postId: string, comment: string, approved: boolean) => {
    let targetPost: Post | null = null;
    const updated = posts.map(p => {
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

    savePosts(updated);
    if (targetPost) {
      syncPostToFirestore(activeWorkspace.id, targetPost).catch(() => {});
    }
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
    if (post.workspaceId !== activeWorkspace.id) return false;
    
    if (selectedPlatform !== 'all') {
      const hasPlatform = post.platforms.some(
        (plat: Platform) => plat.toLowerCase() === selectedPlatform.toLowerCase()
      );
      if (!hasPlatform) return false;
    }

    if (selectedWeek !== 'all' && post.week.toUpperCase() !== selectedWeek.toUpperCase()) {
      return false;
    }

    if (selectedStatus !== 'all' && post.status !== selectedStatus) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTheme = post.theme?.toLowerCase().includes(q);
      const matchCaption = post.caption?.toLowerCase().includes(q);
      const matchProduct = post.featuredProduct?.toLowerCase().includes(q);
      const matchCTA = post.cta?.toLowerCase().includes(q);
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
        theme,
        toggleTheme,
        resetToOfficialOctoberCalendar,
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
