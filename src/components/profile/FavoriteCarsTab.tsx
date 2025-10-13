
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { getCars } from '@/lib/firebase/firestore';
import type { Vehicle } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { VehicleCard } from '@/components/cars/vehicle-card';

export function FavoriteCarsTab() {
  const { user } = useAuth();
  const [favoriteCars, setFavoriteCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.favoriteCars && user.favoriteCars.length > 0) {
      setLoading(true);
      const fetchFavorites = async () => {
        const { vehicles } = await getCars({ all: true });
        const userFavorites = vehicles.filter(car => user.favoriteCars!.includes(car.id));
        setFavoriteCars(userFavorites);
        setLoading(false);
      };
      fetchFavorites();
    } else {
      setFavoriteCars([]);
      setLoading(false);
    }
  }, [user]);

  return (
    <Card className="max-w-4xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>My Favorite Cars</CardTitle>
        <CardDescription>A list of cars you have saved.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        ) : favoriteCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteCars.map((car) => (
              <VehicleCard key={car.id} vehicle={car} />
            ))}
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
            You have not favorited any cars yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
