import json

FILE_PATH = r"c:\Users\hp\Documents\antigravity\PostPilot\src\lib\data\initial-posts.json"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    posts = json.load(f)

enrichments = {
    "mehdi-post-1-presentation": {
        "aiVisualPrompt": "A high-end personal branding poster for LinkedIn, vertical 4:5 aspect ratio (1080x1350px). Minimalist modern tech-executive aesthetic inspired by Linear and Stripe Press. In the center, an authentic, charismatic portrait of a confident young Black male executive (wearing a tailored dark suit and crisp collar), backlit by a subtle indigo and cyan volumetric glow. Deep charcoal #0A0D14 studio background with fine architectural grid lines and subtle digital bokeh. Clean Swiss typography: Large bold modern sans-serif headline reading 'LE COMMUNICANT QUI SAIT CODER' in clean white lettering with subtle cyan underline. Secondary discreet badges: 'Major IFRAN 2024', 'Ex-Président BDE', '10+ Entreprises Accompagnées'. Minimalist UI tags reading 'Stratégie Digitale' and 'Fullstack Mindset' in rounded pill badges with border glow. 8k resolution, cinematic lighting, editorial magazine cover quality, sharp focus, zero visual clutter.",
        "aiPromptSources": [
            "Photo portrait professionnel haute résolution de face en costume (fournir la photo réelle en pièce jointe à ChatGPT)",
            "Palette de couleurs : Fond sombre #0A0D14, Accent Indigo #6366F1, Cyan électrique #06B6D4, Texte blanc pur #FFFFFF",
            "Typographies recommandées : Inter / Geist Sans pour les titres et JetBrains Mono pour les métadonnées",
            "Données textuelles officielles : Abdou-Rahmane Méhdi Traoré, Major IFRAN 2024, Ex-Président BDE, 10+ Entreprises",
            "Format d'affiche : Ratio vertical 4:5 (1080 x 1350 px), optimal pour le flux mobile LinkedIn"
        ],
        "inspirationUrls": [
            "/posts/inspiration/inspiration-1-personal-branding.jpg"
        ]
    },
    "mehdi-post-2-article": {
        "aiVisualPrompt": "An avant-garde editorial technology poster, vertical 4:5 format (1080x1350px), designed for a thought-leadership LinkedIn post. Split visual composition representing human creativity colliding with artificial intelligence: on the left side, human handwriting, organic warm amber light, and human thought sketches; on the right side, an intricate glowing neural network, blue and purple fiber-optic nodes, and clean algorithmic geometry seamlessly merging together. Deep obsidian matte black background #09090B. Large bold Swiss editorial typography at the top reading: 'L'IA VA-T-ELLE TUER LE COMMUNITY MANAGER ?' in crisp white uppercase. Subtitle at the bottom: 'L'avènement de l'élite hybride : 80% d'exécution déléguée, 100% de stratégie humaine'. Monospaced terminal badge in the corner: 'Article LinkedIn • 3 min de lecture'. High-fashion editorial magazine cover aesthetic like Wired or MIT Technology Review, sharp contrast, masterclass graphic design.",
        "aiPromptSources": [
            "Texte de réflexion rédigé : Les 3 paragraphes d'argumentation (Constat, Remplacement des exécutants, Avènement de l'élite hybride)",
            "Style de référence visuel : Couverture de magazine technologique d'avant-garde (Wired, MIT Tech Review, The Verge)",
            "Palette chromatique : Fond Obsidian #09090B, Ambre chaud #F59E0B pour l'humain, Violet neural #8B5CF6 pour l'IA",
            "Indicateurs métriques : 80% Délégation automatisée, 100% Stratégie humaine, x5 Rapidité",
            "Format d'export : Ratio 4:5 (1080 x 1350 px) en haute définition"
        ],
        "inspirationUrls": [
            "/posts/inspiration/inspiration-2-ai-tech-editorial.jpg"
        ]
    },
    "mehdi-post-3-carrousel": {
        "aiVisualPrompt": "A premium educational carousel cover slide poster, 4:5 vertical format (1080x1350px). Bold graphic design inspired by Chris Do, The Futur, and Pentagram. Dark luxury slate background #0F172A. Giant striking yellow/amber and white typography displaying the main hook: 'LA MÉTHODE DES 5 P POUR CONVERTIR EN 2026'. Five sleek, numbered horizontal pill cards stacked vertically showing the framework stages: '01. PROBLÈME', '02. PROMESSE', '03. PREUVE', '04. PROPOSITION', '05. PASSAGE À L'ACTE', each with a clean minimalist icon and high-contrast styling. Small bottom tag: 'Slide 1/6 • Guide Actionnable B2B' with swipe arrow indicator (→). Author signature in bottom left: 'Méhdi Traoré | Growth & Social Selling'. Utilitarian, highly readable on mobile, high CTR, zero clutter.",
        "aiPromptSources": [
            "Contenu du framework 5P : 01 Problème, 02 Promesse, 03 Preuve, 04 Proposition, 05 Passage à l'acte",
            "Structure du carrousel : Slide 1 Couverture d'accroche (force le clic), Slides 2 à 5 Explications, Slide 6 CTA",
            "Codes graphiques : Numérotation géante, cartes sombres à contour coloré, flèche incitant au balayage (Glisser vers la droite ->)",
            "Palette de couleurs : Fond ardoise #0F172A, Jaune ambre #F59E0B, Rouge #EF4444, Vert émeraude #10B981, Bleu roi #3B82F6",
            "Règle de contraste : Lisibilité immédiate en 0.5 seconde sur écran de smartphone sans zoomer"
        ],
        "inspirationUrls": [
            "/posts/inspiration/inspiration-3-carousel-5p-framework.jpg"
        ]
    },
    "mehdi-post-4-libre": {
        "aiVisualPrompt": "A cinematic, moody lifestyle photograph and typography poster, vertical 4:5 aspect ratio (1080x1350px). Overhead flat-lay view of a minimalist executive workstation at sunrise: a sleek dark ceramic cup of black coffee with rising steam, a high-end matte black notebook with handwritten notes in French and a premium fountain pen, an ultra-thin laptop showing clean code on a dark IDE, and soft natural golden-hour morning sunlight casting long shadows across a dark oak wood desk. Top left discreet typography: '07:15 — LE CALME AVANT LA TEMPÊTE' in elegant monospaced font. Bottom quote: 'La discipline commence quand personne ne regarde'. Film photography aesthetic, Kodak Portra 400 color grading, 35mm lens depth of field, authentic texture, peaceful yet intensely driven morning atmosphere.",
        "aiPromptSources": [
            "Photo authentique de bureau ou d'ambiance de travail matinal (ordinateur portable, carnet de notes, tasse à café)",
            "Ambiance d'éclairage : Lumière rasante de début de matinée (golden hour 07h15), teintes chaudes et bois sombre",
            "Citation centrale : 'La motivation te fait démarrer. La discipline te fait continuer quand l'enthousiasme s'estompe.'",
            "Palette de couleurs : Pierre sombre #1C1917, Bois de chêne brûlé #292524, Ambre mat #F59E0B, Blanc doux #F5F5F4",
            "Format de publication : Image unique 4:5 (1080 x 1350 px) style magazine de lifestyle exécutif (Monocle, Kinfolk)"
        ],
        "inspirationUrls": [
            "/posts/inspiration/inspiration-4-discipline-lifestyle.jpg"
        ]
    }
}

updated_count = 0
for p in posts:
    pid = p.get("id")
    if pid in enrichments:
        p["aiVisualPrompt"] = enrichments[pid]["aiVisualPrompt"]
        p["aiPromptSources"] = enrichments[pid]["aiPromptSources"]
        p["inspirationUrls"] = enrichments[pid]["inspirationUrls"]
        updated_count += 1

with open(FILE_PATH, "w", encoding="utf-8") as f:
    json.dump(posts, f, indent=2, ensure_ascii=False)

print(f"Updated {updated_count} posts with AI visual prompts and inspiration URLs in {FILE_PATH}")
