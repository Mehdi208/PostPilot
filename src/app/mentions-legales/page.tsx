import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function MentionsLegalesPage() {
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
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg lg:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
            Mentions Légales & Informations Réglementaires
          </h1>
          <p className="text-xs text-zinc-500 font-mono">
            Conformité Loi n° 2013-546 du 30 juillet 2013 relative aux transactions électroniques (Côte d&apos;Ivoire)
          </p>
        </div>
      </div>

      <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <section className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">1. Éditeur de l&apos;Application PostPilot</h2>
          <p>
            L&apos;application web <strong>PostPilot</strong> est éditée par <strong>Méhdi Traoré</strong>, Community Manager indépendant & Consultant en communication digitale 360°.
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-500 pt-1 font-mono text-[11px]">
            <li><strong>Siège d&apos;exercice :</strong> Abidjan, Côte d&apos;Ivoire (Cocody / Riviera).</li>
            <li><strong>Téléphone :</strong> +225 05 96 93 50 50</li>
            <li><strong>Email de contact :</strong> contact@postpilot.app</li>
            <li><strong>Directeur de la publication :</strong> Méhdi Traoré</li>
          </ul>
        </section>

        <section className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">2. Partenaire Mandant & Territoire d&apos;Application</h2>
          <p>
            PostPilot gère notamment l&apos;espace de régie éditoriale et de validation client pour l&apos;établissement :
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-500 pt-1 font-mono text-[11px]">
            <li><strong>Établissement :</strong> FruiThé (Restaurant & Bar à Bubble Tea)</li>
            <li><strong>Adresse physique :</strong> Riviera Bonoumin (en face d&apos;Abidjan Mall), Commune de Cocody, Abidjan, Côte d&apos;Ivoire.</li>
            <li><strong>Monnaie de référence :</strong> Franc CFA (XOF / FCFA TTC).</li>
            <li><strong>Canaux de commande :</strong> Mobile Money (Wave, Orange Money, MTN MoMo, Moov Money) et commande directe WhatsApp au 05 96 93 50 50.</li>
          </ul>
        </section>

        <section className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">3. Hébergement de la Plateforme</h2>
          <p>
            La plateforme web PostPilot est déployée sur une infrastructure Cloud haute disponibilité avec des réseaux de distribution de contenu (CDN) sécurisés garantissant l&apos;étanchéité des données et le chiffrement TLS 1.3 de bout en bout.
          </p>
        </section>

        <section className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">4. Juridiction Compétente</h2>
          <p>
            Tout litige relatif à l&apos;utilisation de la plateforme ou aux prestations de services associées relève de la compétence exclusive du <strong>Tribunal de Commerce d&apos;Abidjan (TCA)</strong>.
          </p>
        </section>
      </div>

      <footer className="mt-12 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center text-[11px] text-zinc-400 font-mono">
        PostPilot • Abidjan, Côte d&apos;Ivoire • Mise à jour : Octobre 2026
      </footer>
    </div>
  );
}
