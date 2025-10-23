
import { Suspense } from 'react';
import BlogListings from './blog-listings';
import { Skeleton } from '@/components/ui/skeleton';
import { BlogSidebar } from '@/components/blog/blog-sidebar';
import { BlogHeader } from '@/components/blog/blog-header';

export const dynamic = 'force-dynamic';

export default function BlogPage() {
  return (
    <>
      <Suspense>
        <BlogHeader />
      </Suspense>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <main className="lg:col-span-2">
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
    </>
  );
}

function BlogPageSkeleton() {
    return (
        <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
                 <div key={i} className="flex gap-6">
                    <Skeleton className="h-48 w-1/3" />
                    <div className="w-2/3 space-y-4">
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
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
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
    )
}
