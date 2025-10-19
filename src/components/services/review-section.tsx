

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import Link from 'next/link';
import { Star, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { getReviews, addReview, deleteReview } from '@/lib/firebase/firestore';
import type { Review } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ReviewSectionProps = {
    itemId: string;
    itemType: 'business' | 'vehicle';
    itemTitle: string;
    initialReviews: Review[];
}

export function ReviewSection({ itemId, itemType, itemTitle, initialReviews }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const isLoggedIn = !!user;

  const fetchReviews = async () => {
    try {
        setLoading(true);
        const fetchedReviews = await getReviews(itemId);
        const serializableReviews = fetchedReviews.map(review => ({
            ...review,
            createdAt: (review.createdAt as any).toDate().toISOString(),
        }));
        setReviews(serializableReviews as Review[]);
    } catch (error) {
        console.error("Failed to fetch reviews:", error);
        toast({ title: 'Error', description: 'Could not load reviews.', variant: 'destructive'});
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    // Ensure initial reviews are also in the correct string format,
    // though the parent component should already be doing this.
    const serializableInitialReviews = initialReviews.map(review => ({
        ...review,
        createdAt: typeof review.createdAt === 'string' 
            ? review.createdAt 
            : (review.createdAt as any).toDate().toISOString(),
    }));
    setReviews(serializableInitialReviews as Review[]);
  }, [initialReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast({ title: 'Authentication Error', description: 'You must be logged in to post a review.', variant: 'destructive'});
        return;
    }

    if (newReview.trim() === '' || rating === 0) {
        toast({
            title: 'Incomplete Review',
            description: 'Please enter a review and select a rating.',
            variant: 'destructive'
        });
      return;
    }

    try {
        await addReview({
            itemId,
            itemType,
            itemTitle,
            rating,
            text: newReview
        });
        setNewReview('');
        setRating(0);
        fetchReviews();
        toast({
            title: 'Review Submitted!',
            description: 'Thank you for your feedback.'
        });
    } catch (error) {
        console.error("Failed to submit review:", error);
        toast({
            title: 'Error',
            description: 'Failed to submit your review. Please try again.',
            variant: 'destructive'
        });
    }
  };

  const handleDeleteClick = (review: Review) => {
    setReviewToDelete(review);
    setIsAlertOpen(true);
  }

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;

    try {
        await deleteReview(reviewToDelete.id);
        fetchReviews();
        toast({ title: 'Review Deleted', description: 'The review has been successfully removed.' });
    } catch (error) {
        console.error('Failed to delete review:', error);
        toast({ title: 'Error', description: 'Failed to delete the review.', variant: 'destructive'});
    } finally {
        setIsAlertOpen(false);
        setReviewToDelete(null);
    }
  }

  const canDelete = (review: Review) => {
    if (!user) return false;
    if (user.id === review.userId) return true;
    if (['Moderator', 'Administrator'].includes(user.role)) return true;
    return false;
  }
  
  const redirectPath = itemType === 'business' ? `/services/${itemId}` : `/cars/${itemId}`;

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Leave a Review</CardTitle>
      </CardHeader>
      <CardContent>
        {authLoading ? <Skeleton className="h-48 w-full" /> : !isLoggedIn ? (
             <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">You must be logged in to leave a review.</p>
                <div className="mt-4 flex justify-center gap-4">
                    <Button asChild>
                        <Link href={`/login?redirect=${redirectPath}`}>Login</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/register">Register</Link>
                    </Button>
                </div>
            </div>
        ) : (
           <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="rating" className="block text-sm font-medium text-muted-foreground mb-2">Your Rating</label>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                onClick={() => setRating(star)}
                                className="focus:outline-none"
                            >
                                <Star className={cn("h-6 w-6", rating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300')} />
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="review" className="sr-only">Your Review</label>
                    <Textarea
                    id="review"
                    placeholder="Write your review here..."
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    rows={4}
                    />
                </div>
                <Button type="submit">Post Review</Button>
            </form>
        )}

        <Separator className="my-8" />
        
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">{reviews.length} Reviews</h3>
          {loading ? (
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
                <div key={review.id} className="flex items-start space-x-4">
                <Avatar>
                    <AvatarImage src={review.authorAvatarUrl} alt={review.author} />
                    <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold">{review.author}</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={cn("h-4 w-4", i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300')} />
                        ))}
                    </div>
                    <p className="text-muted-foreground mt-2">{review.text}</p>
                    {canDelete(review) && (
                        <Button variant="ghost" size="sm" className="mt-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteClick(review)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    )}
                </div>
                </div>
            ))
          ) : (
             <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Be the first to leave a review!</p>
             </div>
          )}
        </div>
      </CardContent>
    </Card>
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this review.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                Delete
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
