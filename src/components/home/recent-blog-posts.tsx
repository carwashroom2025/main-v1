
'use client';

import { useState, useEffect } from 'react';
import { getRecentBlogPosts } from '@/lib/firebase/firestore';
import type { BlogPost } from '@/lib/types';
import { BlogCard } from '@/components/blog/blog-card';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

export function RecentBlogPosts() {
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const posts = await getRecentBlogPosts(6);
      setRecentPosts(posts);
      setLoading(false);
    }
    fetchPosts();
  }, []);

  return (
    <section className="container py-12 md:py-24">
      <div className="flex flex-col items-center text-center">
        <h2 className="text-3xl font-bold tracking-tight">Recent Blog Posts</h2>
        <p className="mt-2 text-muted-foreground">
          Stay updated with our latest news, tips, and stories.
        </p>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
          ))
        ) : (
          recentPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))
        )}
      </div>
       <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link href="/blog">View All Posts</Link>
          </Button>
        </div>
    </section>
  );
}

    