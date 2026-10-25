const fs = require('fs');
const path = require('path');

const baseDir = path.join(process.cwd(), 'public', 'visuels');
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

// Tous les jours du mois d'octobre 2026 (01 à 31)
for (let day = 1; day <= 31; day++) {
  const dayStr = day < 10 ? '0' + day : '' + day;
  const dateDir = path.join(baseDir, '2026-10-' + dayStr);
  if (!fs.existsSync(dateDir)) {
    fs.mkdirSync(dateDir, { recursive: true });
  }
}

// Copier les affiches officielles existantes dans leurs dossiers de dates respectifs
const copies = [
  { 
    src: 'public/posts/mehdi/post-1-presentation.jpg', 
    dests: [
      'public/visuels/2026-10-23/post-1-presentation.jpg', 
      'public/visuels/2026-10-25/post-1-presentation.jpg'
    ] 
  },
  { 
    src: 'public/posts/mehdi/post-2-article-ia.jpg', 
    dests: ['public/visuels/2026-10-27/post-2-article-ia.jpg'] 
  },
  { 
    src: 'public/posts/mehdi/post-3-carrousel-5p.jpg', 
    dests: ['public/visuels/2026-10-29/post-3-carrousel-5p.jpg'] 
  },
  { 
    src: 'public/posts/mehdi/post-4-libre-cafe.jpg', 
    dests: ['public/visuels/2026-10-31/post-4-libre-cafe.jpg'] 
  },
];

copies.forEach(c => {
  if (fs.existsSync(c.src)) {
    c.dests.forEach(d => {
      fs.copyFileSync(c.src, d);
      console.log(`Copied ${c.src} -> ${d}`);
    });
  }
});

// Création d'un guide explicatif README.txt dans le dossier
const readmeContent = `===================================================
POSTPILOT - DOSSIER DES VISUELS PAR DATE DE PUBLICATION
===================================================

Chaque sous-dossier correspond exactement à la date d'une publication (format YYYY-MM-DD).

COMMENT AJOUTER OU MODIFIER LE VISUEL D'UN POST :
1. Générez votre visuel (Canva, Midjourney, Photoshop, DALL-E, etc.).
2. Déposez simplement le fichier image (JPG, PNG, WebP) ou vidéo (MP4) dans le dossier de la date correspondante.
   Exemple : pour le post du 25 octobre, déposez l'image dans :
   PostPilot/public/visuels/2026-10-25/mon-affiche.jpg
3. Dans PostPilot, ouvrez la publication et cliquez sur "Scanner le dossier" ou sur "Enregistrer".
   Le visuel est immédiatement associé et affiché dans le calendrier, le tableur et la fiche du post !

NOTE :
Vous pouvez également importer directement votre visuel depuis l'interface de PostPilot (bouton "Importer un visuel").
Le fichier sera automatiquement sauvegardé dans le bon dossier de date.
`;

fs.writeFileSync(path.join(baseDir, 'README.txt'), readmeContent, 'utf-8');
console.log('Architecture public/visuels initialisée avec succès !');
