
import { Suspense } from 'react';
import { CarListingsClient } from './car-listings-client';
import { Skeleton } from '@/components/ui/skeleton';
import { getCars } from '@/lib/firebase/firestore';
import type { Vehicle } from '@/lib/types';
import { toISODate } from '@/lib/utils';

async function fetchInitialCars(): Promise<Vehicle[]> {
    const { vehicles } = await getCars({ all: true });
    return vehicles.map(v => ({
        ...v,
        createdAt: toISODate(v.createdAt),
    })) as Vehicle[];
}

export default async function CarListings() {
    
  const initialVehicles = await fetchInitialCars();

  function CarListingsSkeleton() {
    return (
        <>
            <div className="flex justify-end mb-8">
              <Skeleton className="h-12 w-40" />
            </div>
            <Skeleton className="h-32 w-full mb-8" />
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
