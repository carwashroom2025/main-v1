
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Share2, Heart, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Business, Category } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { BusinessForm } from '@/components/admin/business-form';
import { ClaimBusinessButton } from './claim-business-button';


type BusinessDetailHeaderProps = {
  business: Business;
  averageRating: number;
  reviewCount: number;
  categories: Category[];
};

export function BusinessDetailHeader({ business, averageRating, reviewCount, categories }: BusinessDetailHeaderProps) {
    const { toast } = useToast();
    const { user, loading, toggleFavoriteBusiness } = useAuth();
    const router = useRouter();
    const isFavorite = user?.favoriteBusinesses?.includes(business.id);
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const canEdit = user && (['Author', 'Moderator', 'Administrator'].includes(user.role) || user.id === business.ownerId);
    const isOwned = !!business.ownerId;


    const handleShare = async () => {
        const shareData = {
          title: business.title,
          text: `Check out this business: ${business.title}!`,
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
                description: "You need to be logged in to favorite a business.",
                variant: "destructive"
            });
            router.push('/login');
            return;
        }
        toggleFavoriteBusiness(business.id);
      }
      
      const onDataChange = () => {
        setIsFormOpen(false);
        router.refresh();
      }

  return (
    <>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-4xl font-bold tracking-tight">{business.title}</h1>
                <p className="mt-1 text-muted-foreground">{business.category}</p>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
                <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-5 w-5" />
                        <span className="font-bold text-lg text-foreground">
                        {averageRating.toFixed(1)}
                        </span>
                    </div>
                    </TooltipTrigger>
                    <TooltipContent>
                    <p>{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</p>
                    </TooltipContent>
                </Tooltip>
                </TooltipProvider>
                {!isOwned && <ClaimBusinessButton business={business} />}
                <Button variant="outline" size="icon" onClick={handleFavoriteClick} disabled={loading}>
                    <Heart className={cn("h-5 w-5", isFavorite && "fill-red-500 text-red-500")} />
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                </Button>
                {canEdit && (
                    <Button variant="outline" size="icon" onClick={() => setIsFormOpen(true)}>
                        <Edit className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </div>
        {canEdit && (
            <BusinessForm 
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                business={business}
                onDataChange={onDataChange}
                categories={categories}
            />
        )}
    </>
  );
}
