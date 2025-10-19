
import { getFeaturedBusinesses } from '@/lib/firebase/firestore';
import { ListingCard } from '@/components/services/listing-card';
import Link from 'next/link';
import { Button } from '../ui/button';
import type { Business } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';
import { toISODate } from '@/lib/utils';

export async function FeaturedBusinesses() {
  const featuredBusinesses: Business[] = await getFeaturedBusinesses(3);

  if (!featuredBusinesses || featuredBusinesses.length === 0) {
    return (
        <section className="container py-12 md:py-24">
            <div className="flex flex-col items-center text-center">
                <h2 className="text-3xl font-bold tracking-tight">Featured Businesses</h2>
                <p className="mt-2 text-muted-foreground">
                    No featured businesses found.
                </p>
            </div>
        </section>
    );
  }

  const serializableBusinesses = featuredBusinesses.map(business => ({
    ...business,
    createdAt: toISODate(business.createdAt),
  }));


  return (
    <section className="container py-12 md:py-24">
      <div className="flex flex-col items-center text-center">
        <h2 className="text-3xl font-bold tracking-tight">Featured Businesses</h2>
        <p className="mt-2 text-muted-foreground">
          Discover top-rated businesses in our network.
        </p>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {serializableBusinesses.map((listing) => (
          <ListingCard key={listing.id} listing={listing as Business} />
        ))}
      </div>
       <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link href="/services">View All Businesses</Link>
          </Button>
        </div>
    </section>
  );
}
