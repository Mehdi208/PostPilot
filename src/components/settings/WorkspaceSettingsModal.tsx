'use client';

import React, { useState } from 'react';
import { usePostPilot } from '@/context/PostPilotContext';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { batchSavePostsToFirestore } from '@/lib/firebase/firestore';
import { 
  X, 
  Settings, 
  Cloud, 
  Radio, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkspaceSettingsModal({ isOpen, onClose }: WorkspaceSettingsModalProps) {
  const { activeWorkspace, setActiveWorkspace, posts } = usePostPilot();

  const [clientName, setClientName] = useState(activeWorkspace.clientName || 'Responsable FruiThé');
  const [clientPhone, setClientPhone] = useState(activeWorkspace.clientPhone || '+225 0596935050');
  const [webhookUrl, setWebhookUrl] = useState(activeWorkspace.webhookUrl || '');
  const [previewToken, setPreviewToken] = useState(activeWorkspace.previewToken);
  const [copied, setCopied] = useState(false);

  // Webhook Test state
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<{ success: boolean; message: string } | null>(null);

  // Cloud Sync state
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [cloudSyncResult, setCloudSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const clientPreviewUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/preview/${previewToken}`
    : `/preview/${previewToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(clientPreviewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateToken = () => {
    const newToken = `${activeWorkspace.id}-auth-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
    setPreviewToken(newToken);
  };

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    setWebhookResult(null);

    try {
      const samplePost = posts[0] || {
        id: 'test-webhook-sample',
        theme: 'Test Publication Make.com',
        caption: 'Ceci est un test de passerelle automatique PostPilot -> Make.com 🚀',
        scheduledDate: '2026-10-05',
        platforms: ['facebook', 'instagram'],
        format: 'image',
        cta: 'Commander au 05 96 93 50 50',
      };

      const res = await fetch('/api/webhook/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'webhook.ping',
          workspace: activeWorkspace.id,
          post: samplePost,
        }),
      });

      const data = await res.json();
      setIsTestingWebhook(false);
      setWebhookResult({
        success: res.ok,
        message: data.message || 'Réponse reçue avec succès du serveur.',
      });
    } catch {
      setIsTestingWebhook(false);
      setWebhookResult({
        success: false,
        message: 'Erreur lors de la tentative de déclenchement du webhook.',
      });
    }
  };

  const handleSaveSettings = () => {
    const updated = {
      ...activeWorkspace,
      clientName,
      clientPhone,
      webhookUrl: webhookUrl.trim() || undefined,
      previewToken,
    };
    setActiveWorkspace(updated);
    onClose();
  };

  const handleSyncToFirestore = async () => {
    setIsSyncingCloud(true);
    setCloudSyncResult(null);

    const res = await batchSavePostsToFirestore(activeWorkspace.id, posts);
    setIsSyncingCloud(false);

    if (res.success) {
      setCloudSyncResult({
        success: true,
        message: `${res.count} publications synchronisées avec succès dans Firestore Cloud !`,
      });
    } else {
      setCloudSyncResult({
        success: false,
        message: res.error || 'Erreur lors de la synchronisation Firestore.',
      });
    }
  };

  const isCloudConnected = isFirebaseConfigured();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-800 text-amber-400 border border-zinc-700/60">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-100">
                Paramètres du Workspace — {activeWorkspace.name}
              </h3>
              <p className="text-xs text-zinc-400">
                Configuration du portail client, des passerelles Webhook et du Cloud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-zinc-300">
          
          {/* Section 1: Informations Client (FruiThé Abidjan) */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <h4 className="font-semibold text-zinc-100 flex items-center gap-1.5 text-xs">
              <span>👤</span>
              <span>Coordonnées Client & Validation</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Nom du Contact / Responsable</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500/60"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Numéro WhatsApp Client (CTA)</label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+225 0596935050"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500/60 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Portail Client Étanche (/preview/:token) */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-zinc-100 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Sécurité du Portail de Validation Client</span>
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Hermétique & Isolé
              </span>
            </div>
            
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Ce token cryptographique permet à votre cliente d&apos;accéder à ses publications sans compte ni mot de passe. Vos brouillons et vos prompts internes restent strictement invisibles.
            </p>

            <div className="space-y-2">
              <label className="block text-zinc-400 font-medium">Token d&apos;accès public :</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={previewToken}
                  readOnly
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-300 font-mono text-[11px]"
                />
                <button
                  onClick={handleRegenerateToken}
                  className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-all flex items-center gap-1 text-[11px]"
                  title="Régénérer un nouveau token de sécurité"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Régénérer</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg transition-all flex items-center gap-1 text-[11px]"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Passerelle Webhook Make.com */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-zinc-100 flex items-center gap-1.5 text-xs">
                <Radio className="w-4 h-4 text-purple-400" />
                <span>Passerelle Webhook Make.com (Multi-Diffusion)</span>
              </h4>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Dès qu&apos;un post est validé par la cliente ou par vous, PostPilot transmet le payload formaté à Make.com pour publier sans restriction d&apos;API.
            </p>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">URL du Webhook Make.com (Custom Webhook)</label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://hook.eu1.make.com/votre-identifiant-de-scenario"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-500/60 font-mono text-[11px]"
                />
                <button
                  onClick={handleTestWebhook}
                  disabled={isTestingWebhook}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all font-medium flex items-center gap-1.5 shrink-0"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{isTestingWebhook ? 'Test...' : 'Tester le Webhook'}</span>
                </button>
              </div>
            </div>

            {webhookResult && (
              <div className={`p-2.5 rounded-lg flex items-center gap-2 text-[11px] ${
                webhookResult.success 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {webhookResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{webhookResult.message}</span>
              </div>
            )}
          </div>

          {/* Section 4: Statut Cloud Firebase (Firestore & Storage) */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-zinc-100 flex items-center gap-1.5 text-xs">
                <Cloud className="w-4 h-4 text-sky-400" />
                <span>Base de Données & Stockage Cloud</span>
              </h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                isCloudConnected 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {isCloudConnected ? 'Connecté à Firebase Cloud' : 'Mode Local Démo (Prêt)'}
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {isCloudConnected
                ? 'Votre application est connectée à Firestore et Firebase Storage pour la persistance temps réel multi-appareils.'
                : 'L’application tourne en mode local haute performance (LocalStorage). Pour activer la synchronisation Cloud, ajoutez vos clés Firebase dans le fichier .env.local.'}
            </p>

            {isCloudConnected && (
              <button
                onClick={handleSyncToFirestore}
                disabled={isSyncingCloud}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-medium transition-all"
              >
                <Cloud className="w-4 h-4 text-sky-400" />
                <span>{isSyncingCloud ? 'Synchronisation Cloud...' : 'Sauvegarder tout le calendrier sur Firestore'}</span>
              </button>
            )}

            {cloudSyncResult && (
              <div className={`p-2.5 rounded-lg flex items-center gap-2 text-[11px] ${
                cloudSyncResult.success 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {cloudSyncResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{cloudSyncResult.message}</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
          >
            Fermer
          </button>
          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg text-xs font-semibold transition-all shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Enregistrer la configuration</span>
          </button>
        </div>

      </div>
    </div>
  );
}
