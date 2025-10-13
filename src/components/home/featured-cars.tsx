
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { VehicleCard } from '@/components/cars/vehicle-card';
import type { Vehicle } from '@/lib/types';
import { getRecentCars } from '@/lib/firebase/firestore';
import { Skeleton } from '../ui/skeleton';

export function FeaturedCars() {
  const [recentVehicles, setRecentVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentCars() {
      setLoading(true);
      const cars = await getRecentCars(3);
      setRecentVehicles(cars);
      setLoading(false);
    }
    fetchRecentCars();
  }, []);

  return (
    <section className="py-12 md:py-24 bg-secondary">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Explore Cars</h2>
             <p className="mt-2 text-muted-foreground">
                Check out our handpicked selection of quality vehicles.
            </p>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link href="/cars">View All Cars</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
