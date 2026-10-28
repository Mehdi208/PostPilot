import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import CookieConsentBanner from '@/components/legal/CookieConsentBanner';
import PwaManager from '@/components/pwa/PwaManager';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: "PostPilot — L'OS Intelligent des Community Managers & Agences",
  description: "Plateforme de gestion éditoriale, validation client hermétique et automatisation multi-réseaux pour FruiThé Abidjan et le personal branding.",
  manifest: '/manifest.webmanifest',
  applicationName: 'PostPilot',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PostPilot',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var t = localStorage.getItem('postpilot_theme');
                if (t === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                }
              } catch(e){}
              window.addEventListener('error', function(e) {
                if (e && e.message && (e.message.indexOf('Loading chunk') !== -1 || e.message.indexOf('ChunkLoadError') !== -1)) {
                  console.warn('[PostPilot] Chunk mismatch after deploy, reloading fresh bundle...');
                  window.location.reload();
                }
              });
            })();`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 antialiased`}>
        {children}
        <PwaManager />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
