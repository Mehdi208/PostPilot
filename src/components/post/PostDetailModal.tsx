'use client';

import React, { useState, useEffect } from 'react';
import { usePostPilot } from '@/context/PostPilotContext';
import { Post, PostStatus } from '@/types/post';
import { getStatusBadge } from '@/lib/utils';
import { uploadPostMedia } from '@/lib/firebase/storage';
import { 
  X, 
  Upload, 
  Save, 
  Trash2, 
  CheckCircle2, 
  MessageSquare, 
  Smartphone, 
  Radio, 
  Sparkles,
  Loader2,
  Wand2,
  Lightbulb,
  Zap,
  Hash,
  ArrowDown
} from 'lucide-react';

export default function PostDetailModal() {
  const { 
    selectedPost, 
    setSelectedPost, 
    updatePost, 
    updatePostStatus, 
    dispatchToMakeWebhook
  } = usePostPilot();

  const [formData, setFormData] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'preview'>('details');
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [webhookMsg, setWebhookMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Copilote IA State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiActionType, setAiActionType] = useState<string>('');

  useEffect(() => {
    if (selectedPost) {
      setFormData({ ...selectedPost });
      setWebhookMsg(null);
      setAiSuggestion(null);
    }
  }, [selectedPost]);

  if (!selectedPost || !formData) return null;

  const handleAIGenerate = async (action: 'generate_hooks' | 'improve_caption' | 'shorten' | 'add_hashtags' | 'linkedin_5p') => {
    setIsGeneratingAI(true);
    setAiActionType(action);
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

  const handleSave = () => {
    updatePost(formData);
    setSelectedPost(null);
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
          (percent) => setUploadProgress(percent)
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
              {formData.week}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-zinc-100 text-sm">{formData.theme}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusBadge.color}`}>
                  {statusBadge.label}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                {formData.scheduledDate} • {formData.dayOfWeek} • {formData.time || '11:30'}
              </p>
            </div>
          </div>

          {/* Tab Selector & Close */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'details'
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Fiche Édition (12 Col.)
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1 px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'preview'
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>Rendu Mobile</span>
              </button>
            </div>

            <button
              onClick={() => setSelectedPost(null)}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-950">
          {activeTab === 'details' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Post Content & Copywriting */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Thème / Titre de la publication
                  </label>
                  <input
                    type="text"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500/60 font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      Contenu détaillé (Légende du post)
                    </label>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {formData.caption.length} caractères
                    </span>
                  </div>

                  {/* AI Copilot Prompt Bar */}
                  <div className="mb-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-400">
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Copilote IA Contextualisé</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                          {formData.workspaceId === 'fruithe' ? 'Mode FruiThé 225' : 'Méthode 5P'}
                        </span>
                      </span>

                      {isGeneratingAI && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Génération...</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleAIGenerate('generate_hooks')}
                        disabled={isGeneratingAI}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-medium transition-all flex items-center gap-1"
                      >
                        <Lightbulb className="w-3 h-3 text-amber-400" />
                        <span>3 Hooks Viraux</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAIGenerate('improve_caption')}
                        disabled={isGeneratingAI}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-medium transition-all flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>Sublimer le texte</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAIGenerate('shorten')}
                        disabled={isGeneratingAI}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-medium transition-all flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3 text-cyan-400" />
                        <span>Raccourcir (TikTok/Reel)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAIGenerate('add_hashtags')}
                        disabled={isGeneratingAI}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-medium transition-all flex items-center gap-1"
                      >
                        <Hash className="w-3 h-3 text-emerald-400" />
                        <span>Hashtags ciblés</span>
                      </button>

                      {formData.workspaceId === 'mehdi-traore' && (
                        <button
                          type="button"
                          onClick={() => handleAIGenerate('linkedin_5p')}
                          disabled={isGeneratingAI}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-medium transition-all flex items-center gap-1"
                        >
                          <span>💼 Méthode 5P</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* AI Suggestion Box */}
                  {aiSuggestion && (
                    <div className="mb-2 p-3 rounded-lg bg-purple-950/20 border border-purple-500/30 text-xs space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-purple-300 text-[11px] flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          <span>Suggestion IA ({aiActionType}) :</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setAiSuggestion(null)}
                          className="text-zinc-500 hover:text-zinc-300 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-2.5 rounded bg-zinc-950/80 border border-zinc-800 text-zinc-200 text-[11px] whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                        {aiSuggestion}
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, caption: aiSuggestion });
                            setAiSuggestion(null);
                          }}
                          className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[10px] transition-all"
                        >
                          Remplacer la légende
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, caption: `${aiSuggestion}\n\n${formData.caption}` });
                            setAiSuggestion(null);
                          }}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] transition-all flex items-center gap-1"
                        >
                          <ArrowDown className="w-3 h-3" />
                          <span>Insérer en haut</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, caption: `${formData.caption}\n\n${aiSuggestion}` });
                            setAiSuggestion(null);
                          }}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] transition-all"
                        >
                          Ajouter en bas
                        </button>
                      </div>
                    </div>
                  )}

                  <textarea
                    rows={7}
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    placeholder="Saisissez la légende complète avec accroche, nouchi subtil et emojis..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/60 leading-relaxed font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Boisson / Produit mis en avant
                    </label>
                    <input
                      type="text"
                      value={formData.featuredProduct || ''}
                      onChange={(e) => setFormData({ ...formData, featuredProduct: e.target.value })}
                      placeholder="Ex: Strawberry Matcha (4 000 FCFA)"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-amber-400 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Call to Action (CTA)
                    </label>
                    <input
                      type="text"
                      value={formData.cta}
                      onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                      placeholder="Ex: Commander sur WhatsApp"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200"
                    />
                  </div>
                </div>

                {/* Client Feedback Banner if present */}
                {formData.clientFeedback?.comment && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-rose-400 mb-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>Note de retouche de la cliente :</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed italic bg-zinc-950/60 p-2 rounded">
                      &quot;{formData.clientFeedback.comment}&quot;
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Creative Assets, Platforms & Settings */}
              <div className="space-y-4">
                
                {/* Visual Assets Upload Dropzone (Canva / Photoshop) */}
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Visuel Créatif (Canva / Photoshop / Photos réelles)
                  </label>
                  
                  {/* Upload Progress Indicator */}
                  {uploadProgress !== null && (
                    <div className="mb-2 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5 animate-in fade-in">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Téléversement vers le Cloud...</span>
                        </span>
                        <span className="font-mono text-zinc-300 font-bold">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all duration-150"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <div className="mb-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px]">
                      {uploadError}
                    </div>
                  )}

                  {formData.mediaUrls.length > 0 ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {formData.mediaUrls.map((url, idx) => (
                          <div key={idx} className="relative rounded-lg overflow-hidden border border-zinc-800 group aspect-video bg-zinc-900">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="Visuel uploadé" className="w-full h-full object-cover" />
                            <button
                              onClick={() => handleRemoveMedia(idx)}
                              className="absolute top-1.5 right-1.5 p-1 rounded bg-black/70 hover:bg-rose-600 text-white transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium">
                        <Upload className="w-3 h-3" />
                        <span>Ajouter un autre visuel</span>
                        <input type="file" onChange={handleMediaUpload} accept="image/*,video/*" multiple className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                      <Upload className="w-6 h-6 text-amber-400 mb-2" />
                      <p className="text-xs font-medium text-zinc-200">
                        Glissez votre visuel Canva / Photoshop
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        PNG, JPG ou MP4 (Zéro usine à gaz IA)
                      </p>
                      <input type="file" onChange={handleMediaUpload} accept="image/*,video/*" multiple className="hidden" />
                    </label>
                  )}
                </div>

                {/* Creative Brief Note from Spreadsheet */}
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Direction Artistique (Colonne Créative Excel)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.creativeBrief}
                    onChange={(e) => setFormData({ ...formData, creativeBrief: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                {/* Workflow Status Selector */}
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Statut dans le workflow
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as PostStatus })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="draft">Brouillon (Draft)</option>
                    <option value="pending_review">En attente validation client (Pending Review)</option>
                    <option value="changes_requested">Retouche demandée (Changes Requested)</option>
                    <option value="approved">Validé par le client (Approved)</option>
                    <option value="scheduled">Programmé (Scheduled)</option>
                    <option value="published">Publié (Published)</option>
                  </select>
                </div>

                {/* Webhook Feedback Message */}
                {webhookMsg && (
                  <div className={`p-2.5 rounded-lg text-xs flex items-center gap-1.5 ${
                    webhookMsg.type === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {webhookMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <span>{webhookMsg.text}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Tab Preview: Smartphone Simulator */
            <div className="flex justify-center py-2">
              <div className="w-[340px] bg-zinc-900 border-4 border-zinc-800 rounded-[32px] p-3 shadow-2xl overflow-hidden">
                {/* Speaker Notch */}
                <div className="w-24 h-4 bg-zinc-800 rounded-full mx-auto mb-3" />

                {/* Simulated Social Card */}
                <div className="bg-zinc-950 rounded-2xl border border-zinc-800/80 overflow-hidden text-xs">
                  {/* Account Header */}
                  <div className="p-3 flex items-center justify-between border-b border-zinc-900">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs">
                        🧋
                      </div>
                      <div>
                        <div className="font-bold text-zinc-100 text-[11px]">fruithe_abidjan</div>
                        <div className="text-[9px] text-zinc-500">Riviera Bonoumin • Face Abidjan Mall</div>
                      </div>
                    </div>
                  </div>

                  {/* Creative Media Preview */}
                  <div className="aspect-square bg-zinc-900 flex items-center justify-center text-center p-4">
                    {formData.mediaUrls.length > 0 ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={formData.mediaUrls[0]} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="space-y-1">
                        <Sparkles className="w-8 h-8 text-amber-500 mx-auto opacity-60" />
                        <p className="text-xs font-semibold text-zinc-300">{formData.theme}</p>
                        <p className="text-[10px] text-zinc-500 max-w-[200px]">{formData.creativeBrief}</p>
                      </div>
                    )}
                  </div>

                  {/* Caption & CTAs */}
                  <div className="p-3 space-y-2">
                    <p className="text-zinc-200 text-[11px] whitespace-pre-line leading-relaxed">
                      {formData.caption}
                    </p>

                    {formData.featuredProduct && (
                      <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold text-[11px]">
                        🧋 {formData.featuredProduct}
                      </div>
                    )}

                    <div className="pt-1 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span>📲</span>
                      <span>{formData.cta}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerWebhook}
              disabled={isSendingWebhook}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-all"
              title="Envoyer le payload vers Make.com pour diffusion"
            >
              <Radio className="w-3.5 h-3.5 text-purple-400" />
              <span>{isSendingWebhook ? 'Envoi...' : 'Passerelle Make.com'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedPost(null)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
            >
              Fermer
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg text-xs font-semibold transition-all shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Enregistrer les modifications</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
