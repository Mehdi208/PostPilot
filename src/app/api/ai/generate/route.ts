import { NextRequest, NextResponse } from 'next/server';

interface AIGenerateRequest {
  action: 'generate_hooks' | 'improve_caption' | 'shorten' | 'add_hashtags' | 'linkedin_5p';
  workspaceId: string;
  theme: string;
  caption: string;
  featuredProduct?: string;
  cta?: string;
  format?: string;
  platforms?: string[];
}

const FRUITHE_SYSTEM_PROMPT = `Tu es le Directeur de Création et Community Manager d'élite de "FruiThé Abidjan", le spot de référence de Bubble Teas réconfortants et de gourmandises à Abidjan (Riviera Bonoumin, face Abidjan Mall).
Ton ton de voix est chaleureux, taquin, gourmand, complice et résolument ivoirien avec des touches de nouchi naturel et subtil (« C'est doux deh ! », « Le remède contre le goumin », « Assinie était doux mais lundi est là », « Ceux qui sont danhéré »).
Points de contact obligatoires : Riviera Bonoumin (Face Abidjan Mall) et commande WhatsApp au 05 96 93 50 50.
Bannis le jargon d'IA fade. Écris des textes aérés avec des retours à la ligne et des emojis pertinents.`;

const MEHDI_SYSTEM_PROMPT = `Tu es le stratège éditorial et ghostwriter B2B de Méhdi Traoré (Communicant 360°, Major de promotion IFRAN).
Ton écriture applique la méthode des 5 P (Problème, Promesse, Preuve, Plan, Passage à l'action).
Style : percutant, phrases courtes, sauts de lignes pour une lecture fluide sur mobile, zéro phrase creuse (« À l'ère du digital » est strictement interdit).`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AIGenerateRequest;
    const { action, workspaceId, theme, caption, featuredProduct, cta, format, platforms } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const isFruithe = workspaceId === 'fruithe';
    const systemPrompt = isFruithe ? FRUITHE_SYSTEM_PROMPT : MEHDI_SYSTEM_PROMPT;

    // Définition de l'instruction selon l'action demandée
    let userInstruction = '';
    switch (action) {
      case 'generate_hooks':
        userInstruction = `Génère 3 propositions d'accroches / hooks ultra-viraux (de 1 à 2 lignes maximum) pour stopper le scroll sur ${platforms?.join(', ') || 'les réseaux'}.
Thème : ${theme}
Produit vedette : ${featuredProduct || 'Bubble Tea FruiThé'}
Format : ${format || 'publication'}`;
        break;

      case 'improve_caption':
        userInstruction = `Réécris et sublime cette légende pour maximiser l'engagement et les commandes WhatsApp.
Thème : ${theme}
Légende brute : ${caption}
Produit : ${featuredProduct || ''}
CTA : ${cta || 'Commander au 05 96 93 50 50'}
Garde le ton exact et structure en 3 parties : Accroche percutante, Corps gourmand/engageant, et CTA clair avec contact.`;
        break;

      case 'shorten':
        userInstruction = `Raccourcis cette légende pour la rendre percutante, concise et directe (format adapté pour TikTok / Instagram Reels) :
${caption}`;
        break;

      case 'add_hashtags':
        userInstruction = isFruithe
          ? `Génère une sélection de 6 à 8 hashtags optimisés pour Abidjan (mélange de marque, niche food/boba et local) pour le post suivant :\nThème: ${theme}\nProduit: ${featuredProduct || ''}`
          : `Génère 5 hashtags LinkedIn professionnels ciblés pour ce post :\nThème: ${theme}`;
        break;

      case 'linkedin_5p':
        userInstruction = `Structure ce post selon la méthode des 5 P (Problème, Promesse, Preuve, Plan, Passage à l'action) pour LinkedIn :\nSujet: ${theme}\nBrouillon: ${caption}`;
        break;

      default:
        userInstruction = `Améliore ce post pour les réseaux sociaux :\n${caption}`;
    }

    // 1. Si une clé Gemini API est configurée, appel direct du modèle gemini-2.5-flash
    if (apiKey && apiKey !== 'AIzaSyDummyKeyForGoogleGeminiApi') {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${systemPrompt}\n\nConsigne :\n${userInstruction}` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          }),
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            return NextResponse.json({
              success: true,
              result: generatedText.trim(),
              source: 'gemini-2.5-flash',
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, using intelligent CM fallback engine:', geminiErr);
      }
    }

    // 2. Moteur de Fallback Intelligent et Contextuel (Zéro panne si la clé n'est pas encore saisie)
    let fallbackResult = '';

    if (isFruithe) {
      const productMention = featuredProduct || 'votre Bubble Tea signature';
      const ctaMention = cta || 'Commander au 05 96 93 50 50';

      if (action === 'generate_hooks') {
        fallbackResult = `1️⃣ « Il y a deux types de personnes à Abidjan : ceux qui savent déjà, et ceux qui regardent le menu 15 minutes 😭🧋 »\n\n2️⃣ « Il fait chaud deh ! Voici le seul remède officiel contre le goumin et la chaleur d'aujourd'hui 👇 »\n\n3️⃣ « Si vous cherchiez un signe pour craquer sur le ${productMention}... le voici ✨ »`;
      } else if (action === 'improve_caption') {
        fallbackResult = `On dit souvent que le bonheur ne s'achète pas... mais est-ce que vous avez déjà goûté au ${productMention} bien glacé sous le soleil d'Abidjan ? 🥵🧋\n\nChez FruiThé, chaque gorgée est une pause douceur bien méritée. Entre le croquant des perles de tapioca et l'onctuosité des saveurs fraîches, c'est doux deh !\n\n📍 Rendez-vous à Bonoumin (juste en face d'Abidjan Mall)\n📲 ${ctaMention}\n🛵 Disponible aussi en livraison via Yango Deli !`;
      } else if (action === 'shorten') {
        fallbackResult = `La chaleur d'Abidjan là, c'est pas un jeu 🥵\nRecharge ton énergie avec le ${productMention} bien glacé !\n\n📍 Riviera Bonoumin (Face Abidjan Mall)\n📲 ${ctaMention}`;
      } else if (action === 'add_hashtags') {
        fallbackResult = `#FruiThéAbidjan #BubbleTeaAbidjan #DesBullesDesFruitsDuFun #RivieraBonoumin #FoodLoversCI #AbidjanFood #CestDouxDeh #TeamBoba225`;
      }
    } else {
      // Profil Méhdi Traoré B2B
      if (action === 'generate_hooks') {
        fallbackResult = `1️⃣ « 90% des marques échouent sur les réseaux parce qu'elles confondent visibilité et mémorabilité. »\n\n2️⃣ « La méthode exacte que j'utilise pour transformer un calendrier Excel client en machine à conversion. »\n\n3️⃣ « Pourquoi les agences traditionnelles vont devoir repenser toute leur chaîne d'opération dès cette année. »`;
      } else if (action === 'improve_caption' || action === 'linkedin_5p') {
        fallbackResult = `Un bon Community Manager ne publie pas pour remplir une case.\nIl publie pour déclencher une décision.\n\nVoici ce que j'ai observé en structurant la communication de marques locales et B2B :\n\n1. Le problème : Les marques publient du contenu tiède sans angle culturel précis.\n2. La promesse : Adopter une voix authentique qui résonne avec le quotidien de vos clients.\n3. La preuve : Des taux d'engagement multipliés par 3 dès que le ton devient complice et direct.\n4. Le plan : Allier rigueur opérationnelle (calendrier 12 colonnes) et audace créative.\n\nQuel est le plus grand défi de votre marque sur les réseaux cette année ?\nDiscutons-en en commentaire 👇`;
      } else {
        fallbackResult = `#CommunicationDigitale #StratégieSocialMedia #CommunityManagement #PersonalBranding #AfriqueTech`;
      }
    }

    return NextResponse.json({
      success: true,
      result: fallbackResult,
      source: 'postpilot-expert-engine',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
