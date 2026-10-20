import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans p-6 lg:p-12 max-w-4xl mx-auto selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white font-medium mb-8 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Retour au Cockpit PostPilot</span>
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg lg:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
            Politique de Confidentialité & Protection des Données
          </h1>
          <p className="text-xs text-zinc-500 font-mono">
            En application stricte de la <strong>Loi n° 2013-450 du 19 juin 2013</strong> relative à la protection des données à caractère personnel (Côte d&apos;Ivoire)
          </p>
        </div>
      </div>

      <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <section className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">1. Responsable du Traitement</h2>
          <p>
            Le responsable du traitement des données est <strong>Méhdi Traoré</strong>, agissant en qualité d&apos;opérateur technique de la plateforme <strong>PostPilot</strong>.
          </p>
        </section>

        <section className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">2. Données Traitées & Finalités</h2>
          <p>
            Les données traitées sur PostPilot sont strictement limitées aux besoins opérationnels du Community Management :
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-500 pt-1 font-mono text-[11px]">
            <li>Identifiants professionnels de contact (nom, numéro WhatsApp du client partenaire).</li>
            <li>Contenus rédactionnels, visuels Canva/Photoshop, statuts de publication et retouches.</li>
            <li>Jetons d&apos;accès temporaires cryptographiques pour la consultation sécurisée sur <code>/preview/:token</code>.</li>
          </ul>
        </section>

        <section className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">3. Droits des Personnes (Art. 18 à 21 de la Loi n° 2013-450)</h2>
          <p>
            Conformément à la législation ivoirienne, tout utilisateur ou partenaire dispose des droits suivants :
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-500 pt-1 font-mono text-[11px]">
            <li><strong>Droit d&apos;accès :</strong> Obtenir confirmation que des données le concernant sont traitées.</li>
            <li><strong>Droit de rectification :</strong> Exiger la mise à jour ou la correction de données inexactes.</li>
            <li><strong>Droit de suppression :</strong> Demander l&apos;effacement immédiat de ses informations.</li>
            <li><strong>Droit d&apos;opposition :</strong> S&apos;opposer à tout traitement non consenti.</li>
          </ul>
        </section>

        <section className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">4. Autorité de Contrôle & Recours (ARTCI)</h2>
          <p>
            En cas de contestation ou de demande relative à la protection de vos données en Côte d&apos;Ivoire, vous pouvez saisir l&apos;autorité compétente :
          </p>
          <div className="p-3.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
            <p className="font-semibold text-zinc-950 dark:text-white">Autorité de Régulation des Télécommunications/TIC de Côte d’Ivoire (ARTCI)</p>
            <p>Marcory Anoumabo, 18 BP 2203 Abidjan 18</p>
            <p>Email : info-apdp@artci.ci | Site web : www.autoritedeprotection.ci</p>
          </div>
        </section>
      </div>

      <footer className="mt-12 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center text-[11px] text-zinc-400 font-mono">
        PostPilot • Abidjan, Côte d&apos;Ivoire • Mise à jour : Octobre 2026
      </footer>
    </div>
  );
}
