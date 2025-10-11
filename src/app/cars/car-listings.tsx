
import { Suspense } from 'react';
import { CarListingsClient } from './car-listings-client';
import { Skeleton } from '@/components/ui/skeleton';

export default function CarListings() {
    
  function CarListingsSkeleton() {
    return (
        <>
            <div className="bg-card p-6 rounded-lg shadow-md mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
            </div>
        </>
    )
  }

  return (
    <Suspense fallback={<CarListingsSkeleton />}>
        <CarListingsClient />
    </Suspense>
  );
}
