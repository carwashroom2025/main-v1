
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { getBusinesses } from '@/lib/firebase/firestore';
import type { Business } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ListingCard } from '@/components/services/listing-card';

export function FavoriteBusinessesTab() {
  const { user } = useAuth();
  const [favoriteBusinesses, setFavoriteBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.favoriteBusinesses && user.favoriteBusinesses.length > 0) {
      setLoading(true);
      const fetchFavorites = async () => {
        try {
            const businesses = await getBusinesses({ ids: user.favoriteBusinesses });
            setFavoriteBusinesses(businesses);
        } catch (e) {
            console.error(e);
            setFavoriteBusinesses([]);
        } finally {
            setLoading(false);
        }
      };
      fetchFavorites();
    } else {
      setFavoriteBusinesses([]);
      setLoading(false);
    }
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Favorite Businesses</CardTitle>
        <CardDescription>A list of businesses you have saved.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        ) : favoriteBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favoriteBusinesses.map((business) => (
              <ListingCard key={business.id} listing={business} />
            ))}
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
            You have not favorited any businesses yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
