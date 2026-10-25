'use client';

import React, { useState, useEffect } from 'react';
import { usePostPilot } from '@/context/PostPilotContext';
import { Post, PostStatus } from '@/types/post';
import { getStatusBadge, getStatusConfig } from '@/lib/utils';
import { uploadPostMedia } from '@/lib/firebase/storage';
import { 
  X, 
  Upload, 
  Save, 
  Trash2, 
  Smartphone, 
  Radio, 
  Loader2,
  Wand2,
  Check,
  Sparkles,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  CheckCircle2,
  Folder,
  RefreshCw
} from 'lucide-react';
import LinkedInPublishModal from '@/components/post/LinkedInPublishModal';

const STATUS_OPTIONS: { value: PostStatus; label: string }[] = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'pending_review', label: 'En attente' },
  { value: 'changes_requested', label: 'Retouche demandée' },
  { value: 'approved', label: 'Validé par le client' },
  { value: 'scheduled', label: 'Programmé' },
  { value: 'published', label: 'Publié en ligne' },
];

export default function PostDetailModal() {
  const { 
    selectedPost, 
    setSelectedPost, 
    updatePost, 
    updatePostStatus, 
    dispatchToMakeWebhook
  } = usePostPilot();

  const [formData, setFormData] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'ai_prompts' | 'preview'>('details');
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [webhookMsg, setWebhookMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // LinkedIn Publish Modal State
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);

  // Folder Scanner State
  const [isScanningFolder, setIsScanningFolder] = useState(false);
  const [folderScanMsg, setFolderScanMsg] = useState<string | null>(null);

  // Copilote IA State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPost) {
      setFormData({ ...selectedPost });
      setWebhookMsg(null);
      setAiSuggestion(null);
      setFolderScanMsg(null);

      // Auto-scan du dossier correspondant à la date du post si aucun visuel
      if (!selectedPost.mediaUrls || selectedPost.mediaUrls.length === 0) {
        fetch(`/api/visuels/scan?date=${selectedPost.scheduledDate}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.files) && data.files.length > 0) {
              setFormData((prev) => (prev ? { ...prev, mediaUrls: data.files } : prev));
            }
          })
          .catch(() => {});
      }
    }
  }, [selectedPost]);

  if (!selectedPost || !formData) return null;

  const handleAIGenerate = async (action: 'generate_hooks' | 'improve_caption' | 'shorten' | 'add_hashtags' | 'linkedin_5p') => {
    setIsGeneratingAI(true);
    setAiSuggestion(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          workspaceId: formData.workspaceId,
          theme: formData.theme,
          caption: formData.caption,
          featuredProduct: formData.featuredProduct,
          cta: formData.cta,
          format: formData.format,
          platforms: formData.platforms,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setAiSuggestion(data.result);
      }
    } catch {
      //
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCopyAiPrompt = () => {
    if (formData?.aiVisualPrompt) {
      navigator.clipboard.writeText(formData.aiVisualPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    }
  };

  const handleSave = () => {
    updatePost(formData);
    setSelectedPost(null);
  };

  const handleScanFolder = async () => {
    if (!formData?.scheduledDate) return;
    setIsScanningFolder(true);
    setFolderScanMsg(null);
    try {
      const res = await fetch(`/api/visuels/scan?date=${formData.scheduledDate}`);
      const data = await res.json();
      setIsScanningFolder(false);
      if (data.success && Array.isArray(data.files) && data.files.length > 0) {
        const combined = [...new Set([...formData.mediaUrls, ...data.files])];
        setFormData((prev) => (prev ? { ...prev, mediaUrls: combined } : prev));
        setFolderScanMsg(`${data.files.length} visuel(s) trouvé(s) et chargé(s) depuis le dossier !`);
      } else {
        setFolderScanMsg(`Dossier prêt : public/visuels/${formData.scheduledDate}/ (aucun fichier pour le moment)`);
      }
    } catch {
      setIsScanningFolder(false);
      setFolderScanMsg("Erreur lors de l'analyse du dossier.");
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    setUploadProgress(10);

    try {
      const newUrls: string[] = [...formData.mediaUrls];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadedUrl = await uploadPostMedia(
          formData.workspaceId,
          formData.id,
          file,
          (percent) => setUploadProgress(percent),
          formData.scheduledDate
        );
        newUrls.push(uploadedUrl);
      }

      setFormData((prev) => (prev ? { ...prev, mediaUrls: newUrls } : prev));
      setUploadProgress(null);
    } catch (err: unknown) {
      setUploadProgress(null);
      const msg = err instanceof Error ? err.message : 'Erreur de téléversement';
      setUploadError(msg);
    }
  };

  const handleRemoveMedia = (indexToRemove: number) => {
    setFormData({
      ...formData,
      mediaUrls: formData.mediaUrls.filter((_, idx) => idx !== indexToRemove),
    });
  };

  const handleTriggerWebhook = async () => {
    setIsSendingWebhook(true);
    setWebhookMsg(null);
    const res = await dispatchToMakeWebhook(formData);
    setIsSendingWebhook(false);
    if (res.success) {
      setWebhookMsg({ type: 'success', text: 'Webhook Make.com déclenché avec succès !' });
      updatePostStatus(formData.id, 'scheduled');
    } else {
      setWebhookMsg({ type: 'error', text: res.message });
    }
  };

  const statusBadge = getStatusBadge(formData.status);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#0d0e12] border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-2xl sm:rounded-xl w-full max-w-4xl max-h-[94dvh] sm:max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-zinc-900 dark:text-zinc-100">
        
        {/* Mobile Grab Handle */}
        <div className="sm:hidden w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-2" />

        {/* Modal Top Header */}
        <div className="p-3 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-mono text-xs px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shrink-0">
              {formData.week}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-zinc-950 dark:text-zinc-50 text-xs sm:text-sm max-w-[180px] sm:max-w-md truncate">{formData.theme}</h3>
                <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded border ${statusBadge.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                  <span>{statusBadge.label}</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 font-mono mt-0.5">
                {formData.scheduledDate} • {formData.dayOfWeek} • {formData.time || '11:30'}
              </p>
            </div>
          </div>

          {/* Tab Selector & Close */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-0.5 text-xs">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-2 sm:px-3 py-1 rounded text-xs font-medium transition-all ${
                  activeTab === 'details'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs font-semibold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                <span className="sm:hidden">Fiche</span>
                <span className="hidden sm:inline">Fiche Édition</span>
              </button>
              <button
                onClick={() => setActiveTab('ai_prompts')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded text-xs font-medium transition-all ${
                  activeTab === 'ai_prompts'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs font-semibold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span className="sm:hidden">IA</span>
                <span className="hidden sm:inline">Affiches & Prompts</span>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded text-xs font-medium transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs font-semibold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="sm:hidden">Rendu</span>
                <span className="hidden sm:inline">Rendu Mobile</span>
              </button>
            </div>

            <button
              onClick={() => setSelectedPost(null)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-[#0d0e12]">
          {activeTab === 'details' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Post Content & Copywriting */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                    Thème / Titre de la publication
                  </label>
                  <input
                    type="text"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Contenu détaillé (Légende du post)
                    </label>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {formData.caption.length} caractères
                    </span>
                  </div>

                  {/* AI Copilot Prompt Bar */}
                  <div className="mb-2 p-2 rounded-md bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-900 dark:text-zinc-100">
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Copilote Éditorial</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 font-mono">
                          {formData.workspaceId === 'fruithe' ? 'FruiThé Abidjan' : 'LinkedIn 5P'}
                        </span>
                      </span>

                      {isGeneratingAI && (
                        <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Génération...</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleAIGenerate('generate_hooks')}
                        disabled={isGeneratingAI}
                        className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[10px] font-medium transition-all"
                      >
                        3 Accroches
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAIGenerate('improve_caption')}
                        disabled={isGeneratingAI}
                        className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[10px] font-medium transition-all"
                      >
                        Optimiser légende
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAIGenerate('shorten')}
                        disabled={isGeneratingAI}
                        className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[10px] font-medium transition-all"
                      >
                        Raccourcir
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAIGenerate('add_hashtags')}
                        disabled={isGeneratingAI}
                        className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[10px] font-medium transition-all"
                      >
                        Hashtags
                      </button>

                      {formData.workspaceId === 'mehdi-traore' && (
                        <button
                          type="button"
                          onClick={() => handleAIGenerate('linkedin_5p')}
                          disabled={isGeneratingAI}
                          className="px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[10px] font-medium transition-all"
                        >
                          Méthode 5P
                        </button>
                      )}
                    </div>
                  </div>

                  {/* AI Suggestion Box */}
                  {aiSuggestion && (
                    <div className="mb-2 p-3 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-[11px] flex items-center gap-1">
                          <span>Suggestion :</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setAiSuggestion(null)}
                          className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-2.5 rounded bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-[11px] whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto font-sans">
                        {aiSuggestion}
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, caption: aiSuggestion });
                            setAiSuggestion(null);
                          }}
                          className="px-2.5 py-1 rounded bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold text-[10px] transition-all"
                        >
                          Remplacer la légende
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, caption: `${aiSuggestion}\n\n${formData.caption}` });
                            setAiSuggestion(null);
                          }}
                          className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[10px] transition-all"
                        >
                          Insérer en haut
                        </button>
                      </div>
                    </div>
                  )}

                  <textarea
                    rows={7}
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    placeholder="Saisissez la légende..."
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 leading-relaxed font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                      Produit mis en avant
                    </label>
                    <input
                      type="text"
                      value={formData.featuredProduct || ''}
                      onChange={(e) => setFormData({ ...formData, featuredProduct: e.target.value })}
                      placeholder="Ex: Brown Sugar Tapioca"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                      Appel à l&apos;action (CTA)
                    </label>
                    <input
                      type="text"
                      value={formData.cta}
                      onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                      placeholder="Ex: Commander au 05 96 93 50 50"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Client Feedback Banner */}
                {formData.clientFeedback?.comment && (
                  <div className="p-3 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mb-0.5">Note de retouche :</span>
                    <p className="text-zinc-600 dark:text-zinc-400 italic font-mono">&quot;{formData.clientFeedback.comment}&quot;</p>
                  </div>
                )}
              </div>

              {/* Right Column: Creative Assets & Platforms */}
              <div className="space-y-4">
                
                {/* Visual Assets Upload Dropzone */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Visuel Créatif (Canva / Photoshop / Photos)
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('ai_prompts')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Studio Affiches IA</span>
                    </button>
                  </div>

                  {/* Architecture Dossier Local du Post */}
                  <div className="mb-3 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                        <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Dossier local de ce post :</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleScanFolder}
                        disabled={isScanningFolder}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <RefreshCw className={`w-3 h-3 ${isScanningFolder ? 'animate-spin' : ''}`} />
                        <span>Scanner le dossier</span>
                      </button>
                    </div>
                    <p className="font-mono text-[11px] text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-950 p-1.5 rounded border border-zinc-200 dark:border-zinc-800 truncate select-all">
                      public/visuels/{formData.scheduledDate}/
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Déposez simplement votre affiche dans ce dossier, puis cliquez sur « Scanner ».
                    </p>
                    {folderScanMsg && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {folderScanMsg}
                      </p>
                    )}
                  </div>

                  {uploadProgress !== null && (
                    <div className="mb-2 p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono">
                      Téléversement : {uploadProgress}%
                    </div>
                  )}

                  {uploadError && (
                    <div className="mb-2 p-2 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-[11px]">
                      {uploadError}
                    </div>
                  )}

                  {formData.mediaUrls.length > 0 ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {formData.mediaUrls.map((url, idx) => (
                          <div key={idx} className="relative rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800 group aspect-video bg-zinc-100 dark:bg-zinc-900">
                            {url.match(/\.(mp4|webm|mov)$/i) ? (
                              <video src={url} controls className="w-full h-full object-cover" />
                            ) : (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={url} alt="Visuel" className="w-full h-full object-cover" />
                            )}
                            <button
                              onClick={() => handleRemoveMedia(idx)}
                              className="absolute top-1 right-1 p-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] text-zinc-600 dark:text-zinc-400 hover:underline font-mono">
                        <Upload className="w-3 h-3" />
                        <span>Ajouter un autre visuel</span>
                        <input type="file" onChange={handleMediaUpload} accept="image/*,video/*" multiple className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <label className="border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 bg-zinc-50 dark:bg-zinc-900/40 rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                      <Upload className="w-5 h-5 text-zinc-400 mb-1" />
                      <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                        Glissez le visuel Canva ou Photoshop
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        PNG, JPG ou MP4
                      </p>
                      <input type="file" onChange={handleMediaUpload} accept="image/*,video/*" multiple className="hidden" />
                    </label>
                  )}
                </div>

                {/* Creative Brief Note */}
                <div>
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                    Direction Artistique (Note créative)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.creativeBrief}
                    onChange={(e) => setFormData({ ...formData, creativeBrief: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                  />
                </div>

                {/* Workflow Status Selector: Interactive Status Chip Grid */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Statut de la publication
                    </label>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Sélectionnez un état
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {STATUS_OPTIONS.map((opt) => {
                      const isSelected = formData.status === opt.value;
                      const optConf = getStatusConfig(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, status: opt.value })}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer ${
                            isSelected
                              ? `${optConf.badgeClass} ring-2 ring-zinc-950 dark:ring-white shadow-xs`
                              : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 ${optConf.dotClass}`} />
                          <span className="truncate">{opt.label}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 ml-auto shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {webhookMsg && (
                  <div className="p-2.5 rounded text-xs border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                    {webhookMsg.text}
                  </div>
                )}

              </div>
            </div>
          ) : activeTab === 'ai_prompts' ? (
            /* Tab AI Prompts & Posters */
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Studio Header Banner */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-zinc-50 via-zinc-100/50 to-indigo-50/40 dark:from-zinc-900/90 dark:via-zinc-900 dark:to-indigo-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Studio Affiches & Prompts IA</h4>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        Ratio 4:5 LinkedIn (1080×1350px)
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Prompt calibré pour ChatGPT (DALL-E 3 / Canvas) et sources requises pour créer l&apos;affiche.
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleCopyAiPrompt}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 self-start sm:self-auto cursor-pointer ${
                    copiedPrompt
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-zinc-900 text-white dark:bg-white dark:text-black hover:opacity-90'
                  }`}
                >
                  {copiedPrompt ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Prompt Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copier le Prompt ChatGPT</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 7 Cols: Prompt & Sources */}
                <div className="lg:col-span-7 space-y-5">
                  
                  {/* Prompt Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span>Prompt Optimisé ChatGPT / DALL-E 3</span>
                      </label>
                      <span className="text-[10px] font-mono text-zinc-400">
                        Éditable en direct
                      </span>
                    </div>

                    <div className="relative">
                      <textarea
                        rows={8}
                        value={formData.aiVisualPrompt || ''}
                        onChange={(e) => setFormData({ ...formData, aiVisualPrompt: e.target.value })}
                        placeholder="Collez ou rédigez un prompt d'affiche pour ChatGPT..."
                        className="w-full bg-zinc-900 text-zinc-100 border border-zinc-700/80 rounded-lg p-3.5 text-xs leading-relaxed font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 selection:bg-indigo-500/30"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
                      💡 Copiez ce prompt dans ChatGPT (GPT-4o ou Canvas) avec votre photo en pièce jointe pour générer l&apos;affiche finale.
                    </p>
                  </div>

                  {/* Sources Required List */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>Sources & Matières Premières à Fournir à ChatGPT</span>
                    </label>

                    <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-2.5">
                      {(formData.aiPromptSources && formData.aiPromptSources.length > 0) ? (
                        <ul className="space-y-2.5">
                          {formData.aiPromptSources.map((source, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 leading-normal">
                              <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[10px] font-mono flex items-center justify-center shrink-0 mt-0.5 font-bold">
                                {idx + 1}
                              </span>
                              <span>{source}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-zinc-500 italic">
                          Téléversez votre photo ou votre charte graphique pour enrichir les sources de ce post.
                        </p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right 5 Cols: Inspiration Poster & Web References */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-500" />
                      <span>Affiche Inspiration (Référence Web)</span>
                    </label>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Standard Agence
                    </span>
                  </div>

                  {formData.inspirationUrls && formData.inspirationUrls.length > 0 ? (
                    <div className="space-y-3">
                      <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 shadow-md group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={formData.inspirationUrls[0]} 
                          alt="Affiche Inspiration" 
                          className="w-full aspect-[4/5] object-contain bg-zinc-950" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-4">
                          <a
                            href={formData.inspirationUrls[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-black text-xs font-semibold self-start shadow-md hover:bg-zinc-200 transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Voir en Plein Écran (HD)</span>
                          </a>
                        </div>
                      </div>

                      {/* Quick Action: Use this inspiration as official media */}
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.inspirationUrls && formData.inspirationUrls.length > 0) {
                            const insp = formData.inspirationUrls[0];
                            if (!formData.mediaUrls.includes(insp)) {
                              setFormData({
                                ...formData,
                                mediaUrls: [insp, ...formData.mediaUrls]
                              });
                            }
                          }
                        }}
                        className="w-full py-2 px-3 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-100 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Adopter cette affiche comme visuel du post</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center space-y-2 bg-zinc-50 dark:bg-zinc-900/40">
                      <ImageIcon className="w-6 h-6 text-zinc-400 mx-auto" />
                      <p className="text-xs text-zinc-500">Aucune affiche d&apos;inspiration rattachée.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Tab Preview: Clean Smartphone Simulator */
            <div className="flex justify-center py-2">
              <div className="w-[330px] bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-800 rounded-2xl p-3 shadow-xl overflow-hidden">
                <div className="w-16 h-3 bg-zinc-300 dark:bg-zinc-800 rounded-full mx-auto mb-3" />

                <div className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden text-xs">
                  <div className="p-3 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                      {formData.workspaceId === 'fruithe' ? 'fruithe_abidjan' : 'mehdi_traore'}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">Aperçu</span>
                  </div>

                  <div className="aspect-square bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-center p-4">
                    {formData.mediaUrls.length > 0 ? (
                      formData.mediaUrls[0].match(/\.(mp4|webm|mov)$/i) ? (
                        <video src={formData.mediaUrls[0]} controls className="w-full h-full object-cover" />
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={formData.mediaUrls[0]} alt="Aperçu" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{formData.theme}</p>
                        <p className="text-[10px] text-zinc-400 max-w-[200px]">{formData.creativeBrief}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 space-y-2">
                    <p className="text-zinc-800 dark:text-zinc-200 text-xs whitespace-pre-line leading-relaxed">
                      {formData.caption}
                    </p>

                    {formData.featuredProduct && (
                      <div className="text-[11px] font-mono font-medium text-zinc-900 dark:text-zinc-100 border-t border-zinc-100 dark:border-zinc-900 pt-1.5">
                        {formData.featuredProduct}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls (Thumb zone & Safe area) */}
        <div className="p-3 sm:p-4 pb-[calc(env(safe-area-inset-bottom)+12px)] sm:pb-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {/* Bouton Publier sur LinkedIn */}
            <button
              onClick={() => setIsLinkedInModalOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-lg text-xs font-bold transition-all shadow-xs active:scale-[0.98] shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Publier sur LinkedIn</span>
            </button>

            <button
              onClick={handleTriggerWebhook}
              disabled={isSendingWebhook}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-medium transition-all"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{isSendingWebhook ? 'Envoi...' : 'Webhook Make.com'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setSelectedPost(null)}
              className="px-3 sm:px-4 py-2 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 sm:border-0"
            >
              Fermer
            </button>
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 bg-zinc-950 dark:bg-white text-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 transition-all active:scale-[0.98] shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Enregistrer</span>
            </button>
          </div>
        </div>

      </div>

      {/* LinkedIn Publish Modal */}
      {formData && (
        <LinkedInPublishModal
          isOpen={isLinkedInModalOpen}
          onClose={() => setIsLinkedInModalOpen(false)}
          post={formData}
          onPublished={() => {
            setFormData((prev) => (prev ? { ...prev, status: 'published' } : prev));
          }}
        />
      )}
    </div>
  );
}
