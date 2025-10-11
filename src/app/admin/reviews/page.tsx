

'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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
import { Star, Trash2 } from 'lucide-react';
import { getAllReviews, deleteReview } from '@/lib/firebase/firestore';
import type { Review } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ModerateReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const { toast } = useToast();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const allReviews = await getAllReviews();
      setReviews(allReviews);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast({ title: 'Error', description: 'Could not fetch reviews.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteClick = (review: Review) => {
    setReviewToDelete(review);
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;
    try {
      await deleteReview(reviewToDelete.id);
      toast({
        title: 'Review Deleted',
        description: 'The review has been successfully deleted.',
      });
      fetchReviews();
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the review.',
        variant: 'destructive',
      });
    } finally {
      setReviewToDelete(null);
    }
  };
  
  const getItemLink = (review: Review) => {
    return review.itemType === 'business' ? `/services/${review.itemId}` : `/cars/${review.itemId}`;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Moderate Reviews</CardTitle>
          <CardDescription>
            View and delete user-submitted reviews to maintain content quality.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No reviews found.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Author</TableHead>
                    <TableHead>Item Reviewed</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>{review.author}</TableCell>
                      <TableCell>
                        <Link href={getItemLink(review)} className="hover:underline font-medium">
                            {review.itemTitle}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn("h-4 w-4", i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                            ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{review.text}</TableCell>
                      <TableCell>{format(review.createdAt.toDate(), 'PPP')}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(review)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!reviewToDelete} onOpenChange={(open) => !open && setReviewToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
