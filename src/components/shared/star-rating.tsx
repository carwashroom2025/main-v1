
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
    sm: { box: 'h-5 w-5', icon: 'h-3 w-3' },
    md: { box: 'h-6 w-6', icon: 'h-4 w-4' },
    lg: { box: 'h-8 w-8', icon: 'h-5 w-5' },
};

export function StarRating({ rating, totalStars = 5, reviewCount, size = 'md', showCount = true }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const partialStarPercentage = (rating - fullStars) * 100;
  const hasPartialStar = partialStarPercentage > 0;
  const emptyStars = totalStars - fullStars - (hasPartialStar ? 1 : 0);

  const { box, icon } = sizeClasses[size];

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <div key={`full-${i}`} className={cn(box, "flex items-center justify-center rounded bg-primary text-primary-foreground")}>
            <Star className={cn(icon, "fill-current")} />
          </div>
        ))}
        {hasPartialStar && (
          <div className={cn(box, "relative flex items-center justify-center rounded bg-muted text-muted-foreground")}>
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${partialStarPercentage}%` }}>
                <div className={cn(box, "flex items-center justify-center rounded bg-primary text-primary-foreground")}>
                    <Star className={cn(icon, "fill-current")} />
                </div>
            </div>
            <Star className={icon} />
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <div key={`empty-${i}`} className={cn(box, "flex items-center justify-center rounded bg-muted text-muted-foreground")}>
            <Star className={icon} />
          </div>
        ))}
      </div>
      {showCount && (
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{rating.toFixed(1)}</span>
          {reviewCount !== undefined && ` (${reviewCount})`}
        </p>
      )}
    </div>
  );
}
