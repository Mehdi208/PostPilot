import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import CookieConsentBanner from '@/components/legal/CookieConsentBanner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "PostPilot — L'OS Intelligent des Community Managers & Agences",
  description: "Plateforme de gestion éditoriale, validation client hermétique et automatisation multi-réseaux pour FruiThé Abidjan et le personal branding.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.variable} font-sans bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 antialiased`}>
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
