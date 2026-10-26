import { NextRequest, NextResponse } from 'next/server';
import { resolvePublicMediaUrls } from '@/lib/utils/media-url';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, workspace, post } = body;

    if (!post) {
      return NextResponse.json({ error: 'Post data is missing' }, { status: 400 });
    }

    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    const baseUrl = process.env.APP_BASE_URL || 'https://postpilot-three-delta.vercel.app';

    // Résolution publique des médias réels sans aucun fallback vers d'anciennes affiches
    const cleanMediaUrls = await resolvePublicMediaUrls(post.mediaUrls || [], baseUrl);
    const firstImageUrl = cleanMediaUrls.length > 0 ? cleanMediaUrls[0] : '';

    const payload = {
      event: event || 'post.approved',
      workspace: workspace || 'fruithe',
      postId: post.id,
      scheduledDate: post.scheduledDate,
      time: post.time || '11:30',
      platforms: post.platforms,
      format: post.format,
      theme: post.theme,
      caption: post.caption,
      imageUrl: firstImageUrl,
      featuredProduct: post.featuredProduct,
      cta: post.cta,
      mediaUrls: cleanMediaUrls,
      dispatchedAt: new Date().toISOString(),
    };

    // Si une URL de webhook Make.com réelle est renseignée dans l'environnement
    if (webhookUrl && webhookUrl.startsWith('http')) {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `Erreur retournée par Make.com: ${response.statusText}` },
          { status: response.status }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Payload transmis avec succès au scénario Make.com !',
        payload,
      });
    }

    // Mode simulation / local par défaut pour développement fluide
    return NextResponse.json({
      success: true,
      message: 'Simulation Webhook réussie (Payload prêt pour Make.com). Configurez MAKE_WEBHOOK_URL pour lier votre compte en production.',
      simulatedPayload: payload,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
