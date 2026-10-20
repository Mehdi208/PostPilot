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

export function getStatusBadge(status: string) {
  switch (status) {
    case 'approved':
      return {
        label: 'Validé',
        color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        dot: 'bg-emerald-500',
      };
    case 'pending_review':
      return {
        label: 'En attente client',
        color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        dot: 'bg-amber-500',
      };
    case 'changes_requested':
      return {
        label: 'Retouche demandée',
        color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        dot: 'bg-rose-500',
      };
    case 'published':
      return {
        label: 'Publié',
        color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        dot: 'bg-blue-500',
      };
    case 'scheduled':
      return {
        label: 'Programmé',
        color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        dot: 'bg-purple-500',
      };
    case 'draft':
    default:
      return {
        label: 'Brouillon',
        color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        dot: 'bg-zinc-500',
      };
  }
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
