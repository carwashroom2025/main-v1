
import { FaqPageClient } from "@/components/faq/faq-page-client";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ForumPage() {
  return (
    <Suspense fallback={<FaqPageSkeleton />}>
      <FaqPageClient />
    </Suspense>
  );
}

function FaqPageSkeleton() {
    return (
        <div className="container py-12 md:py-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <Skeleton className="h-10 w-48" />
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-64" />
                </div>
            </div>
            <Skeleton className="h-12 w-full mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full" />
                ))}
            </div>
        </div>
    )
}
