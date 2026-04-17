import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function calcFinalScore(
  aiScore: number,
  examScore: number,
  userRating: number
): number {
  return aiScore * 0.7 + examScore * 0.2 + userRating * 0.1;
}

export function formatPoints(points: number): string {
  if (points >= 1_000_000) return `${(points / 1_000_000).toFixed(1)}M`;
  if (points >= 1_000) return `${(points / 1_000).toFixed(1)}K`;
  return points.toString();
}

export function pointsToUSD(points: number): number {
  return points * 0.001; // 1000 points = $1
}
