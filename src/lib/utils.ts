import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0,
  }).format(amount).replace('XOF', 'FCFA');
}

export interface StatusConfig {
  value: 'draft' | 'pending_review' | 'changes_requested' | 'approved' | 'scheduled' | 'published';
  label: string;
  shortLabel: string;
  badgeClass: string;
  dotClass: string;
  borderAccent: string;
  cardBg: string;
  iconColor: string;
}

export function getStatusConfig(status: string): StatusConfig {
  switch (status) {
    case 'scheduled':
      return {
        value: 'scheduled',
        label: 'Programmé',
        shortLabel: 'Programmé',
        badgeClass: 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700/80 font-bold',
        dotClass: 'bg-purple-500 animate-pulse',
        borderAccent: 'border-l-4 border-l-purple-500',
        cardBg: 'hover:border-purple-300 dark:hover:border-purple-700',
        iconColor: 'text-purple-500',
      };
    case 'approved':
      return {
        value: 'approved',
        label: 'Validé par le client',
        shortLabel: 'Validé',
        badgeClass: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/80 font-bold',
        dotClass: 'bg-emerald-500',
        borderAccent: 'border-l-4 border-l-emerald-500',
        cardBg: 'hover:border-emerald-300 dark:hover:border-emerald-700',
        iconColor: 'text-emerald-500',
      };
    case 'published':
      return {
        value: 'published',
        label: 'Publié en ligne',
        shortLabel: 'Publié',
        badgeClass: 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700/80 font-bold',
        dotClass: 'bg-blue-500',
        borderAccent: 'border-l-4 border-l-blue-500',
        cardBg: 'hover:border-blue-300 dark:hover:border-blue-700',
        iconColor: 'text-blue-500',
      };
    case 'pending_review':
      return {
        value: 'pending_review',
        label: 'En attente de validation',
        shortLabel: 'Attente',
        badgeClass: 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/80 font-bold',
        dotClass: 'bg-amber-500',
        borderAccent: 'border-l-4 border-l-amber-500',
        cardBg: 'hover:border-amber-300 dark:hover:border-amber-700',
        iconColor: 'text-amber-500',
      };
    case 'changes_requested':
      return {
        value: 'changes_requested',
        label: 'Retouche demandée',
        shortLabel: 'Retouche',
        badgeClass: 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700/80 font-bold',
        dotClass: 'bg-rose-500',
        borderAccent: 'border-l-4 border-l-rose-500',
        cardBg: 'hover:border-rose-300 dark:hover:border-rose-700',
        iconColor: 'text-rose-500',
      };
    case 'draft':
    default:
      return {
        value: 'draft',
        label: 'Brouillon',
        shortLabel: 'Brouillon',
        badgeClass: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 font-medium',
        dotClass: 'bg-zinc-400',
        borderAccent: 'border-l-4 border-l-zinc-300 dark:border-l-zinc-700',
        cardBg: 'hover:border-zinc-400 dark:hover:border-zinc-600',
        iconColor: 'text-zinc-400',
      };
  }
}

export function getStatusBadge(status: string) {
  const conf = getStatusConfig(status);
  return {
    label: conf.label,
    shortLabel: conf.shortLabel,
    color: conf.badgeClass,
    dot: conf.dotClass,
    borderAccent: conf.borderAccent,
  };
}

export function getPlatformBadge(platform: string) {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return {
        name: 'Facebook',
        bg: 'bg-blue-600/10 text-blue-400 border-blue-600/20',
        indicator: '#1877F2',
      };
    case 'instagram':
      return {
        name: 'Instagram',
        bg: 'bg-pink-600/10 text-pink-400 border-pink-600/20',
        indicator: '#E1306C',
      };
    case 'tiktok':
      return {
        name: 'TikTok',
        bg: 'bg-cyan-600/10 text-cyan-400 border-cyan-600/20',
        indicator: '#00F2FE',
      };
    case 'linkedin':
      return {
        name: 'LinkedIn',
        bg: 'bg-sky-600/10 text-sky-400 border-sky-600/20',
        indicator: '#0A66C2',
      };
    default:
      return {
        name: platform,
        bg: 'bg-zinc-700/20 text-zinc-300 border-zinc-700/40',
        indicator: '#71717A',
      };
  }
}
