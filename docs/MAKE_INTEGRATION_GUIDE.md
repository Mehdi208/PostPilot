# 🔌 Guide d'Intégration du Scénario Make.com pour PostPilot

Ce guide vous explique comment importer en 2 minutes le blueprint officiel `make-blueprint-postpilot.json` dans votre compte [Make.com](https://www.make.com) pour automatiser la publication multi-comptes sur Facebook, Instagram et LinkedIn.

---

## 🚀 Étape 1 : Création du Scénario dans Make.com

1. Rendez-vous sur votre tableau de bord **Make.com**.
2. Cliquez sur **« Create a new scenario »** (en haut à droite).
3. Cliquez sur les trois petits points `...` en bas de l'écran du scénario, puis sélectionnez **« Import Blueprint »**.
4. Sélectionnez le fichier situé à la racine de ce dossier : `make-blueprint-postpilot.json`.
5. Le scénario complet apparaît instantanément avec :
   - Le module **Custom Webhook** (Écouteur PostPilot).
   - Le **Router** de distribution multi-plateformes.
   - Les branches **Facebook Pages**, **Instagram Business** et **LinkedIn**.
   - Le module **Webhook Response** de confirmation.

---

## 🔗 Étape 2 : Lier l'URL Webhook dans PostPilot

1. Cliquez sur le premier module violet **« 1. Écouteur Webhook PostPilot »**.
2. Cliquez sur **« Add »** pour créer un nouveau Webhook (nommez-le *PostPilot Dispatcher*).
3. Copiez l'URL générée par Make.com (ex: `https://hook.eu1.make.com/abcdef123456...`).
4. Dans votre application PostPilot :
   - Ouvrez la barre latérale gauche.
   - Cliquez sur **« Paramètres & Webhooks »**.
   - Collez l'URL dans le champ **« URL du Webhook Make.com »**.
   - Cliquez sur le bouton violet **« Tester le Webhook »** pour vérifier la connexion en direct !

---

## 📱 Étape 3 : Connecter vos Comptes Réseaux Sociaux

Dans Make.com, cliquez sur chacun des modules pour lier vos comptes une seule fois :
1. **Module Facebook Pages :** Sélectionnez la page officielle **FruiThé Abidjan**.
2. **Module Instagram Business :** Sélectionnez le compte Instagram professionnel de FruiThé.
3. **Module LinkedIn :** Connectez votre profil **Méhdi Traoré**.

---

## ⚡ Automatisation en Production

Activez simplement le scénario dans Make.com avec le commutateur **ON**.
Dès qu'une publication passe au statut **Validé** ou que vous cliquez sur **« Passerelle Make.com »** dans la fiche détaillée du post, PostPilot expédie la créa et la légende formatée sans aucune friction !
