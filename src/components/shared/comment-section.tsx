

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { getComments, addComment, deleteComment, deleteReply } from '@/lib/firebase/firestore';
import type { Comment, Reply, User } from '@/lib/types';
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
import { Trash2 } from 'lucide-react';


function CommentWithReplies({ 
    comment, 
    onReplySubmit,
    onDelete,
    currentUser
}: { 
    comment: Comment | Reply, 
    onReplySubmit: (text: string, parentId: string) => void, 
    onDelete: (commentId: string, reply?: Reply) => void,
    currentUser: User | null
}) {
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleReplyClick = (commentId: string) => {
        setReplyingTo(replyingTo === commentId ? null : commentId);
        setReplyText('');
    };

    const handleReplySubmit = (e: React.FormEvent, parentId: string) => {
        e.preventDefault();
        onReplySubmit(replyText, parentId);
        setReplyingTo(null);
        setReplyText('');
    };

    const isTopLevelComment = 'replies' in comment;
    const canDelete = currentUser && (
        ['Moderator', 'Administrator', 'Author'].includes(currentUser.role) ||
        currentUser.id === comment.authorId
    );

    return (
        <div className="flex items-start space-x-4">
            <Avatar>
                <AvatarImage src={comment.authorAvatarUrl} alt={comment.author} />
                <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <p className="font-semibold">{comment.author}</p>
                    <p className="text-xs text-muted-foreground">
                        {isClient && comment.date ? formatDistanceToNow(comment.date.toDate(), { addSuffix: true }) : '...'}
                    </p>
                </div>
                <p className="text-muted-foreground mt-1">{comment.text}</p>
                <div className="flex items-center gap-2">
                    {currentUser && isTopLevelComment && (
                        <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => handleReplyClick(comment.id)}>
                            Reply
                        </Button>
                    )}
                    {canDelete && (
                        <>
                        {isTopLevelComment && <span className="text-xs text-muted-foreground">•</span>}
                         <Button variant="link" size="sm" className="p-0 h-auto text-xs text-destructive" onClick={() => onDelete(comment.id, isTopLevelComment ? undefined : comment as Reply)}>
                            Delete
                        </Button>
                        </>
                    )}
                </div>

                {replyingTo === comment.id && isTopLevelComment && (
                    <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mt-2 space-y-2">
                        <Textarea
                            placeholder={`Replying to ${comment.author}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={2}
                        />
                        <div className="flex gap-2">
                            <Button type="submit" size="sm">Post Reply</Button>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Cancel</Button>
                        </div>
                    </form>
                )}

                {isTopLevelComment && comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-4 pl-6 border-l">
                        {comment.replies.map((reply) => (
                           <CommentWithReplies key={reply.id} comment={reply} onReplySubmit={onReplySubmit} onDelete={onDelete} currentUser={currentUser} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<{commentId: string, reply?: Reply} | null>(null);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(5);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const isLoggedIn = !!user;

  const fetchComments = async () => {
    try {
        setLoading(true);
        const fetchedComments = await getComments(postId);
        setComments(fetchedComments);
    } catch (error) {
        console.error("Failed to fetch comments:", error);
        toast({ title: 'Error', description: 'Could not load comments.', variant: 'destructive'});
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    if (postId) {
        fetchComments();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleCommentSubmit = async (text: string, parentId?: string) => {
      if (!user) return;

      if (text.trim() === '') {
        toast({ title: 'Empty Comment', description: 'Please write something.', variant: 'destructive'});
        return;
      }

      try {
        await addComment(postId, text, parentId);
        toast({ title: 'Success', description: `Your ${parentId ? 'reply' : 'comment'} has been posted.` });
        if (!parentId) setNewComment('');
        fetchComments(); // Refresh comments
      } catch (error) {
          console.error('Failed to post comment:', error);
          toast({ title: 'Error', description: 'Failed to post your comment.', variant: 'destructive'});
      }
  };

  const handleDeleteClick = (commentId: string, reply?: Reply) => {
      setCommentToDelete({ commentId, reply });
      setIsAlertOpen(true);
  }

  const handleDeleteConfirm = async () => {
    if (!commentToDelete) return;
    try {
        if (commentToDelete.reply) {
            await deleteReply(commentToDelete.commentId, commentToDelete.reply);
        } else {
            await deleteComment(commentToDelete.commentId);
        }
        toast({ title: 'Success', description: 'The comment has been deleted.' });
        fetchComments(); // Refresh comments
    } catch (error) {
        console.error('Failed to delete comment:', error);
        toast({ title: 'Error', description: 'Failed to delete the comment.', variant: 'destructive'});
    } finally {
        setIsAlertOpen(false);
        setCommentToDelete(null);
    }
  }
  
  const totalComments = comments.reduce((acc, comment) => acc + 1 + (comment.replies?.length || 0), 0);

  const visibleComments = comments.slice(0, visibleCommentsCount);

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent>
        {authLoading ? <Skeleton className="h-32 w-full" /> : !isLoggedIn ? (
            <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">You must be logged in to leave a comment.</p>
                <div className="mt-4 flex justify-center gap-4">
                    <Button asChild><Link href={`/login?redirect=/blog/${postId}`} scroll={false}>Login</Link></Button>
                    <Button asChild variant="outline"><Link href="/register" scroll={false}>Register</Link></Button>
                </div>
            </div>
        ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleCommentSubmit(newComment); }} className="space-y-4">
                <div>
                    <label htmlFor="comment" className="sr-only">Your Comment</label>
                    <Textarea
                    id="comment"
                    placeholder="Write your comment here..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={4}
                    />
                </div>
                <Button type="submit">Post Comment</Button>
            </form>
        )}

        <Separator className="my-8" />
        
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">{totalComments} Comments</h3>
            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            ) : comments.length > 0 ? (
                <>
                    {visibleComments.map((comment) => (
                        <CommentWithReplies key={comment.id} comment={comment} onReplySubmit={(text, parentId) => handleCommentSubmit(text, parentId)} onDelete={handleDeleteClick} currentUser={user} />
                    ))}
                    {comments.length > visibleCommentsCount && (
                        <Button variant="link" onClick={() => setVisibleCommentsCount(comments.length)}>
                            Show all {comments.length - visibleCommentsCount} comments
                        </Button>
                    )}
                    {visibleCommentsCount > 5 && (
                        <Button variant="link" onClick={() => setVisibleCommentsCount(5)}>
                            Show less
                        </Button>
                    )}
                </>
            ) : (
                <p className="text-muted-foreground text-center py-8">Be the first to leave a comment!</p>
            )}
        </div>
      </CardContent>
    </Card>

     <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this comment.
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
