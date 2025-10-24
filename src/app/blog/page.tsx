

import { Suspense } from 'react';
import BlogListings from './blog-listings';
import { Skeleton } from '@/components/ui/skeleton';
import { BlogSidebar } from '@/components/blog/blog-sidebar';
import { BlogHeader } from '@/components/blog/blog-header';

export const dynamic = 'force-dynamic';

export default function BlogPage() {
  return (
    <div className="container py-12">
      <Suspense>
        <BlogHeader />
      </Suspense>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mt-8">
        <main className="lg:col-span-3">
          <Suspense fallback={<BlogPageSkeleton />}>
            <BlogListings />
          </Suspense>
        </main>
        <aside className="lg:col-span-1">
          <Suspense fallback={<BlogSidebarSkeleton />}>
            <BlogSidebar />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}

function BlogPageSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
                 <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            ))}
        </div>
    )
}

function BlogSidebarSkeleton() {
    return (
        <div className="sticky top-24 space-y-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    )
}
