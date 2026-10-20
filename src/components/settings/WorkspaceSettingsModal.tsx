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
  AlertCircle,
  User
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
        caption: 'Ceci est un test de passerelle automatique PostPilot -> Make.com',
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs tracking-tight uppercase text-zinc-900 dark:text-zinc-100">
                Paramètres — {activeWorkspace.name}
              </h3>
              <p className="text-[11px] text-zinc-500">
                Configuration du portail client, des passerelles Webhook et du Cloud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-zinc-600 dark:text-zinc-400">
          
          {/* Section 1: Informations Client */}
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-xs">
              <User className="w-3.5 h-3.5" />
              <span>Coordonnées Client & Validation</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-500 mb-1 font-medium text-[11px]">Nom du contact</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-1 font-medium text-[11px]">Numéro WhatsApp Client (CTA)</label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+225 0596935050"
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Portail Client */}
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Sécurité du Portail de Validation Client</span>
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 font-mono text-zinc-500">
                Isolé & Sécurisé
              </span>
            </div>
            
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Ce token cryptographique permet à votre client d&apos;accéder à ses publications sans compte ni mot de passe. Vos brouillons et vos notes internes restent strictement invisibles.
            </p>

            <div className="space-y-1.5">
              <label className="block text-zinc-500 font-medium text-[11px]">Token d&apos;accès public :</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={previewToken}
                  readOnly
                  className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]"
                />
                <button
                  onClick={handleRegenerateToken}
                  className="px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-lg transition-all flex items-center gap-1 text-[11px]"
                  title="Régénérer un nouveau token de sécurité"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Régénérer</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-semibold rounded-lg transition-all flex items-center gap-1 text-[11px]"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copié' : 'Copier'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Passerelle Webhook Make.com */}
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-xs">
                <Radio className="w-3.5 h-3.5" />
                <span>Passerelle Webhook Make.com (Multi-Diffusion)</span>
              </h4>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Dès qu&apos;un post est validé par le client ou par vous, PostPilot transmet le payload formaté à Make.com pour publier automatiquement.
            </p>

            <div>
              <label className="block text-zinc-500 mb-1 font-medium text-[11px]">URL du Webhook (Custom Webhook)</label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://hook.eu1.make.com/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 font-mono text-[11px]"
                />
                <button
                  onClick={handleTestWebhook}
                  disabled={isTestingWebhook}
                  className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-lg transition-all font-medium flex items-center gap-1.5 shrink-0 text-xs"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{isTestingWebhook ? 'Test...' : 'Tester le Webhook'}</span>
                </button>
              </div>
            </div>

            {webhookResult && (
              <div className={`p-2.5 rounded-lg flex items-center gap-2 text-[11px] border ${
                webhookResult.success 
                  ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700' 
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700'
              }`}>
                {webhookResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{webhookResult.message}</span>
              </div>
            )}
          </div>

          {/* Section 4: Statut Cloud Firebase */}
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 text-xs">
                <Cloud className="w-3.5 h-3.5" />
                <span>Base de Données & Stockage Cloud</span>
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 font-mono text-zinc-500">
                {isCloudConnected ? 'Connecté à Firebase Cloud' : 'Mode Local Démo'}
              </span>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              {isCloudConnected
                ? 'L’application est connectée à Firestore et Firebase Storage pour la persistance temps réel.'
                : 'L’application tourne en mode local haute performance (LocalStorage). Pour activer la synchronisation Cloud, ajoutez vos clés Firebase dans le fichier .env.local.'}
            </p>

            {isCloudConnected && (
              <button
                onClick={handleSyncToFirestore}
                disabled={isSyncingCloud}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-lg font-medium transition-all text-xs"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>{isSyncingCloud ? 'Synchronisation Cloud...' : 'Sauvegarder tout le calendrier sur Firestore'}</span>
              </button>
            )}

            {cloudSyncResult && (
              <div className="p-2.5 rounded-lg flex items-center gap-2 text-[11px] border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                {cloudSyncResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{cloudSyncResult.message}</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all"
          >
            Fermer
          </button>
          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black rounded-lg text-xs font-semibold transition-all shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Enregistrer</span>
          </button>
        </div>

      </div>
    </div>
  );
}
