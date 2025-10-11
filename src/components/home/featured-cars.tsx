
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VehicleCard } from '@/components/cars/vehicle-card';
import type { Vehicle } from '@/lib/types';
import { getRecentCars } from '@/lib/firebase/firestore';
import { Skeleton } from '../ui/skeleton';

export function FeaturedCars() {
  const [filter, setFilter] = useState('All');
  const [recentVehicles, setRecentVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentCars() {
      setLoading(true);
      const cars = await getRecentCars(6);
      setRecentVehicles(cars);
      setLoading(false);
    }
    fetchRecentCars();
  }, []);

  const filteredVehicles = recentVehicles
    .filter((vehicle) => {
      if (filter === 'All') return true;
      if (filter === 'New') return vehicle.status === 'New';
      if (filter === 'Top') return true; // Keep all for sorting
      return false;
    })
    .sort((a, b) => {
      if (filter === 'Top') {
        return (b.averageRating || 0) - (a.averageRating || 0);
      }
      return 0; // Keep original order for other filters
    })
    .slice(0, 3);

  const vehicleCategories = ['All', 'New', 'Top'];

  return (
    <section className="py-12 md:py-24 bg-secondary">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Featured Cars</h2>
             <p className="mt-2 text-muted-foreground">
                Check out our handpicked selection of quality vehicles.
            </p>
          <div className="mt-4 flex justify-center">
            <Tabs defaultValue="All" onValueChange={setFilter} className="w-full md:w-auto">
              <TabsList className="w-full md:w-auto">
                {vehicleCategories.map((category) => (
                  <TabsTrigger key={category} value={category} className="flex-1 md:flex-none">{category}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVehicles.map((vehicle) => (
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
