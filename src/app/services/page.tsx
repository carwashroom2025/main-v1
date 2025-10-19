
import { getBusinesses, getCategories } from '@/lib/firebase/firestore';
import { ServiceListings } from '@/components/services/service-listings';
import type { Business, Category } from '@/lib/types';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Timestamp } from 'firebase/firestore';
import { ServiceFilters } from '@/components/services/service-filters';
import { toISODate } from '@/lib/utils';

export default async function ServicesPage() {
  const [businessListings, categories] = await Promise.all([
    getBusinesses(),
    getCategories()
  ]);

  const serializableBusinessListings = businessListings.map(business => ({
    ...business,
    createdAt: toISODate(business.createdAt),
  }));

  const serializableCategories = categories.map(category => ({
      ...category,
      createdAt: toISODate(category.createdAt),
  }));

  const fetchBusinesses = async () => {
    'use server';
    const businesses = await getBusinesses();
    return businesses.map(business => ({
        ...business,
        createdAt: toISODate(business.createdAt),
    }));
  };

  return (
    <Suspense fallback={<ServiceListingsSkeleton/>}>
        <ServiceListings
            initialBusinessListings={serializableBusinessListings as unknown as Business[]}
            categories={serializableCategories as Category[]}
            fetchBusinessesAction={fetchBusinesses}
        />
    </Suspense>
  );
}


function ServiceListingsSkeleton() {
    return (
        <div className="space-y-8">
            <Skeleton className="h-32 w-full" />
             <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <aside className="md:col-span-1">
                    <Skeleton className="h-64 w-full" />
                </aside>
                <main className="md:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Skeleton className="h-96 w-full" />
                        <Skeleton className="h-96 w-full" />
                        <Skeleton className="h-96 w-full" />
                        <Skeleton className="h-96 w-full" />
                        <Skeleton className="h-96 w-full" />
                        <Skeleton className="h-96 w-full" />
                    </div>
                </main>
            </div>
        </div>
    )
}
