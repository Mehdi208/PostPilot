import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans p-6 lg:p-12 max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour au Cockpit PostPilot</span>
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-zinc-100">
            Politique de Confidentialité & Protection des Données
          </h1>
          <p className="text-xs text-zinc-400">
            En application stricte de la <strong>Loi n° 2013-450 du 19 juin 2013</strong> relative à la protection des données à caractère personnel (Côte d&apos;Ivoire)
          </p>
        </div>
      </div>

      <div className="space-y-6 text-xs text-zinc-300 leading-relaxed">
        <section className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <h2 className="text-sm font-semibold text-zinc-100">1. Responsable du Traitement</h2>
          <p>
            Le responsable du traitement des données est <strong>Méhdi Traoré</strong>, agissant en qualité d&apos;opérateur technique de la plateforme <strong>PostPilot</strong>.
          </p>
        </section>

        <section className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <h2 className="text-sm font-semibold text-zinc-100">2. Données Collectées & Finalités</h2>
          <p>
            Les données traitées sur PostPilot sont strictement limitées aux besoins opérationnels du Community Management :
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 pt-1">
            <li>Identifiants de contact professionnel (Nom, téléphone WhatsApp du client partenaire pour la validation).</li>
            <li>Contenus rédactionnels, créas Canva/Photoshop, statuts de publication et consignes de retouche.</li>
            <li>Jetons d&apos;accès temporaires cryptographiques pour la consultation sécurisée sur <code>/preview/:token</code>.</li>
          </ul>
        </section>

        <section className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <h2 className="text-sm font-semibold text-zinc-100">3. Droits des Personnes (Art. 18 à 21 de la Loi n° 2013-450)</h2>
          <p>
            Conformément à la législation ivoirienne, tout utilisateur ou partenaire dispose des droits suivants :
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 pt-1">
            <li><strong>Droit d&apos;accès :</strong> Obtenir confirmation que des données le concernant sont traitées.</li>
            <li><strong>Droit de rectification :</strong> Exiger la mise à jour ou la correction de données inexactes.</li>
            <li><strong>Droit de suppression :</strong> Demander l&apos;effacement immédiat de ses informations.</li>
            <li><strong>Droit d&apos;opposition :</strong> S&apos;opposer à tout traitement non consenti.</li>
          </ul>
        </section>

        <section className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <h2 className="text-sm font-semibold text-zinc-100">4. Autorité de Contrôle & Recours (ARTCI)</h2>
          <p>
            En cas de contestation ou de demande relative à la protection de vos données en Côte d&apos;Ivoire, vous pouvez saisir l&apos;autorité compétente :
          </p>
          <div className="p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-1 text-zinc-300 font-mono text-[11px]">
            <p className="font-bold text-amber-400">Autorité de Régulation des Télécommunications/TIC de Côte d’Ivoire (ARTCI)</p>
            <p>Marcory Anoumabo, 18 BP 2203 Abidjan 18</p>
            <p>Email : info-apdp@artci.ci | Site web : www.autoritedeprotection.ci</p>
          </div>
        </section>
      </div>

      <footer className="mt-12 pt-4 border-t border-zinc-800 text-center text-[11px] text-zinc-500">
        PostPilot • Abidjan, Côte d&apos;Ivoire • Mise à jour : Octobre 2026
      </footer>
    </div>
  );
}
