
'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Share2, Heart } from 'lucide-react';
import type { Vehicle } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

type CarDetailHeaderProps = {
  vehicle: Vehicle;
  averageRating: number;
  reviewCount: number;
};

export function CarDetailHeader({ vehicle, averageRating, reviewCount }: CarDetailHeaderProps) {
    const { toast } = useToast();
    const { user, loading, toggleFavoriteCar } = useAuth();
    const isFavorite = user?.favoriteCars?.includes(vehicle.id);

    const handleShare = async () => {
        const shareData = {
          title: vehicle.name,
          text: `Check out this ${vehicle.name}!`,
          url: window.location.href,
        };
    
        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (error) {
             const domError = error as DOMException;
             if (domError.name !== 'AbortError' && domError.name !== 'NotAllowedError') {
                console.error('Error sharing:', error);
                copyToClipboard();
            }
          }
        } else {
          // Fallback for browsers that don't support the Web Share API
          copyToClipboard();
        }
      };

      const copyToClipboard = () => {
        if (!navigator.clipboard) {
            toast({
                title: 'Copy failed',
                description: 'Clipboard API is not available in this browser.',
                variant: 'destructive',
            });
            return;
        }
        navigator.clipboard.writeText(window.location.href).then(() => {
            toast({
                title: 'Link Copied!',
                description: 'The page URL has been copied to your clipboard.',
            });
        }).catch(err => {
            console.error('Failed to copy: ', err);
            toast({
                title: 'Failed to Copy',
                description: 'Could not copy the link to your clipboard.',
                variant: 'destructive',
            });
        });
      }

      const handleFavoriteClick = () => {
        if (!user) {
          toast({
            title: "Please log in",
            description: "You need to be logged in to favorite a car.",
            variant: "destructive"
          });
          return;
        }
        toggleFavoriteCar(vehicle.id);
      }

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{`${vehicle.make} ${vehicle.model} ${vehicle.year}`}</h1>
        <p className="mt-1 text-muted-foreground">{`${vehicle.make} / ${vehicle.model} / ${vehicle.year}`}</p>
      </div>
      <div className="flex items-center gap-2 mt-4 md:mt-0">
         <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                     <Button variant="ghost" className="flex items-center gap-1 p-2">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <span className="font-bold text-lg text-foreground">
                            {averageRating.toFixed(1)}
                        </span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <Button variant="ghost" size="icon" onClick={handleFavoriteClick} disabled={loading}>
          <Heart className={cn("h-5 w-5", isFavorite && "fill-red-500 text-red-500")} />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleShare}>
          <Share2 className="h-5 w-5" />
        </Button>
        {vehicle.status && (
            <Badge
            variant={vehicle.status === 'New' ? 'default' : 'secondary'}
            className="text-sm py-1 px-3"
            >
            {vehicle.status}
            </Badge>
        )}
      </div>
    </div>
  );
}
