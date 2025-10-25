
'use client';

import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { getBlogPost, getRelatedBlogPosts, deleteBlogPost } from '@/lib/firebase/firestore';
import { blogAuthors } from '@/lib/blog-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Clock, Calendar, ImageIcon, ArrowLeft, MoreHorizontal, Trash2, Edit, Eye } from 'lucide-react';
import { CommentSection } from '@/components/shared/comment-section';
import { Separator } from '@/components/ui/separator';
import { ShareButtons } from '@/components/blog/share-buttons';
import type { BlogPost } from '@/lib/types';
import { RelatedPosts } from '@/components/blog/related-posts';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { BlogSidebar } from '@/components/blog/blog-sidebar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BlogPostForm } from '@/components/admin/blog-post-form';
import { useAuth } from '@/context/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const { id: postId } = params;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


  const fetchPostData = async () => {
    if (!postId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const postData = await getBlogPost(postId as string);
    if (postData) {
      setPost(postData);
      const related = await getRelatedBlogPosts(postData, 3);
      setRelatedPosts(related);
    } else {
      notFound();
    }
    setLoading(false);
  };
  
  useEffect(() => {
    if (postId) {
      fetchPostData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);
  
  const handleDeleteConfirm = async () => {
    if (!post) return;
    try {
        await deleteBlogPost(post.id);
        toast({
            title: "Post Deleted",
            description: `"${post.title}" has been successfully deleted.`,
        });
        router.push('/blog');
    } catch (error: any) {
        toast({
            title: "Error",
            description: error.message || "Failed to delete post.",
            variant: "destructive",
        });
    } finally {
        setIsAlertOpen(false);
    }
  }

  if (loading || !post) {
    return (
        <div className="max-w-4xl mx-auto py-8">
            <Skeleton className="h-10 w-1/4 mx-auto mb-4" />
            <Skeleton className="h-16 w-3/4 mx-auto mb-6" />
            <Skeleton className="h-8 w-1/2 mx-auto mb-8" />
            <Skeleton className="aspect-video w-full mb-8" />
            <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
            </div>
        </div>
    );
  }

  const authorDetails = blogAuthors.find(author => author.name === post.author);
  const authorImage = authorDetails ? PlaceHolderImages.find((img) => img.id === authorDetails.imageId) : undefined;

  const serializablePost = {
    ...post,
    date: post.date,
    createdAt: post.createdAt?.toString(),
    updatedAt: post.updatedAt?.toString(),
  };

  const canManagePost = user && (user.id === post.authorId || ['Moderator', 'Administrator'].includes(user.role));
  
  return (
    <>
    <title>{`${post.title} | Carwashroom`}</title>
    <div className="container py-12">
        <div className="flex justify-between items-center mb-6">
            <div>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary flex items-center mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Blog
                </Link>
            </div>
            {canManagePost && (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => setIsFormOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setIsAlertOpen(true)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
            <main className="lg:col-span-3">
                <article>
                    {post.imageUrl ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
                        <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                        />
                         <div className="absolute top-4 left-4">
                             <Badge variant="default">{post.category}</Badge>
                         </div>
                        </div>
                    ) : (
                        <div className="relative aspect-video rounded-lg overflow-hidden mb-8 bg-muted flex items-center justify-center">
                            <ImageIcon className="h-16 w-16 text-muted-foreground" />
                        </div>
                    )}
                    
                    <header className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            {post.title}
                        </h1>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-muted-foreground text-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    {authorImage && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={authorImage.imageUrl} alt={post.author} />
                                            <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <span>by {post.author}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{format(new Date(post.date), 'MMMM d, yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{post.readTime} min read</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    <span>{post.views || 0} views</span>
                                </div>
                            </div>
                            <ShareButtons post={serializablePost as BlogPost} />
                        </div>
                    </header>

                    <div
                        className="prose prose-lg dark:prose-invert mx-auto prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                </article>

                
                {post.tags && post.tags.length > 0 && (
                    <>
                        <Separator className="my-12" />
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-2">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map(tag => (
                                    <Badge key={tag} variant="secondary">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                <Separator className="my-12" />

                <div className="mt-12">
                    <CommentSection postId={post.id} />
                </div>
            </main>

            <aside className="lg:col-span-1">
                <BlogSidebar />
            </aside>
        </div>

        <Separator className="my-12" />
        
        {relatedPosts.length > 0 && (
            <div className="mt-12">
                <RelatedPosts posts={relatedPosts} />
            </div>
        )}
    </div>
    
    {canManagePost && (
        <BlogPostForm 
            isOpen={isFormOpen} 
            setIsOpen={setIsFormOpen} 
            post={post} 
            onDataChange={fetchPostData}
        />
    )}
     <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the post
                "{post.title}".
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
