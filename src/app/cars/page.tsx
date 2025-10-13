
import Image from 'next/image';
import { Suspense } from 'react';
import CarListings from './car-listings';
import { Skeleton } from '@/components/ui/skeleton';

export default function CarsPage() {
  return (
    <>
      <div className="relative py-12 md:py-16 text-center text-white overflow-hidden">
        <Image
            src="https://images.unsplash.com/photo-1610475426528-f5565ecca5bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNXx8YmxhY2slMjBjYXJ8ZW58MHx8fHwxNzU4Njg1MDkyfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Car database background"
            fill
            className="object-cover"
            priority
            data-ai-hint="car"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="container relative">
          <h1 className="text-4xl font-bold tracking-tight">Car Database</h1>
          <p className="mt-2 text-lg text-white/80">
            Browse and filter our extensive collection of vehicles.
          </p>
        </div>
      </div>
      <div className="container py-12">
        <Suspense fallback={<CarListingsSkeleton />}>
            <CarListings />
        </Suspense>
      </div>
    </>
  );
}

function CarListingsSkeleton() {
    return (
        <>
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
