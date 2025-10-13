import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const toISODate = (date: Timestamp | string | undefined): string | undefined => {
  if (!date) return undefined;
  if (typeof date === 'string') return date;
  // Check if it's a Firestore Timestamp
  if (typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
    return date.toDate().toISOString();
  }
  return undefined;
};
