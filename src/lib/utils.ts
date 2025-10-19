import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const toISODate = (date: Timestamp | { seconds: number, nanoseconds: number } | string | undefined): string | undefined => {
  if (!date) return undefined;
  if (typeof date === 'string') return date;
  
  if (date instanceof Timestamp) {
    return date.toDate().toISOString();
  }

  // Handle plain objects that look like Timestamps
  if (typeof date === 'object' && 'seconds' in date && 'nanoseconds' in date) {
    return new Timestamp(date.seconds, date.nanoseconds).toDate().toISOString();
  }
  
  return undefined;
};
