
'use client';

import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { getBlogPost, getRelatedBlogPosts } from '@/lib/firebase/firestore';
import { blogAuthors } from '@/lib/blog-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Clock, Calendar, ImageIcon } from 'lucide-react';
import { CommentSection } from '@/components/shared/comment-section';
import { Separator } from '@/components/ui/separator';
import { ShareButtons } from '@/components/blog/share-buttons';
import { AuthorBio } from '@/components/blog/author-bio';
import type { BlogPost } from '@/lib/types';
import { RelatedPosts } from '@/components/blog/related-posts';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

export default function BlogPostPage() {
  const params = useParams();
  const postId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

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
  
  return (
    <>
    <title>{`${post.title} | Carwashroom`}</title>
    <div className="max-w-4xl mx-auto">
        <article>
          <header className="mb-8 text-center">
              <div className="mb-4">
                  <Badge variant="default">{post.category}</Badge>
              </div>
              <div className="flex items-center justify-center gap-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    {post.title}
                </h1>
              </div>
              <div className="mt-4 flex justify-center items-center gap-6 text-muted-foreground text-sm">
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
              </div>
          </header>

          {post.imageUrl ? (
            <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
             <div className="relative aspect-video rounded-lg overflow-hidden mb-8 bg-muted flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground" />
             </div>
          )}

          <div
            className="prose prose-lg dark:prose-invert mx-auto prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-8 flex justify-end">
              <ShareButtons post={serializablePost as BlogPost} />
          </div>
        </article>

        <Separator className="my-12" />

        <div className="mt-12">
          <AuthorBio author={post.author} />
        </div>

        <Separator className="my-12" />
        
        {relatedPosts.length > 0 && (
          <>
            <RelatedPosts posts={relatedPosts} />
            <Separator className="my-12" />
          </>
        )}

        <div className="mt-12">
          <CommentSection postId={post.id} />
        </div>
    </div>
    </>
  );
}
