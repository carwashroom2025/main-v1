
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
} from "@/components/ui/alert-dialog"
import type { BlogPost } from '@/lib/types';
import { deleteBlogPost } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { BlogPostForm } from './blog-post-form';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';

type BlogTableProps = {
  posts: BlogPost[];
  onDataChange: () => void;
};

export function BlogTable({ posts, onDataChange }: BlogTableProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
    const { toast } = useToast();
    const { user } = useAuth();

    const handleEdit = (post: BlogPost) => {
        setSelectedPost(post);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setSelectedPost(null);
        setIsFormOpen(true);
    }

    const handleDeleteClick = (post: BlogPost) => {
        setPostToDelete(post);
        setIsAlertOpen(true);
    }

    const handleDeleteConfirm = async () => {
        if (!postToDelete) return;
        try {
            await deleteBlogPost(postToDelete.id);
            toast({
                title: "Post Deleted",
                description: `"${postToDelete.title}" has been successfully deleted.`,
            });
            onDataChange();
        } catch (error: any) {
            console.error("Failed to delete post:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to delete post. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsAlertOpen(false);
            setPostToDelete(null);
        }
    }

    const canManagePost = (post: BlogPost) => {
      if (!user) return false;
      if (user.role === 'Administrator' || user.role === 'Moderator') return true;
      if (user.role === 'Author' && user.id === post.authorId) return true;
      return false;
    }

  return (
    <>
    <div className="flex justify-end mb-4">
        <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Post
        </Button>
    </div>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium">{post.title}</TableCell>
              <TableCell>{post.author}</TableCell>
              <TableCell>{post.category}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                    {post.tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
              </TableCell>
              <TableCell>{format(new Date(post.date), 'PPP')}</TableCell>
              <TableCell>
                {canManagePost(post) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/blog/${post.slug}`} className="flex justify-between w-full">
                            <span>View</span>
                            <Eye className="h-4 w-4" />
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleEdit(post)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleDeleteClick(post)} className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    <BlogPostForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        post={selectedPost}
        onDataChange={onDataChange}
    />

    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the post
                "{postToDelete?.title}".
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
