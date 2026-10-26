import { NextRequest, NextResponse } from 'next/server';
import { resolvePublicMediaUrls } from '@/lib/utils/media-url';

interface LinkedInPostPayload {
  caption: string;
  mediaUrls?: string[];
  theme?: string;
  postId?: string;
  workspaceId?: string;
  webhookUrl?: string;
  accessToken?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: LinkedInPostPayload = await req.json();
    const { caption, mediaUrls, theme, postId, workspaceId, webhookUrl, accessToken } = body;

    if (!caption || caption.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Le texte de la publication est vide.' }, { status: 400 });
    }

    const effectiveWebhookUrl = webhookUrl || process.env.MAKE_WEBHOOK_URL;
    const effectiveToken = accessToken || process.env.LINKEDIN_ACCESS_TOKEN;

    // 1. Si un Access Token officiel LinkedIn est renseigné (API REST directe)
    if (effectiveToken) {
      try {
        // Récupération de l'URN du profil utilisateur
        const meRes = await fetch('https://api.linkedin.com/v2/userinfo', {
          headers: { Authorization: `Bearer ${effectiveToken}` },
        });

        if (!meRes.ok) {
          return NextResponse.json({
            success: false,
            error: `Token LinkedIn invalide ou expiré (${meRes.statusText}).`,
          }, { status: 401 });
        }

        const meData = await meRes.json();
        const authorUrn = `urn:li:person:${meData.sub}`;

        // Création du post LinkedIn via l'API REST UGC Post
        const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${effectiveToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
          body: JSON.stringify({
            author: authorUrn,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                  text: caption,
                },
                shareMediaCategory: 'NONE',
              },
            },
            visibility: {
              'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
            },
          }),
        });

        if (!postRes.ok) {
          const errData = await postRes.text();
          return NextResponse.json({
            success: false,
            error: `Erreur API LinkedIn (${postRes.status}): ${errData}`,
          }, { status: postRes.status });
        }

        const resultData = await postRes.json();
        return NextResponse.json({
          success: true,
          mode: 'linkedin_api',
          message: 'Publication publiée avec succès sur votre profil LinkedIn !',
          postId: resultData.id,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erreur API LinkedIn';
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
      }
    }

    // 2. Si un Webhook Make.com / Zapier / N8N est renseigné
    if (effectiveWebhookUrl && effectiveWebhookUrl.startsWith('http')) {
      const baseUrl = process.env.APP_BASE_URL || 'https://postpilot-three-delta.vercel.app';
      
      // Résolution publique des médias : convertit les Base64 ou chemins locaux en vraies URLs HTTPS
      const cleanMediaUrls = await resolvePublicMediaUrls(mediaUrls || [], baseUrl);
      const firstImageUrl = cleanMediaUrls.length > 0 ? cleanMediaUrls[0] : '';

      const payload = {
        action: 'publish_linkedin',
        platform: 'linkedin',
        postId,
        workspaceId,
        theme,
        caption,
        imageUrl: firstImageUrl,
        mediaUrls: cleanMediaUrls,
        publishedAt: new Date().toISOString(),
      };

      const webhookRes = await fetch(effectiveWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!webhookRes.ok) {
        return NextResponse.json({
          success: false,
          error: `Le webhook de publication a répondu avec une erreur : ${webhookRes.statusText}`,
        }, { status: webhookRes.status });
      }

      return NextResponse.json({
        success: true,
        mode: 'webhook',
        message: 'Publication transmise à votre scénario d\'automatisation LinkedIn !',
        visualPublished: Boolean(firstImageUrl),
        imageUrl: firstImageUrl,
      });
    }

    // 3. Aucun webhook ni token configuré
    return NextResponse.json({
      success: false,
      requiresSetup: true,
      message: 'Aucun webhook d\'automatisation ni jeton API LinkedIn n\'est actuellement configuré.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
