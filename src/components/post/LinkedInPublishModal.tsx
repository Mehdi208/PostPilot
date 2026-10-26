'use client';

import React, { useState, useEffect } from 'react';
import { Post } from '@/types/post';
import { usePostPilot } from '@/context/PostPilotContext';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Send, 
  Radio, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  Image as ImageIcon,
  CheckCheck
} from 'lucide-react';

interface LinkedInPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onPublished?: () => void;
}

export default function LinkedInPublishModal({
  isOpen,
  onClose,
  post,
  onPublished,
}: LinkedInPublishModalProps) {
  const { activeWorkspace, updatePostStatus, setWorkspaceWebhookUrl } = usePostPilot();

  const [copiedText, setCopiedText] = useState(false);
  const [activeTab, setActiveTab] = useState<'webhook' | 'direct'>('webhook');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Initialisation et restauration automatique du webhook persistant
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = 
        activeWorkspace.webhookUrl || 
        localStorage.getItem(`postpilot_webhook_${activeWorkspace.id}`) || 
        localStorage.getItem('postpilot_linkedin_webhook_url') || 
        '';
      setWebhookUrl(saved);
    }
  }, [activeWorkspace.id, activeWorkspace.webhookUrl]);

  if (!isOpen) return null;

  const handleWebhookChange = (val: string) => {
    setWebhookUrl(val);
    setWorkspaceWebhookUrl(activeWorkspace.id, val);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(post.caption);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  const handleOpenLinkedInAndCopy = () => {
    navigator.clipboard.writeText(post.caption);
    setCopiedText(true);

    // Ouvre le compositeur natif LinkedIn dans un nouvel onglet
    window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener,noreferrer');

    setStatusMessage({
      type: 'info',
      text: 'Texte copié dans le presse-papier ! Collez-le (Ctrl+V) dans la fenêtre LinkedIn qui vient de s\'ouvrir.',
    });
  };

  const handleMarkAsPublished = () => {
    updatePostStatus(post.id, 'published');
    if (onPublished) onPublished();
    setStatusMessage({
      type: 'success',
      text: 'Publication marquée comme « Publié en ligne » dans PostPilot !',
    });
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleSendViaWebhook = async () => {
    const effectiveUrl = webhookUrl.trim() || 
      (typeof window !== 'undefined' ? (localStorage.getItem('postpilot_linkedin_webhook_url') || localStorage.getItem(`postpilot_webhook_${activeWorkspace.id}`) || '') : '');

    if (!effectiveUrl) {
      setStatusMessage({
        type: 'error',
        text: 'Veuillez renseigner votre URL de Webhook Make.com ci-dessous.',
      });
      return;
    }

    // Sauvegarde persistante immédiate
    setWorkspaceWebhookUrl(activeWorkspace.id, effectiveUrl);

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/linkedin/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: post.caption,
          mediaUrls: post.mediaUrls,
          theme: post.theme,
          postId: post.id,
          workspaceId: post.workspaceId,
          webhookUrl: effectiveUrl,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: data.message || 'Publication transmise avec succès à LinkedIn !',
        });
        updatePostStatus(post.id, 'published');
        if (onPublished) onPublished();
      } else if (data.requiresSetup) {
        setStatusMessage({
          type: 'info',
          text: 'Aucun webhook configuré. Veuillez coller votre URL de Webhook Make.com ci-dessous.',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Erreur lors de l\'envoi au webhook.',
        });
      }
    } catch {
      setIsSubmitting(false);
      setStatusMessage({
        type: 'error',
        text: 'Impossible de joindre le service de publication.',
      });
    }
  };

  const visualUrl = post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls[0] : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A66C2] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              in
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                <span>Publier sur LinkedIn</span>
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#0A66C2] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {post.dayOfWeek} {post.scheduledDate}
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-md">
                {post.theme}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 px-4 pt-2">
          <button
            onClick={() => setActiveTab('webhook')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'webhook'
                ? 'border-[#0A66C2] text-[#0A66C2] dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Automatisation Webhook (Make.com)</span>
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'direct'
                ? 'border-[#0A66C2] text-[#0A66C2] dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Publication 1-Clic</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Status Alert if any */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              ) : (
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
              )}
              <span className="text-xs leading-relaxed">{statusMessage.text}</span>
            </div>
          )}

          {/* Bloc Visuel Partagé pour les deux onglets */}
          {visualUrl ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 bg-zinc-950 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={visualUrl} alt="Visuel Importé" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Affiche importée prête pour LinkedIn
                  </p>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Votre visuel ChatGPT / Canva sera transmis directement à Make.com et publié sur LinkedIn.
                </p>
              </div>
              <a
                href={visualUrl}
                download={`post-${post.scheduledDate}-affiche.jpg`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-[11px] font-medium transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger</span>
              </a>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50">
              <ImageIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                  Aucun visuel importé pour ce post
                </p>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80 mt-0.5">
                  Vous pouvez copier le prompt dans l&apos;onglet <strong>« Studio Affiches IA »</strong> pour générer votre affiche avec ChatGPT, puis l&apos;importer dans la publication avant de publier.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'webhook' ? (
            <div className="space-y-4">
              
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-[#0A66C2]" />
                      <span>Publication Automatique Make.com</span>
                    </h3>
                    <p className="text-zinc-500 text-[11px] mt-0.5">
                      Transmet automatiquement le texte et votre affiche importée à votre scénario Make connecté à LinkedIn.
                    </p>
                  </div>
                  {webhookUrl && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <CheckCheck className="w-3 h-3" />
                      Mémorisé
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-semibold">
                      URL du Webhook Make.com :
                    </label>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Sauvegarde persistante automatique
                    </span>
                  </div>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => handleWebhookChange(e.target.value)}
                    placeholder="https://hook.eu1.make.com/xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-[#0A66C2]"
                  />
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 italic">
                    💡 Cette URL est enregistrée automatiquement. Vous n&apos;avez plus besoin de la renseigner pour les autres publications.
                  </p>
                </div>

                <button
                  onClick={handleSendViaWebhook}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Publication en cours sur LinkedIn...' : 'Déclencher la publication automatique'}</span>
                </button>
              </div>

              {/* Aperçu du Texte */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] uppercase font-bold text-zinc-400">
                    Texte envoyé à LinkedIn ({post.caption.length} caractères) :
                  </span>
                  <button
                    onClick={handleCopyText}
                    className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedText ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-h-40 overflow-y-auto font-sans whitespace-pre-line text-zinc-800 dark:text-zinc-200 leading-relaxed text-xs">
                  {post.caption}
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Direct 1-Click Launch Button */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                      Publier en 2 secondes
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-0.5">
                      Copie automatiquement votre texte et ouvre le créateur de post LinkedIn.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleOpenLinkedInAndCopy}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0A66C2] hover:bg-[#084e96] text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.99] cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ouvrir LinkedIn & Copier le Texte (Recommandé)</span>
                </button>
              </div>

              {/* Aperçu du Texte Complet */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] uppercase font-bold text-zinc-400">
                    Contenu prêt pour LinkedIn ({post.caption.length} caractères) :
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {post.format.toUpperCase()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-h-48 overflow-y-auto font-sans whitespace-pre-line text-zinc-800 dark:text-zinc-200 leading-relaxed text-xs selection:bg-blue-200 dark:selection:bg-blue-900">
                  {post.caption}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800 cursor-pointer"
          >
            Fermer
          </button>

          <button
            onClick={handleMarkAsPublished}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-[0.98] cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Valider comme « Publié en ligne »</span>
          </button>
        </div>

      </div>
    </div>
  );
}
