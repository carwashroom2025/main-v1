
'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type StarRatingProps = {
  rating: number;
  totalStars?: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
};

const sizeClasses = {
    sm: { icon: 'h-4 w-4' },
    md: { icon: 'h-5 w-5' },
    lg: { icon: 'h-6 w-6' },
};

export function StarRating({ rating, totalStars = 5, reviewCount, size = 'md', showCount = true }: StarRatingProps) {
  const fullStars = Math.round(rating);
  const emptyStars = totalStars - fullStars;

  const { icon } = sizeClasses[size];

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className={cn(icon, "text-yellow-400 fill-yellow-400")} />
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className={cn(icon, "text-muted-foreground")} />
        ))}
      </div>
      {showCount && reviewCount !== undefined && (
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{rating.toFixed(1)}</span>
          {` (${reviewCount})`}
        </p>
      )}
    </div>
  );
}
