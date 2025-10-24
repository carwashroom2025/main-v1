
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Edit, ImageIcon, MoreHorizontal, Trash2, Eye } from 'lucide-react';
import type { BlogPost } from '@/lib/types';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { BlogPostForm } from '../admin/blog-post-form';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import { deleteBlogPost } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';

type BlogCardProps = {
  post: BlogPost;
  priority?: boolean;
  view?: 'grid' | 'list';
};

export function BlogCard({ post, priority = false, view = 'grid' }: BlogCardProps) {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const canManagePost = user && (user.id === post.authorId || ['Moderator', 'Administrator'].includes(user.role));

  const handleDataChange = () => {
    router.refresh();
  };

  const handleDeleteClick = () => {
    setIsAlertOpen(true);
  }

  const handleDeleteConfirm = async () => {
    try {
        await deleteBlogPost(post.id);
        toast({
            title: "Post Deleted",
            description: `"${post.title}" has been successfully deleted.`,
        });
        handleDataChange(); 
    } catch (error: any) {
        console.error("Failed to delete post:", error);
        toast({
            title: "Error",
            description: error.message || "Failed to delete post. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsAlertOpen(false);
    }
  }

  if (view === 'list') {
      return (
            <>
            <Card className="overflow-hidden group flex flex-col md:flex-row relative h-full">
                {canManagePost && (
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/50 hover:bg-background/80">
                        <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => setIsFormOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={handleDeleteClick} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                )}
                <Link href={`/blog/${post.slug}`} scroll={false} className="relative block aspect-video md:w-1/3 md:h-auto md:flex-shrink-0">
                    {post.imageUrl ? (
                    <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={priority}
                    />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                    )}
                </Link>
                <CardContent className="p-6 flex flex-col flex-1">
                <div className="mb-2">
                    <Badge variant="default">{post.category}</Badge>
                </div>
                <h3 className="text-xl font-bold mb-2 leading-snug flex-grow">
                    <Link href={`/blog/${post.slug}`} scroll={false} className="hover:text-primary transition-colors">
                    {post.title}
                    </Link>
                </h3>
                <p className="text-muted-foreground mb-4 line-clamp-2 flex-grow">{post.excerpt}</p>
                <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground mt-auto">
                    <div className="flex items-center gap-2">
                        <User className="mr-2 h-4 w-4" />
                        <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>{format(new Date(post.date), 'MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        <span>{post.views || 0} views</span>
                    </div>
                </div>
                </CardContent>
            </Card>
            {canManagePost && (
                    <BlogPostForm
                        isOpen={isFormOpen}
                        setIsOpen={setIsFormOpen}
                        post={post}
                        onDataChange={handleDataChange}
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
      )
  }

  return (
    <>
      <Card className="group flex flex-col h-full bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300">
        <Link href={`/blog/${post.slug}`} scroll={false} className="relative block aspect-video">
            {post.imageUrl ? (
            <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={priority}
            />
            ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
            )}
            <Badge variant="secondary" className="absolute top-3 left-3">{post.category}</Badge>
        </Link>
        <CardContent className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold mb-2 flex-grow group-hover:text-primary transition-colors">
            <Link href={`/blog/${post.slug}`} scroll={false}>
              {post.title}
            </Link>
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
          <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground mt-auto pt-4 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(post.date), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  <span>{post.views || 0} views</span>
              </div>
          </div>
        </CardContent>
      </Card>
      {canManagePost && (
            <BlogPostForm
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                post={post}
                onDataChange={handleDataChange}
            />
        )}
      </>
  );
}
