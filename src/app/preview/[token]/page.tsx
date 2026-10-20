'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Post, PostStatus } from '@/types/post';
import initialPostsData from '@/lib/data/initial-posts.json';
import { updatePostClientFeedbackInFirestore } from '@/lib/firebase/firestore';
import { 
  CheckCircle2, 
  MessageSquare, 
  X, 
  Check, 
  Send, 
  Download, 
  LayoutGrid, 
  ListFilter, 
  Sun, 
  Moon, 
  Layers 
} from 'lucide-react';

const STORAGE_KEY_POSTS = 'postpilot_posts_v1';
const STORAGE_KEY_THEME = 'postpilot_theme_mode';

export default function ClientPreviewPage() {
  const params = useParams();
  const token = typeof params?.token === 'string' ? params.token : '';

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostForFeedback, setSelectedPostForFeedback] = useState<Post | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>('feed');
  const [clientFilter, setClientFilter] = useState<'all' | 'pending' | 'approved' | 'changes'>('all');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load Theme
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as 'light' | 'dark' | null;
      const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      setTheme(initialTheme);
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Load Posts
      const saved = localStorage.getItem(STORAGE_KEY_POSTS);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPosts(parsed);
            return;
          }
        } catch {
          // fallback
        }
      }
      setPosts(initialPostsData as unknown as Post[]);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_THEME, next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const savePosts = (newPosts: Post[]) => {
    setPosts(newPosts);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(newPosts));
    }
  };

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleApprovePost = async (post: Post) => {
    const updated = posts.map(p => {
      if (p.id === post.id) {
        return {
          ...p,
          status: 'approved' as PostStatus,
          clientFeedback: {
            approved: true,
            comment: undefined,
            updatedAt: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    savePosts(updated);
    showNotification('Publication validée.');

    try {
      await updatePostClientFeedbackInFirestore(post.workspaceId, post.id, {
        approved: true,
        comment: undefined,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // mode local
    }
  };

  const handleOpenFeedbackModal = (post: Post) => {
    setSelectedPostForFeedback(post);
    setFeedbackText(post.clientFeedback?.comment || '');
  };

  const handleSubmitFeedback = async () => {
    if (!selectedPostForFeedback) return;

    const feedbackObj = {
      approved: false,
      comment: feedbackText,
      updatedAt: new Date().toISOString(),
    };

    const updated = posts.map(p => {
      if (p.id === selectedPostForFeedback.id) {
        return {
          ...p,
          status: 'changes_requested' as PostStatus,
          clientFeedback: feedbackObj,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    savePosts(updated);
    const targetPost = selectedPostForFeedback;
    setSelectedPostForFeedback(null);
    setFeedbackText('');
    showNotification('Remarque enregistrée et transmise.');

    try {
      await updatePostClientFeedbackInFirestore(targetPost.workspaceId, targetPost.id, feedbackObj);
    } catch {
      // fallback
    }
  };

  const approvedCount = posts.filter(p => p.status === 'approved').length;
  const pendingCount = posts.filter(p => p.status === 'pending_review' || p.status === 'draft').length;
  const changesCount = posts.filter(p => p.status === 'changes_requested').length;
  const progressPercent = Math.round((approvedCount / (posts.length || 1)) * 100);

  const displayedPosts = posts.filter(p => {
    if (clientFilter === 'approved') return p.status === 'approved';
    if (clientFilter === 'pending') return p.status === 'pending_review' || p.status === 'draft';
    if (clientFilter === 'changes') return p.status === 'changes_requested';
    return true;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 bg-zinc-900 dark:bg-white text-white dark:text-black font-medium px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-xs animate-in fade-in slide-in-from-top-2 border border-zinc-700 dark:border-zinc-300">
          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Client Minimaliste Swiss */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs tracking-wider">
            FT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-xs lg:text-sm tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
                FruiThé Abidjan
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                Portail de validation
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
              Calendrier Éditorial • Octobre 2026 {token ? `• Réf. ${token.slice(0, 8)}` : ''}
            </p>
          </div>
        </div>

        {/* Right actions: Progress & Theme Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[11px] text-zinc-500 font-mono">
              {approvedCount} / {posts.length} validées ({progressPercent}%)
            </span>
            <div className="w-28 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-zinc-950 dark:bg-white rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 transition-colors"
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Control Bar: Filters & View Switcher */}
      <div className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-4 lg:px-8 py-2.5 flex items-center justify-between gap-3 text-xs flex-wrap">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1">
          {[
            { id: 'all', label: `Toutes (${posts.length})` },
            { id: 'pending', label: `À valider (${pendingCount})` },
            { id: 'approved', label: `Validées (${approvedCount})` },
            { id: 'changes', label: `Retouches demandées (${changesCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setClientFilter(tab.id as typeof clientFilter)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                clientFilter === tab.id
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('feed')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'feed' 
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs' 
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            title="Vue Détaillée"
          >
            <ListFilter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'grid' 
                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs' 
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            title="Vue Grille"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {viewMode === 'feed' ? (
          /* Feed View */
          <div className="space-y-6">
            {displayedPosts.map((post) => {
              const isApproved = post.status === 'approved';
              const hasChanges = post.status === 'changes_requested';

              return (
                <article
                  key={post.id}
                  className={`rounded-xl border transition-all overflow-hidden bg-white dark:bg-zinc-950 ${
                    isApproved
                      ? 'border-zinc-300 dark:border-zinc-700'
                      : hasChanges
                      ? 'border-zinc-400 dark:border-zinc-600'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {/* Card Top Info */}
                  <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/30">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {post.week}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {post.dayOfWeek} {post.scheduledDate}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono capitalize">
                          {post.format} • {post.platforms.join(', ')}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {isApproved ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                        Validé
                      </span>
                    ) : hasChanges ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700">
                        <MessageSquare className="w-3 h-3" />
                        Retouche transmise
                      </span>
                    ) : (
                      <span className="text-[11px] text-zinc-400 font-mono">
                        En attente
                      </span>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-4">
                    {/* Visual Media Placeholder or Real Image */}
                    <div className="rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 aspect-video flex items-center justify-center text-center p-4 relative group">
                      {post.mediaUrls && post.mediaUrls.length > 0 ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={post.mediaUrls[0]} alt={post.theme} className="w-full h-full object-cover" />
                          <a
                            href={post.mediaUrls[0]}
                            download={`${post.id}_creative.jpg`}
                            className="absolute bottom-2 right-2 px-2.5 py-1.5 rounded bg-black/80 hover:bg-black text-white text-[11px] opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 font-mono"
                          >
                            <Download className="w-3 h-3" />
                            <span>Télécharger</span>
                          </a>
                        </>
                      ) : (
                        <div className="space-y-1 text-center">
                          <Layers className="w-5 h-5 text-zinc-400 mx-auto" />
                          <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{post.theme}</div>
                          <div className="text-[11px] text-zinc-400 max-w-md mx-auto line-clamp-2">{post.creativeBrief}</div>
                        </div>
                      )}
                    </div>

                    {/* Theme and Caption */}
                    <div>
                      <h3 className="font-semibold text-xs lg:text-sm text-zinc-900 dark:text-zinc-100 mb-2">
                        {post.theme}
                      </h3>
                      <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line font-normal">
                        {post.caption}
                      </div>
                    </div>

                    {/* Metadata attributes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {post.featuredProduct && (
                        <div className="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium flex items-center justify-between">
                          <span className="text-[11px] text-zinc-400 uppercase font-mono">Produit :</span>
                          <span className="truncate">{post.featuredProduct}</span>
                        </div>
                      )}
                      {post.cta && (
                        <div className="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium flex items-center justify-between">
                          <span className="text-[11px] text-zinc-400 uppercase font-mono">Action :</span>
                          <span className="truncate">{post.cta}</span>
                        </div>
                      )}
                    </div>

                    {/* Feedback comment if requested */}
                    {post.clientFeedback?.comment && (
                      <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
                        <span className="font-mono text-[10px] text-zinc-500 uppercase block mb-1">Votre consigne de retouche :</span>
                        <p className="text-zinc-800 dark:text-zinc-200 italic">&ldquo;{post.clientFeedback.comment}&rdquo;</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-end gap-2.5">
                    <button
                      onClick={() => handleOpenFeedbackModal(post)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Demander une retouche</span>
                    </button>

                    <button
                      onClick={() => handleApprovePost(post)}
                      disabled={isApproved}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isApproved
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700 cursor-default'
                          : 'bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black shadow-xs'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{isApproved ? 'Publication validée' : 'Valider ce post'}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedPosts.map((post) => {
              const isApproved = post.status === 'approved';

              return (
                <div
                  key={post.id}
                  className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded">
                        {post.scheduledDate}
                      </span>
                      {isApproved ? (
                        <span className="text-[10px] text-zinc-900 dark:text-zinc-100 font-medium flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[2]" />
                          <span>Validé</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400 font-mono">À valider</span>
                      )}
                    </div>

                    <h4 className="font-medium text-xs text-zinc-900 dark:text-zinc-100 line-clamp-2">
                      {post.theme}
                    </h4>

                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                      {post.caption}
                    </p>

                    {post.featuredProduct && (
                      <div className="text-[10px] text-zinc-600 dark:text-zinc-400 font-mono truncate">
                        Produit : {post.featuredProduct}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenFeedbackModal(post)}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                      title="Demander une retouche"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleApprovePost(post)}
                      disabled={isApproved}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                        isApproved
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                          : 'bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{isApproved ? 'Validé' : 'Valider'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Demande de Retouche */}
      {selectedPostForFeedback && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl w-full max-w-lg p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                <h3 className="font-semibold text-xs tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
                  Consigne de retouche éditoriale
                </h3>
              </div>
              <button
                onClick={() => setSelectedPostForFeedback(null)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-zinc-500">
                Publication ciblée : <strong className="text-zinc-900 dark:text-zinc-100">{selectedPostForFeedback.theme}</strong> ({selectedPostForFeedback.scheduledDate})
              </p>
              <textarea
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Indiquez ici vos modifications (accroche, prix, mise en avant produit, etc.)..."
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 leading-relaxed font-normal"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => setSelectedPostForFeedback(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={!feedbackText.trim()}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  feedbackText.trim()
                    ? 'bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmettre la consigne</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Minimaliste */}
      <footer className="p-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 space-y-1">
        <div>PostPilot • Régie éditoriale et gestion de contenu • {new Date().getFullYear()}</div>
        <div className="text-[11px] text-zinc-500 space-x-3 font-mono">
          <a href="/mentions-legales" target="_blank" className="hover:text-zinc-900 dark:hover:text-zinc-200">Mentions Légales</a>
          <span>•</span>
          <a href="/confidentialite" target="_blank" className="hover:text-zinc-900 dark:hover:text-zinc-200">Protection des Données (ARTCI)</a>
        </div>
      </footer>
    </div>
  );
}
