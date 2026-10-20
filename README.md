# 🚀 PostPilot — L'OS Intelligent des Community Managers & Agences

> **PostPilot** est une plateforme web moderne conçue pour automatiser, structurer et décupler l'efficacité opérationnelle d'un Community Manager indépendant ou d'une agence digitale.
> Elle fait le pont parfait entre le tableur **Excel client**, la **validation collaborative haut de gamme**, l'**inspiration concurrentielle** et la **planification des publications**.

---

## 🎯 Les 5 Piliers Fondateurs du Projet

### 1. 📊 Le Pont Excel Bidirectionnel (Le Cœur du Workflow)
- **Import Excel instantané :** Vous déposez votre fichier de calendrier mensuel `.xlsx` / `.csv` (celui partagé avec votre cliente), et PostPilot génère automatiquement un calendrier visuel interactif avec dates, heures, réseaux et statuts.
- **Export Excel enrichi :** Réexportez en 1 clic le tableur mis à jour avec les validations et commentaires des clients pour archivage ou partage.

### 2. 🛡️ Psychologie Client & Portail de Validation Étanche (`/preview/:token`)
- **Dashboard Interne Privé :** Votre cockpit de travail (brouillons, prompts IA, benchmarks) reste strictement secret pour préserver la valeur perçue de votre travail et votre rémunération.
- **Lien de Prévisualisation Client Dédié :** Un lien public sécurisé sans mot de passe complexe où la cliente voit un portail digne d'une grande agence de com. Elle consulte les posts du mois (textes + visuels), clique sur **« Valider »** ou laisse une note de retouche.

### 3. 🧠 Moteur IA Contextualisé (Fini les Textes Génériques)
- Intégration de personas et contextes précis (inspirés des skills d'Antigravity) :
  - **Profil FruiThé :** Convivialité ivoirienne, nouchi subtil d'Abidjan, lifestyle, Bubble Teas & gourmandises, hooks d'appétence.
  - **Profil Méhdi Traoré (Personal Branding) :** B2B LinkedIn, méthode des 5 P, communicant 360°, autorité et crédibilité (Major de promo IFRAN).
- Génération de hooks viraux, légendes multi-réseaux et hashtags optimisés.

### 4. ⚡ Pragmatisme Visuel (Zéro Usine à Gaz)
- Aucun générateur d'images interne lourd ou buggé.
- Les visuels sont créés via vos outils habituels (ChatGPT, Canva, Photoshop) puis glissés-déposés directement dans la fiche du post.

### 5. 🔭 Radar d'Inspiration & Veille Concurrentielle (Benchmark Feed)
- **Volet Instagram (pour FruiThé) :** Répertoire et veille des comptes concurrents et tendances food/lifestyle à Abidjan pour repérer les formats qui cartonnent.
- **Volet LinkedIn (pour Méhdi) :** Veille sur les créateurs leaders en communication digitale, marketing et tech pour adapter les meilleures structures de posts.
- Conversion d'un post inspirant en brouillon dans le calendrier en 1 clic.

---

## 🛠️ Stack Technique Officielle

| Composant | Technologie | Rôle |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 15 (App Router) + React** | Performance, SEO et fluidité |
| **Design System** | **Tailwind CSS + shadcn/ui + Lucide Icons** | Interface sombre/claire moderne et épurée |
| **Base de Données & Stockage** | **Firebase (Firestore & Firebase Storage)** | Données temps réel et stockage des médias |
| **Authentification** | **Firebase Auth** | Connexion sécurisée de l'administrateur |
| **Moteur Tableur** | **SheetJS (`xlsx`)** | Parsing et génération fluide des fichiers Excel |
| **Intelligence Artificielle** | **Google Gemini API / OpenAI** | Idéation et rédaction contextuelle |

---

## 📋 Structure des Données (Collections Firestore)

```
/workspaces/{workspaceId}          -> Clients (ex: "FruiThé Abidjan", "Méhdi Traoré")
    /brand_profile                 -> Charte, ton, nouchi, hashtags, persona
    /competitors                   -> Liste des comptes à surveiller (Instagram / LinkedIn)
    /posts/{postId}                -> Publications (date, réseau, texte, mediaUrls, statut)
        /client_feedback           -> Commentaires et validations du client
```

---

## 🚦 Statuts d'un Post dans le Workflow
1. 📝 **Brouillon (Draft)** : En cours d'écriture / brainstorming.
2. ⏳ **En attente de validation (Pending Review)** : Envoyé sur le lien client.
3. 💬 **Retouche demandée (Changes Requested)** : Commentaire laissé par le client.
4. ✅ **Validé par le client (Approved)** : Prêt pour publication.
5. 🕒 **Programmé / Publié (Scheduled / Published)** : Envoyé vers le réseau social.
