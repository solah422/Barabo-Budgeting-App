import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'MVR') {
  return new Intl.NumberFormat('en-MV', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-MV', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
