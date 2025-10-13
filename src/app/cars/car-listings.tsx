
import { Suspense } from 'react';
import { CarListingsClient } from './car-listings-client';
import { Skeleton } from '@/components/ui/skeleton';
import { getCars } from '@/lib/firebase/firestore';
import type { Vehicle } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

async function fetchInitialCars() {
    const { vehicles } = await getCars({ all: true });
    return vehicles.map(v => ({
        ...v,
        createdAt: v.createdAt ? (v.createdAt as Timestamp).toDate().toISOString() : undefined,
    })) as Vehicle[];
}

export default async function CarListings() {
    
  const initialVehicles = await fetchInitialCars();

  function CarListingsSkeleton() {
    return (
        <>
            <div className="bg-card p-6 rounded-lg shadow-md mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Skeleton className="h-10 w-full" />
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
        <CarListingsClient initialVehicles={initialVehicles} />
    </Suspense>
  );
}
