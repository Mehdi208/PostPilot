'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Post, PostStatus } from '@/types/post';
import initialPostsData from '@/lib/data/initial-posts.json';
import { 
  CheckCircle2, 
  MessageSquare, 
  Sparkles, 
  X, 
  Coffee,
  Check,
  Send
} from 'lucide-react';

const STORAGE_KEY_POSTS = 'postpilot_posts_v1';

export default function ClientPreviewPage() {
  const params = useParams();
  const token = typeof params?.token === 'string' ? params.token : '';

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostForFeedback, setSelectedPostForFeedback] = useState<Post | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
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

  const savePosts = (newPosts: Post[]) => {
    setPosts(newPosts);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(newPosts));
    }
  };

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleApprovePost = (postId: string) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
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
    showNotification('Publication validée avec succès ! 🎉');
  };

  const handleOpenFeedbackModal = (post: Post) => {
    setSelectedPostForFeedback(post);
    setFeedbackText(post.clientFeedback?.comment || '');
  };

  const handleSubmitFeedback = () => {
    if (!selectedPostForFeedback) return;

    const updated = posts.map(p => {
      if (p.id === selectedPostForFeedback.id) {
        return {
          ...p,
          status: 'changes_requested' as PostStatus,
          clientFeedback: {
            approved: false,
            comment: feedbackText,
            updatedAt: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    savePosts(updated);
    setSelectedPostForFeedback(null);
    setFeedbackText('');
    showNotification('Votre demande de retouche a bien été transmise à Méhdi.');
  };

  const approvedCount = posts.filter(p => p.status === 'approved').length;
  const progressPercent = Math.round((approvedCount / (posts.length || 1)) * 100);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-zinc-950 font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Client Dédié */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            🧋
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm lg:text-base text-zinc-100 tracking-tight">
                FruiThé Abidjan
              </h1>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                Espace Validation
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Calendrier Éditorial • Octobre 2026 {token ? `• Réf: ${token.slice(0, 8)}...` : ''}
            </p>
          </div>
        </div>

        {/* Progression bar */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[11px] text-zinc-400 font-medium">
              {approvedCount} sur {posts.length} publications validées
            </span>
            <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
            {progressPercent}%
          </span>
        </div>
      </header>

      {/* Introduction Banner */}
      <div className="bg-zinc-900/60 border-b border-zinc-800/60 py-3 px-4 lg:px-8 text-center text-xs text-zinc-400">
        Bonjour ! Voici les publications prévues pour ce mois. Vous pouvez les relire,{' '}
        <strong className="text-emerald-400 font-semibold">valider</strong> en 1 clic ou{' '}
        <strong className="text-amber-400 font-semibold">demander une retouche</strong> si nécessaire.
      </div>

      {/* Main Feed */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 lg:p-6 space-y-6">
        {posts.map((post) => {
          const isApproved = post.status === 'approved';
          const hasChanges = post.status === 'changes_requested';

          return (
            <article
              key={post.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isApproved
                  ? 'bg-zinc-900/40 border-emerald-500/30 shadow-xs'
                  : hasChanges
                  ? 'bg-zinc-900/40 border-amber-500/30'
                  : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/40">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                    {post.week}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-zinc-200">
                      {post.dayOfWeek} {post.scheduledDate}
                    </div>
                    <div className="text-[10px] text-zinc-400 capitalize">
                      {post.format} • {post.platforms.join(', ')}
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                {isApproved ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Validé
                  </span>
                ) : hasChanges ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Retouche transmise
                  </span>
                ) : (
                  <span className="text-[11px] text-zinc-500 font-medium">
                    À valider
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 lg:p-5 space-y-4">
                {/* Visual Section */}
                <div className="rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/80 aspect-video flex items-center justify-center text-center p-4">
                  {post.mediaUrls && post.mediaUrls.length > 0 ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={post.mediaUrls[0]} alt={post.theme} className="w-full h-full object-cover" />
                  ) : (
                    <div className="space-y-1">
                      <Sparkles className="w-7 h-7 text-amber-400 mx-auto opacity-70" />
                      <div className="text-xs font-semibold text-zinc-200">{post.theme}</div>
                      <div className="text-[11px] text-zinc-400 max-w-md mx-auto">{post.creativeBrief}</div>
                    </div>
                  )}
                </div>

                {/* Theme & Caption */}
                <div>
                  <h3 className="font-bold text-sm text-zinc-100 mb-2">
                    {post.theme}
                  </h3>
                  <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-xs text-zinc-200 leading-relaxed whitespace-pre-line">
                    {post.caption}
                  </div>
                </div>

                {/* Product & CTA Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {post.featuredProduct && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium flex items-center gap-2">
                      <Coffee className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>{post.featuredProduct}</span>
                    </div>
                  )}
                  {post.cta && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium flex items-center gap-2">
                      <span>📲</span>
                      <span className="truncate">{post.cta}</span>
                    </div>
                  )}
                </div>

                {/* Existing Comment if any */}
                {post.clientFeedback?.comment && (
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs">
                    <span className="font-semibold text-amber-400 block mb-0.5">Votre note :</span>
                    <p className="text-zinc-300 italic">&quot;{post.clientFeedback.comment}&quot;</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => handleOpenFeedbackModal(post)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Demander une retouche</span>
                </button>

                <button
                  onClick={() => handleApprovePost(post.id)}
                  disabled={isApproved}
                  className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isApproved
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md hover:scale-[1.02]'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{isApproved ? 'Publication Validée' : 'Valider ce post'}</span>
                </button>
              </div>
            </article>
          );
        })}
      </main>

      {/* Modal Retouche Client */}
      {selectedPostForFeedback && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-zinc-100">
                  Demande de retouche
                </h3>
              </div>
              <button
                onClick={() => setSelectedPostForFeedback(null)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-zinc-400">
                Post : <strong className="text-zinc-200">{selectedPostForFeedback.theme}</strong> ({selectedPostForFeedback.scheduledDate})
              </p>
              <textarea
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Ex : Pouvez-vous insister sur le prix de 4 000 FCFA et remplacer la photo du combo par celle avec le Bubble Tea Chaud ?"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:outline-none focus:border-amber-500/60 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setSelectedPostForFeedback(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={!feedbackText.trim()}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  feedbackText.trim()
                    ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Envoyer la consigne</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="p-4 border-t border-zinc-800 text-center text-xs text-zinc-400">
        PostPilot • Développé par Méhdi Traoré pour FruiThé Abidjan • {new Date().getFullYear()}
      </footer>
    </div>
  );
}
